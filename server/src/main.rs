use actix::*;
use actix_files::{Files, NamedFile};
use actix_web::{middleware::Logger, web, App, HttpServer, Responder};

mod domain;
mod infra;
mod application;

use infra::routes::webrtc::{webrtc_sender_route, webrtc_receiver_route};

use crate::application::signal_server::SignalServer;

async fn index() -> impl Responder {
    NamedFile::open_async("./static/index.html").await.unwrap()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let server = SignalServer::new().start();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .service(web::resource("/").to(index))

            .route("/webrtc/room/{room_id}/sender",
                   web::get().to(webrtc_sender_route))
            .route("/webrtc/room/{room_id}/receiver",
                   web::get().to(webrtc_receiver_route))

            .service(Files::new("/static", "./static"))
            .wrap(Logger::default())
    })
        .workers(2)
        .bind(("127.0.0.1", 8080))?
        .run();

    log::info!("starting HTTP server at http://localhost:8080");

    server.await
}
