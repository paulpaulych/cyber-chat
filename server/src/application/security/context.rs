use crate::domain::user::UserId;

#[derive(Clone)]
pub struct SecurityContext {
    pub user_id: UserId
}