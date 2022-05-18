use sqlx::{FromRow, PgPool};

use crate::application::db_common::{PgQuery, tx};
use crate::domain::room::{Participant, Participants, Room, RoomId};
use crate::domain::user::UserId;

#[derive(Clone)]
pub struct RoomStore {
    pub(crate) pool: PgPool,
}

// language=sql
const SELECT_ROOM: &str = "
select room.id,
       room.name,
       room.closed,
       host.user_id  as host_id,
       host.name     as host_name,
       guest.user_id as guest_id,
       guest.name    as guest_name
from room
         join host on room.id = host.room_id
         left join guest on room.id = guest.room_id
where room.id = $1
";

// language=sql
const INSERT_OR_UPDATE_ROOM: &str = "
insert into room(id, name, closed)
values ($1, $2, $3)
on conflict(id) do update
    set name = $2,
        closed = $3
";

// language=sql
const INSERT_OR_UPDATE_HOST: &str = "
insert into host(room_id, user_id, name)
values ($1, $2, $3)
on conflict(room_id, user_id) do update
    set name = $3
";

// language=sql
const INSERT_OR_UPDATE_GUEST: &str = "
insert into guest(room_id, user_id, name)
values ($1, $2, $3)
on conflict(room_id, user_id) do update
    set name = $3
";

impl RoomStore {
    pub async fn find_by_id(&self, id: RoomId) -> Option<Room> {
        (sqlx::query_as(SELECT_ROOM) as PgQuery<RoomDetailedRow>)
            .bind(id.0.to_string())
            .fetch_optional(&self.pool)
            .await.unwrap()
            .map(Room::from)
    }

    pub async fn save(&self, room: &Room) -> Result<(), sqlx::Error> {
        tx(&self.pool, || self.do_save(room)).await?
    }

    async fn do_save(&self, room: &Room) -> Result<(), sqlx::Error> {
        let room_id = &room.id.0.to_string();

        sqlx::query(INSERT_OR_UPDATE_ROOM)
            .bind(room_id)
            .bind(&room.name)
            .bind(room.closed)
            .execute(&self.pool)
            .await?;

        sqlx::query(INSERT_OR_UPDATE_HOST)
            .bind(room_id)
            .bind(&room.participants.host.user_id.0.to_string())
            .bind(&room.participants.host.name)
            .execute(&self.pool)
            .await?;

        if let Some(guest) = &room.participants.guest {
            sqlx::query(INSERT_OR_UPDATE_GUEST)
                .bind(room_id)
                .bind(&guest.user_id.0.to_string())
                .bind(&guest.name)
                .execute(&self.pool)
                .await?;
        }

        Ok(())
    }
}

#[derive(FromRow)]
struct RoomDetailedRow {
    id: String,
    name: String,
    closed: bool,
    host_id: String,
    host_name: Option<String>,
    guest_id: Option<String>,
    guest_name: Option<String>,
}

impl From<RoomDetailedRow> for Room {
    fn from(row: RoomDetailedRow) -> Self {
        Room {
            id: RoomId::from(&*row.id),
            name: row.name,
            closed: row.closed,
            participants: Participants {
                host: Participant {
                    user_id: UserId::from(&*row.host_id),
                    name: row.host_name,
                },
                guest: row.guest_id.map(|guest_id| Participant {
                    user_id: UserId::from(&*guest_id),
                    name: row.guest_name,
                }),
            },
        }
    }
}