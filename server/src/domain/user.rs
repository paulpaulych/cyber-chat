use uuid::Uuid;

use crate::domain::workstation::WksId;

#[derive(Debug, Clone)]
//TODO: make universal type for id with From, PartialEq etc.
pub struct UserId(pub(crate) Uuid);

impl UserId {
    fn new() -> UserId {
        UserId(Uuid::new_v4())
    }
}

impl From<&str> for UserId {
    fn from(s: &str) -> Self {
        UserId(Uuid::parse_str(&s).unwrap())
    }
}

#[derive(Debug)]
pub struct User {
    pub id: UserId,
    pub(crate) name: Option<String>,
    pub wks_id: WksId,
    pub(crate) archived: bool
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