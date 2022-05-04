use std::time::{Duration, Instant};

use actix::prelude::*;
use actix_web_actors::ws;
use log;
use serde::{Deserialize, Serialize};

use crate::webrtc;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Debug)]
pub struct Session {
    id: usize,
    last_hb: Instant,
    webrtc: Addr<webrtc::SignalServer>,
}

impl Session {
    pub fn new(webrtc: Addr<webrtc::SignalServer>) -> Session {
        Session {
            id: 0,
            last_hb: Instant::now(),
            webrtc
        }
    }
}

impl Session {

    fn start_periodic_hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {

            if Instant::now().duration_since(act.last_hb) > CLIENT_TIMEOUT {
                log::info!("Websocket Client heartbeat failed, disconnecting!");
                act.webrtc.do_send(webrtc::Disconnect { id: act.id });
                ctx.stop();
                return;
            }

            ctx.ping(b"");
        });
    }
}

impl Actor for Session {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.start_periodic_hb(ctx);

        self.webrtc
            .send(webrtc::Connect { signaller: ctx.address().recipient() })
            .into_actor(self)
            .then(|res, session, ctx| {
                match res {
                    Ok(res) => session.id = res,
                    Err(e) => {
                        log::warn!("can't connect to signal server: {}", e);
                        ctx.stop()
                    },
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        self.webrtc.do_send(webrtc::Disconnect { id: self.id });
        Running::Stop
    }
}

impl Handler<webrtc::Signal> for Session {
    type Result = ();

    fn handle(&mut self, msg: webrtc::Signal, ctx: &mut Self::Context) {
        let dto = SignalDto::from(msg);
        let json = serde_json::to_string(&dto).unwrap();
        ctx.text(json);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for Session {
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
                let req: SignalReqDto = serde_json::from_str(&text).unwrap();
                let signal = webrtc::Signal::from(req);

                self.webrtc
                    .send(webrtc::SignalReq {
                        from_id: self.id,
                        signal
                    })
                    .into_actor(self)
                    .then(|res, _, ctx| {
                        if let Err(e) = res {
                            log::warn!("can't connect to signal server: {}", e);
                            ctx.stop()
                        }
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

#[derive(Deserialize)]
#[serde(tag = "type")]
enum SignalReqDto {
    Offer { sdp: String },
    Answer { sdp: String }
}

impl From<SignalReqDto> for webrtc::Signal {
    fn from(dto: SignalReqDto) -> Self {
        match dto {
            SignalReqDto::Offer { sdp } => webrtc::Signal::Offer { sdp },
            SignalReqDto::Answer { sdp } => webrtc::Signal::Answer { sdp }
        }
    }
}

#[derive(Serialize)]
#[serde(tag = "type")]
enum SignalDto {
    Offer { sdp: String },
    Answer { sdp: String }
}

impl From<webrtc::Signal> for SignalDto {
    fn from(signal: webrtc::Signal) -> Self {
        match signal {
            webrtc::Signal::Offer { sdp } => SignalDto::Offer { sdp },
            webrtc::Signal::Answer { sdp } => SignalDto::Answer { sdp }
        }
    }
}