use actix_web::{Result, web, HttpResponse};
use actix_web::http::StatusCode;
use serde::Serialize;
use crate::application::security::context::SecurityContext;

#[derive(Serialize, Debug)]
struct UsersRes {
    id: String,
}

pub async fn get_me(
    ctx: web::ReqData<SecurityContext>
) -> Result<HttpResponse> {

    Ok(HttpResponse::build(StatusCode::OK)
        .json(UsersRes { id: ctx.user_id.0.to_string() }))
}
