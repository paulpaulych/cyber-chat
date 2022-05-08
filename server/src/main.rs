use actix::*;
use actix_files::{Files, NamedFile};
use actix_web::{middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web::http::StatusCode;
use actix_web_actors::ws;

mod webrtc;

use webrtc::api::{SignalSession};
use webrtc::core::{Role, SignalServer};
use webrtc::websocket;

async fn index() -> impl Responder {
    NamedFile::open_async("./static/index.html").await.unwrap()
}

async fn webrtc_sender_route(
    req: HttpRequest,
    room_id: web::Path<String>,
    payload: web::Payload,
    webrtc: web::Data<Addr<SignalServer>>,
) -> Result<HttpResponse, Error> {
    let room_id = room_id.into_inner();
    log::info!("room_id = {}", room_id);
    if room_id != "main" {
        return Ok(room_not_found())
    }


   ws::start(
            SignalSession::new(Role::SENDER, webrtc.get_ref().clone()),
            &req,
            payload,
    )
}

fn room_not_found() -> HttpResponse {
    HttpResponse::build(StatusCode::NOT_FOUND).body("room not found")
}

async fn webrtc_receiver_route(
    req: HttpRequest,
    room_id: web::Path<String>,
    stream: web::Payload,
    webrtc: web::Data<Addr<SignalServer>>,
) -> Result<HttpResponse, Error> {
    if room_id.into_inner() != "main" {
        return Ok(room_not_found())
    }

    ws::start(
        SignalSession::new(Role::RECEIVER, webrtc.get_ref().clone()),
        &req,
        stream,
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let server = SignalServer::new().start();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .service(web::resource("/").to(index))

            .route("/webrtc/room/{room_id}/sender", web::get().to(webrtc_sender_route))
            .route("/webrtc/room/{room_id}/receiver", web::get().to(webrtc_receiver_route))

            .service(Files::new("/static", "./static"))
            .wrap(Logger::default())
    })
        .workers(2)
        .bind(("127.0.0.1", 8080))?
        .run();

    log::info!("starting HTTP server at http://localhost:8080");

    server.await
}
