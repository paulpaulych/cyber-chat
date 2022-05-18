use actix_web::{web};
use actix_files::NamedFile;
use actix_web::web::ServiceConfig;

//TODO: use value from config
const UI_DATA_PATH: &str = "../frontend/build";

pub fn public_ui_routes(cfg: &mut ServiceConfig) {
    cfg
        .service(web::resource("/").to(|| NamedFile::open_async(UI_DATA_PATH.to_owned() + "/index.html")))
        .service(web::resource("/index.html").to(|| NamedFile::open_async(UI_DATA_PATH.to_owned() + "/index.html")))
        .service(web::resource("/favicon.ico").to(|| NamedFile::open_async(UI_DATA_PATH.to_owned() + "/favicon.ico")))
        .service(actix_files::Files::new("/static", UI_DATA_PATH.to_owned() + "/static"));
}