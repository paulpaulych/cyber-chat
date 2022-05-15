use actix_web::{Result, web, HttpRequest, HttpResponse};
use actix_web::cookie::Cookie;
use actix_web::http::StatusCode;
use serde::Serialize;

#[derive(Serialize, Debug)]
struct TokenRes {
    access_token: String
}

const WKS_ID: &str = "Wks-Id";

async fn create_token(
    req: HttpRequest
) -> Result<HttpResponse> {
    match req.cookie(WKS_ID) {
        Some(wks_id) => {
            Ok(HttpResponse::Ok()
                .json(TokenRes { access_token: format!("hello: ") + wks_id.value()}))
        },
        None => {
            Ok(HttpResponse::build(StatusCode::OK)
                .cookie(Cookie::new(WKS_ID, "WKSID"))
                .json(TokenRes { access_token: format!("hello") }))
        }
    }
}

pub fn login_route(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/login").route(web::get().to(create_token)));
}