use actix::*;
use actix_files as fs;
use actix_web::{middleware::Logger, web, App, HttpServer};

mod domain;
mod infra;
mod application;

use infra::routes::webrtc::{webrtc_sender_route, webrtc_receiver_route};

use crate::application::signal_server::SignalServer;
use crate::infra::config::Config;
use crate::infra::routes::ui::ui_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = Config::init_from_env().unwrap();

    log::debug!("app config: {:?}", config);

    let server = SignalServer::new().start();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(server.clone()))

            .configure(ui_routes)
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
