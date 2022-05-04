use actix::*;
use actix_files::{Files, NamedFile};
use actix_web::{middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_actors::ws;

mod webrtc;
mod websocket;


async fn index() -> impl Responder {
    NamedFile::open_async("./static/index.html").await.unwrap()
}

async fn ws_route(
    req: HttpRequest,
    stream: web::Payload,
    webrtc: web::Data<Addr<webrtc::SignalServer>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        websocket::Session::new(webrtc.get_ref().clone()),
        &req,
        stream,
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let server = webrtc::SignalServer::new().start();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .service(web::resource("/").to(index))
            .route("/ws", web::get().to(ws_route))
            .service(Files::new("/static", "./static"))
            .wrap(Logger::default())
    })
    .workers(2)
    .bind(("127.0.0.1", 8080))?
    .run();

    log::info!("starting HTTP server at http://localhost:8080");

    server.await
}
