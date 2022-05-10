use uuid::Uuid;
use crate::domain::user::UserId;


struct RoomId(Uuid);

impl RoomId {
    fn new() -> RoomId {
        RoomId(Uuid::new_v4())
    }
}

struct Participant {
    user_id: UserId,
    name: Option<String>,
}

struct Participants {
    host: Participant,
    guest: Option<Participant>
}

struct Room {
    id: RoomId,
    name: String,
    closed: bool,

    participants: Participants
}

struct GuestAlreadyJoined;

impl Room {

    fn new(
        host_id: UserId,
        name: String,
    ) -> Room {
        Room {
            id: RoomId::new(),
            name,
            closed: false,
            participants: Participants {
                host: Participant { user_id: host_id, name: None },
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