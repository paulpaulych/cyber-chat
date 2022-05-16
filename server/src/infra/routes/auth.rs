use actix_web::dev::ServiceRequest;
use actix_web;
use actix_web::web;
use actix_web::HttpMessage;
use actix_web_httpauth::extractors::bearer;
use actix_web_httpauth::extractors::bearer::BearerAuth;
use actix_web_httpauth::extractors::AuthenticationError;
use crate::{Jwt, UserStore};
use crate::application::security::context::SecurityContext;
use crate::domain::user::UserId;

pub async fn authenticate(
    req: ServiceRequest,
    credentials: BearerAuth
) -> Result<ServiceRequest, actix_web::Error> {
    let jwt = req.app_data::<web::Data<Jwt>>().unwrap();
    let users = req.app_data::<web::Data<UserStore>>().unwrap();
    let config = req
        .app_data::<bearer::Config>()
        .map(|data| data.clone())
        .unwrap_or_else(Default::default);
    match jwt.verify(credentials.token().to_string()) {
        Ok(claims) => {
            match users.find_by_id(UserId::from(&*claims.user_id)).await {
                Some(user) => {
                    req.extensions_mut().insert(SecurityContext {  user_id: user.id });
                    Ok(req)
                },
                None => Err(AuthenticationError::from(config).into())
            }
        },
        Err(_) => Err(AuthenticationError::from(config).into()),
    }
}