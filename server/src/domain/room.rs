use uuid::Uuid;

use crate::domain::user::UserId;

#[derive(Debug, Clone)]
pub struct RoomId(pub Uuid);

impl RoomId {
    fn new() -> RoomId {
        RoomId(Uuid::new_v4())
    }
}

impl From<&str> for RoomId {
    fn from(s: &str) -> Self {
        RoomId(Uuid::parse_str(&s).unwrap())
    }
}

#[derive(Debug, Clone)]
pub struct Room {
    pub id: RoomId,
    pub name: String,
    pub closed: bool,
    pub participants: Participants,
}

#[derive(Debug, Clone)]
pub struct Participants {
    pub host: Participant,
    pub guest: Option<Participant>,
}

#[derive(Debug, Clone)]
pub struct Participant {
    pub user_id: UserId,
    pub name: Option<String>,
}

#[derive(Debug)]
pub enum JoinErr {
    GuestAlreadyJoined,
    HostCantJoinAsGuest,
}

impl Room {
    pub fn new(
        room_name: String,
        host: Participant,
    ) -> Room {
        Room {
            id: RoomId::new(),
            name: room_name,
            closed: false,
            participants: Participants {
                host,
                guest: None,
            },
        }
    }

    pub fn join(self, guest: Participant) -> Result<Room, JoinErr> {
        if self.participants.guest.is_some() {
            return Err(JoinErr::GuestAlreadyJoined);
        }
        if self.participants.host.user_id.0 == guest.user_id.0 {
            return Err(JoinErr::HostCantJoinAsGuest);
        }

        Ok(Room {
            participants: Participants {
                guest: Some(guest),
                ..self.participants
            },
            ..self
        })
    }

    fn close(self) -> Room {
        Room { closed: true, ..self }
    }
}