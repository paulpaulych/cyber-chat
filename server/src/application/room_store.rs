use sqlx::{PgPool, FromRow};
use crate::application::pg_common::PgQuery;
use crate::domain::room::{Participant, Participants, Room, RoomId};
use crate::domain::user::{UserId};

#[derive(Clone)]
pub struct RoomStore {
    pub(crate) pool: PgPool
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

impl RoomStore {

    pub async fn find_by_id(&self, id: RoomId) -> Option<Room> {
        (sqlx::query_as(SELECT_ROOM) as PgQuery<RoomDetailedRow>)
            .bind(id.0.to_string())
            .fetch_optional(&self.pool)
            .await.unwrap()
            .map(Room::from)
    }

    pub async fn save(&self, room: &Room) {
        let tx = self.pool.begin().await.unwrap();
        match self.save_internal(room).await {
            Ok(_) => tx.commit().await.unwrap(),
            Err(err) => {
                log::error!("failed to save room: {:?}", err);
                tx.rollback().await.unwrap()
            }
        }
    }

    async fn save_internal(&self, room: &Room) -> Result<(), sqlx::Error> {
        let room_id = &room.id.0.to_string();

        sqlx::query("insert into room(id, name, closed) values ($1, $2, $3)")
            .bind(room_id)
            .bind(&room.name)
            .bind(room.closed)
            .execute(&self.pool)
            .await?;

        sqlx::query("insert into host(room_id, user_id, name) values ($1, $2, $3)")
            .bind(room_id)
            .bind(&room.participants.host.user_id.0.to_string())
            .bind(&room.participants.host.name)
            .execute(&self.pool)
            .await?;

        if let Some(guest) = &room.participants.guest {
            sqlx::query("insert into guest(room_id, user_id, name) values ($1, $2, $3)")
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
    guest_name: Option<String>
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
                    name: row.guest_name
                })
            }
        }
    }
}