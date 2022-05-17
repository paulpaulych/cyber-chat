use actix::*;
use actix_files as fs;
use actix_web::{middleware::Logger, web, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;

use sqlx::postgres::PgPoolOptions;

mod domain;
mod infra;
mod application;

use infra::routes::webrtc::{webrtc_sender_route, webrtc_receiver_route};
use crate::application::room_store::RoomStore;
use crate::application::security::jwt::Jwt;

use crate::application::signal_server::SignalServer;
use crate::application::user_store::UserStore;
use crate::infra::config::Config;
use crate::infra::pg::init_pg_pool;
use crate::infra::routes::auth::authenticate;
use crate::infra::routes::login::login;
use crate::infra::routes::rooms::{create_room, get_room};
use crate::infra::routes::ui::ui_routes;
use crate::infra::routes::users::get_me;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = Config::init_from_env().unwrap();
    log::debug!("app config: {:?}", config);

    let pool = init_pg_pool(&config.pg_url).await.unwrap();
    let signal_server = SignalServer::new().start();
    let user_store = UserStore { pool: pool.clone() };
    let room_store = RoomStore { pool: pool.clone() };
    let jwt_utils = Jwt::new(&config.jwt_secret);

    let server = HttpServer::new(move || {
        let auth = HttpAuthentication::bearer(authenticate);
        App::new()
            .app_data(web::Data::new(jwt_utils.clone()))
            .app_data(web::Data::new(user_store.clone()))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(signal_server.clone()))

            .route("/login", web::get().to(login))
            .service(web::scope("/api")
                .wrap(auth)
                .route("/users/me", web::get().to(get_me))
                .service(web::scope("/rooms")
                    .app_data(web::Data::new(room_store.clone()))
                    .route("", web::post().to(create_room)))
                    .route("/{room_id}", web::get().to(get_room))
                    .service(web::scope("/{room_id}/webrtc")
                        .route("/sender", web::get().to(webrtc_sender_route))
                        .route("/receiver", web::get().to(webrtc_receiver_route))))
            .configure(ui_routes)

            .service(fs::Files::new("/static", "./static"))
            .wrap(Logger::default())
    })
        .workers(2)
        .bind(("127.0.0.1", 8080))?
        .run();

    log::info!("starting HTTP server at http://localhost:8080");

    server.await
}
