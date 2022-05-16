use actix_web::{Result, web, HttpRequest, HttpResponse};
use actix_web::cookie::Cookie;
use actix_web::http::StatusCode;
use serde::Serialize;
use crate::application::login::LoginHandler;
use crate::application::security::jwt::Jwt;
use crate::application::user_store::UserStore;

#[derive(Serialize, Debug)]
struct TokenRes {
    access_token: String
}

#[derive(Serialize, Debug)]
struct UnathorizedRes {
    message: String
}

const WKS_ID: &str = "Wks-Id";

async fn create_token(
    req: HttpRequest,
    jwt_utils: web::Data<Jwt>,
    users: web::Data<UserStore>,
) -> Result<HttpResponse> {
    let wks_id = req.cookie(WKS_ID).map(|c| { c.value().to_string() });
    let handler = LoginHandler {
        jwt_utils: jwt_utils.get_ref(),
        users: users.get_ref()
    };
    match handler.login(wks_id.as_deref()).await {
        Ok((access_token, new_wks_id)) => {
            let mut res = HttpResponse::Ok();
            if let Some(new_wks_id) = new_wks_id {
                res.cookie(Cookie::new(WKS_ID, new_wks_id.0.to_string()));
            }
            Ok(res.json(TokenRes { access_token }))
        }
        Err(msg) => {
            Ok(HttpResponse::build(StatusCode::UNAUTHORIZED)
                .json(UnathorizedRes { message: msg.to_string() }))
        }
    }
}

pub fn login_route(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/login").route(web::get().to(create_token)));
}