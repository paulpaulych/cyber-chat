use uuid::Uuid;
use crate::domain::workstation::WksId;

pub struct UserId(Uuid);

impl UserId {
    fn new() -> UserId {
        UserId(Uuid::new_v4())
    }
}

pub struct User {
    id: UserId,
    name: Option<String>,
    wks_id: WksId,
    archived: bool
}

impl User {
    pub fn new(
        name: Option<String>,
        wks_id: WksId,
    ) -> User {
        User { 
            id: UserId::new(),
            name, 
            wks_id,
            archived: false,
        }
    }

    pub fn archive(self) -> User {
        User {
            archived: true,
            ..self
        }
    }
}