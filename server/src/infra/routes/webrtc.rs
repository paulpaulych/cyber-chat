use actix::Addr;
use actix_web::{Error, HttpRequest, HttpResponse, web};
use actix_web_actors::ws;
use std::time::{Duration, Instant};
use actix::prelude::*;
use actix_web::http::StatusCode;
use actix_web_actors::ws::{CloseCode, CloseReason};
use log;
use serde::{Deserialize, Serialize};
use crate::application::signal_server as app;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

// TODO: join with webrtc_receiver_route
pub async fn webrtc_sender_route(
    req: HttpRequest,
    room_id: web::Path<String>,
    payload: web::Payload,
    webrtc: web::Data<Addr<app::SignalServer>>,
) -> Result<HttpResponse, Error> {
    let room_id = room_id.into_inner();
    log::info!("room_id = {}", room_id);
    if room_id != "main" {
        return Ok(room_not_found());
    }

    ws::start(
            SignalSession::new(app::Role::SENDER, webrtc.get_ref().clone()),
            &req,
            payload,
    )
}

pub async fn webrtc_receiver_route(
    req: HttpRequest,
    room_id: web::Path<String>,
    payload: web::Payload,
    webrtc: web::Data<Addr<app::SignalServer>>,
) -> Result<HttpResponse, Error> {
    let room_id = room_id.into_inner();
    log::info!("room_id = {}", room_id);
    if room_id != "main" {
        return Ok(room_not_found());
    }

    ws::start(
        SignalSession::new(app::Role::RECEIVER, webrtc.get_ref().clone()),
        &req,
        payload,
    )
}

fn room_not_found() -> HttpResponse {
    HttpResponse::build(StatusCode::NOT_FOUND).body("room not found")
}

#[derive(Debug)]
struct SignalSession {
    last_hb: Instant,
    role: app::Role,
    is_active: bool,
    webrtc: Addr<app::SignalServer>,
}

impl SignalSession {
    fn new(
        role: app::Role,
        webrtc: Addr<app::SignalServer>,
    ) -> SignalSession {
        SignalSession {
            role,
            is_active: false,
            last_hb: Instant::now(),
            webrtc,
        }
    }
}

impl SignalSession {
    fn start_periodic_hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            if Instant::now().duration_since(act.last_hb) > CLIENT_TIMEOUT {
                log::info!("Websocket Client heartbeat failed, disconnecting!");
                act.webrtc.do_send(app::Disconnect { role: act.role.clone() });
                ctx.stop();
                return;
            }

            ctx.ping(b"");
        });
    }

    fn handle_mailbox_err(&self, e: MailboxError, ctx: &mut ws::WebsocketContext<Self>) -> () {
        log::error!("Mailbox error: {}. Closing connection", e);

        ctx.stop();
    }
}

impl Actor for SignalSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.start_periodic_hb(ctx);

        self.webrtc
            .send(app::Connect { role: self.role.clone(), addr: ctx.address().recipient() })
            .into_actor(self)
            .then(|res, session, ctx| {
                res.unwrap_or_else(|e| Ok(session.handle_mailbox_err(e, ctx)))
                    .map(|_| session.is_active = true)
                    .unwrap_or_else(|already_connected| {
                        send_json(WsOutMessage::from(already_connected), ctx);
                        close_due_duplicate(ctx);
                        ctx.stop()
                    });
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        if self.is_active {
            self.webrtc.do_send(app::Disconnect { role: self.role.clone() });
        }
        Running::Stop
    }
}

impl Handler<app::Signal> for SignalSession {
    type Result = ();

    fn handle(&mut self, signal: app::Signal, ctx: &mut Self::Context) {
        send_json(WsOutMessage::from(signal), ctx)
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for SignalSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(msg) => {
                self.last_hb = Instant::now();
                ctx.pong(&msg);
            }
            ws::Message::Pong(_) => {
                self.last_hb = Instant::now();
            }
            ws::Message::Text(text) => {
                log::debug!("received message from {:?}: {}", self.role, text);

                let msg: WsInMessage = serde_json::from_str(&text).unwrap();
                let signal_req = app::SignalReq {
                    from: self.role.clone(),
                    data: app::SignalReqData::from(msg),
                };

                self.webrtc.send(signal_req)
                    .into_actor(self)
                    .then(|res, session, ctx| {
                        res.unwrap_or_else(|e| Ok(session.handle_mailbox_err(e, ctx)))
                            .unwrap_or_else(|peer_not_connected| {
                                send_json(WsOutMessage::from(peer_not_connected), ctx)
                            });
                        fut::ready(())
                    })
                    .wait(ctx)
            }
            ws::Message::Binary(_) => log::warn!("Unexpected binary"),
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                ctx.stop();
            }
            ws::Message::Nop => (),
        }
    }
}

const ALREADY_CONNECTED: &str = "ALREADY_CONNECTED";
const PEER_NOT_CONNECTED: &str = "PEER_NOT_CONNECTED";

#[derive(Deserialize)]
#[serde(tag = "type")]
enum WsInMessage {
    Offer { sdp: String },
    Answer { sdp: String },
    IceCandidate { candidate: String },
    IceGatheringComplete,
}

#[derive(Serialize)]
#[serde(tag = "type")]
enum WsOutMessage {
    Offer { sdp: String },
    Answer { sdp: String },
    IceCandidate { candidate: String },
    IceGatheringComplete,
    Error { code: String },
    PeerConnected,
    PeerDisconnected,
}

impl From<WsInMessage> for app::SignalReqData {
    fn from(msg: WsInMessage) -> Self {
        match msg {
            WsInMessage::Offer { sdp } => app::SignalReqData::Offer { sdp },
            WsInMessage::Answer { sdp } => app::SignalReqData::Answer { sdp },
            WsInMessage::IceCandidate { candidate } => app::SignalReqData::IceCandidate { candidate },
            WsInMessage::IceGatheringComplete => app::SignalReqData::IceGatheringComplete
        }
    }
}

impl From<app::AlreadyConnected> for WsOutMessage {
    fn from(_: app::AlreadyConnected) -> Self {
        WsOutMessage::Error { code: String::from(ALREADY_CONNECTED) }
    }
}

impl From<app::PeerNotConnected> for WsOutMessage {
    fn from(_: app::PeerNotConnected) -> Self {
        WsOutMessage::Error { code: String::from(PEER_NOT_CONNECTED) }
    }
}

impl From<app::Signal> for WsOutMessage {
    fn from(signal: app::Signal) -> Self {
        match signal {
            app::Signal::Offer { sdp } => WsOutMessage::Offer { sdp },
            app::Signal::Answer { sdp } => WsOutMessage::Answer { sdp },
            app::Signal::PeerConnected => WsOutMessage::PeerConnected,
            app::Signal::PeerDisconnected => WsOutMessage::PeerDisconnected,
            app::Signal::IceCandidate { candidate } => WsOutMessage::IceCandidate { candidate },
            app::Signal::IceGatheringComplete => WsOutMessage::IceGatheringComplete
        }
    }
}

fn close_due_duplicate(ctx: &mut ws::WebsocketContext<SignalSession>) {
    let reason = CloseReason {
        code: CloseCode::Normal,
        description: Some(String::from("Room already has peer with your role")),
    };
    ctx.close(Some(reason))
}

fn send_json<T: Serialize>(data: T, ctx: &mut ws::WebsocketContext<SignalSession>) {
    let json = serde_json::to_string(&data).unwrap();
    ctx.text(json);
}