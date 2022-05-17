use actix_web::{Result, web, HttpResponse, Responder};
use actix_web::http::StatusCode;
use serde::{Serialize, Deserialize};
use crate::application::room_store::RoomStore;
use crate::application::security::context::SecurityContext;
use crate::domain::room::{Participant, Room, RoomId};

#[derive(Deserialize, Debug)]
pub struct CreateRoomReq {
    name: String,
    host_name: Option<String>
}

#[derive(Serialize, Debug)]
struct RoomCreatedRes {
    id: String
}

pub async fn create_room(
    req: web::Json<CreateRoomReq>,
    ctx: web::ReqData<SecurityContext>,
    rooms: web::Data<RoomStore>
) -> Result<HttpResponse> {
    let req = req.0;
    let host = Participant {
        user_id: ctx.user_id.clone(),
        name: req.host_name
    };
    let room = Room::new(req.name, host);
    rooms.save(&room);
    Ok(HttpResponse::build(StatusCode::OK)
        .json(RoomCreatedRes { id: room.id.0.to_string() }))
}

#[derive(Serialize, Debug)]
struct RoomView {
    id: String,
    name: String,
    host: ParticipantView,
    guest: Option<ParticipantView>
}

#[derive(Serialize, Debug)]
struct ParticipantView {
    user_id: String,
    name: Option<String>
}

pub async fn get_room(
    id: web::Path<String>,
    rooms: web::Data<RoomStore>
) -> Option<impl Responder> {
    rooms.find_by_id(RoomId::from(&*id.into_inner())).await
        .map(Into::into)
        .map(|room: RoomView| web::Json(room))
}

impl From<Room> for RoomView {
    fn from(room: Room) -> Self {
        RoomView {
            id: room.id.0.to_string(),
            name: room.name,
            host: room.participants.host.into(),
            guest: room.participants.guest.map(Into::into)
        }
    }
}

impl From<Participant> for ParticipantView {
    fn from(src: Participant) -> Self {
        ParticipantView {
            user_id: src.user_id.0.to_string(),
            name: src.name
        }
    }
}