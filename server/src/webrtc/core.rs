use actix::prelude::*;


pub enum Signal {
    Offer { sdp: String },
    Answer { sdp: String },
    PeerConnected,
    PeerDisconnected
}
impl Message for Signal {
    type Result = ();
}

pub struct AlreadyConnected;
pub struct PeerNotConnected;

pub enum SignalReq {
    Offer { sdp: String },
    Answer { sdp: String },
}
impl Message for SignalReq {
    type Result = Result<(), PeerNotConnected>;
}

#[derive(Debug)]
#[derive(Clone)]
pub enum Role {
    SENDER,
    RECEIVER
}

pub struct Connect {
    pub role: Role,
    pub addr: Recipient<Signal>,
}
impl Message for Connect {
    type Result = Result<(), AlreadyConnected>;
}

pub struct Disconnect {
    pub role: Role,
}
impl Message for Disconnect {
    type Result = ();
}

pub struct Peer {
    addr: Recipient<Signal>
}

pub struct SignalServer {
    sender: Option<Peer>,
    receiver: Option<Peer>
}

impl SignalServer {
    pub fn new() -> SignalServer {
        SignalServer { sender: None, receiver: None, }
    }
}

impl Actor for SignalServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for SignalServer {
    type Result = Result<(), AlreadyConnected>;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        let (to_place, to_notify) = match msg.role {
            Role::SENDER => (&mut self.sender, self.receiver.as_ref()),
            Role::RECEIVER => (&mut self.receiver, self.sender.as_ref())
        };
        if to_place.is_some() {
            return Err(AlreadyConnected)
        }
        *to_place = Some(Peer { addr: msg.addr });
        if to_notify.is_some() {
            to_notify.unwrap().addr.do_send(Signal::PeerConnected)
        }
        Ok(())
    }
}

impl Handler<Disconnect> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) -> Self::Result {
        match msg.role {
            Role::SENDER => {
                if self.sender.is_some() {
                    log::info!("Sender disconnected");
                    self.receiver.as_ref().map(|peer| peer.addr.do_send(Signal::PeerDisconnected));
                    self.sender = None;
                }
            },
            Role::RECEIVER => {
                if self.receiver.is_some() {
                    log::info!("Receiver disconnected");
                    self.sender.as_ref().map(|peer| peer.addr.do_send(Signal::PeerDisconnected));
                    self.receiver = None;
                }
            }
        };
    }
}

impl Handler<SignalReq> for SignalServer {
    type Result = Result<(), PeerNotConnected>;

    fn handle(&mut self, req: SignalReq, _: &mut Context<Self>) -> Self::Result {
        let target = match req {
            SignalReq::Offer { .. } => self.receiver.as_ref(),
            SignalReq::Answer { .. } => self.sender.as_ref()
        };
        target
            .ok_or_else(|| PeerNotConnected)
            .map(|peer| peer.addr.do_send(to_signal(req)))
    }
}

fn to_signal(req: SignalReq) -> Signal {
    match req {
        SignalReq::Offer { sdp } => Signal::Offer { sdp },
        SignalReq::Answer { sdp  } => Signal::Answer { sdp },
    }
}
