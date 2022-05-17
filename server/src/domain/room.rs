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
    pub participants: Participants
}

#[derive(Debug, Clone)]
pub struct Participants {
    pub host: Participant,
    pub guest: Option<Participant>
}

#[derive(Debug, Clone)]
pub struct Participant {
    pub user_id: UserId,
    pub name: Option<String>,
}

struct GuestAlreadyJoined;

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
                guest: None
            }
        }
    }

    fn join(
        self,
        user_id: UserId,
        name: Option<String>
    ) -> Result<Room, GuestAlreadyJoined>  {
        match self.participants.guest {
            Some(_) => Err(GuestAlreadyJoined),
            None => Ok(
                Room {
                    participants: Participants {
                        guest: Some(Participant { user_id, name }),
                        ..self.participants
                    },
                    ..self
                }
            )
        }
    }

    fn close(self) -> Room {
        Room { closed: true, ..self }
    }
}