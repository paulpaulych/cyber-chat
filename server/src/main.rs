use actix::*;
use actix_files as fs;
use actix_web::{middleware::Logger, web, App, HttpServer};

use sqlx::postgres::PgPoolOptions;

mod domain;
mod infra;
mod application;

use infra::routes::webrtc::{webrtc_sender_route, webrtc_receiver_route};
use crate::application::security::jwt::Jwt;

use crate::application::signal_server::SignalServer;
use crate::application::user_store::UserStore;
use crate::infra::config::Config;
use crate::infra::pg::init_pg_pool;
use crate::infra::routes::login::login_route;
use crate::infra::routes::ui::ui_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = Config::init_from_env().unwrap();

    log::debug!("app config: {:?}", config);

    let pool = init_pg_pool(&config.pg_url).await.unwrap();

    let signal_server = SignalServer::new().start();

    let user_store = UserStore { pool: pool.clone() };
    let jwt_utils = Jwt::new("asdfjnasfduialskjfnaskjdfbnasiukfjbaskfjasbaksdjfbkasldfblkasdjfblaksjfblsak");

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(jwt_utils.clone()))
            .app_data(web::Data::new(user_store.clone()))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(signal_server.clone()))

            .configure(ui_routes)
            .configure(login_route)

            .route("/webrtc/room/{room_id}/sender",
                   web::get().to(webrtc_sender_route))
            .route("/webrtc/room/{room_id}/receiver",
                   web::get().to(webrtc_receiver_route))

            .service(fs::Files::new("/static", "./static"))
            .wrap(Logger::default())
    })
        .workers(2)
        .bind(("127.0.0.1", 8080))?
        .run();

    log::info!("starting HTTP server at http://localhost:8080");

    server.await
}
