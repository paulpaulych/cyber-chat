use std::time::{Duration, Instant};

use actix::prelude::*;
use actix_web_actors::ws;
use actix_web_actors::ws::{CloseCode, CloseReason};
use log;
use serde::{Deserialize, Serialize};

use crate::webrtc::core as webrtc;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Debug)]
pub struct SignalSession {
    last_hb: Instant,
    role: webrtc::Role,
    webrtc: Addr<webrtc::SignalServer>,
}

impl SignalSession {
    pub fn new(
        role: webrtc::Role,
        webrtc: Addr<webrtc::SignalServer>
    ) -> SignalSession {
        SignalSession {
            role,
            last_hb: Instant::now(),
            webrtc
        }
    }
}

impl SignalSession {

    fn start_periodic_hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {

            if Instant::now().duration_since(act.last_hb) > CLIENT_TIMEOUT {
                log::info!("Websocket Client heartbeat failed, disconnecting!");
                act.webrtc.do_send(webrtc::Disconnect { role: act.role.clone() });
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
            .send(webrtc::Connect { role: self.role.clone(), addr: ctx.address().recipient() })
            .into_actor(self)
            .then(|res, session, ctx| {
                res.unwrap_or_else(|e| Ok(session.handle_mailbox_err(e, ctx)))
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
        self.webrtc.do_send(webrtc::Disconnect { role: self.role.clone() });
        Running::Stop
    }
}

impl Handler<webrtc::Signal> for SignalSession {
    type Result = ();

    fn handle(&mut self, signal: webrtc::Signal, ctx: &mut Self::Context) {
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
            ws::Message::Text(text) =>{
                log::debug!("received message from {:?}: {}", self.role, text);

                let msg: WsInMessage = serde_json::from_str(&text).unwrap();
                let signal_req = webrtc::SignalReq::from(msg);

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
}

#[derive(Serialize)]
#[serde(tag = "type")]
enum WsOutMessage {
    Offer { sdp: String },
    Answer { sdp: String },
    Error { code: String },
    PeerConnected,
    PeerDisconnected
}

impl From<WsInMessage> for webrtc::SignalReq {
    fn from(msg: WsInMessage) -> Self {
        match msg {
            WsInMessage::Offer { sdp } => webrtc::SignalReq::Offer { sdp },
            WsInMessage::Answer { sdp } => webrtc::SignalReq::Answer { sdp },
        }
    }
}

impl From<webrtc::AlreadyConnected> for WsOutMessage {
    fn from(_: webrtc::AlreadyConnected) -> Self {
        WsOutMessage::Error { code: String::from(ALREADY_CONNECTED) }
    }
}

impl From<webrtc::PeerNotConnected> for WsOutMessage {
    fn from(_: webrtc::PeerNotConnected) -> Self {
        WsOutMessage::Error { code: String::from(PEER_NOT_CONNECTED) }
    }
}

impl From<webrtc::Signal> for WsOutMessage {
    fn from(signal: webrtc::Signal) -> Self {
        match signal {
            webrtc::Signal::Offer { sdp } => WsOutMessage::Offer { sdp },
            webrtc::Signal::Answer { sdp } => WsOutMessage::Answer { sdp },
            webrtc::Signal::PeerConnected => WsOutMessage::PeerConnected,
            webrtc::Signal::PeerDisconnected => WsOutMessage::PeerDisconnected
        }
    }
}

fn close_due_duplicate(ctx: &mut ws::WebsocketContext<SignalSession>) {
    let reason = CloseReason {
        code: CloseCode::Normal,
        description: Some(String::from("Room already has peer with your role"))
    };
    ctx.close(Some(reason))
}

fn send_json<T: Serialize>(data: T, ctx: &mut ws::WebsocketContext<SignalSession>) {
    let json = serde_json::to_string(&data).unwrap();
    ctx.text(json);
}