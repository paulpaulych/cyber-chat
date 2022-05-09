use actix::prelude::*;


pub enum Signal {
    Offer { sdp: String },
    Answer { sdp: String },
    IceCandidate { candidate: String },
    IceGatheringComplete,
    PeerConnected,
    PeerDisconnected
}
impl Message for Signal {
    type Result = ();
}

pub struct AlreadyConnected;
pub struct PeerNotConnected;

pub struct SignalReq {
    pub from: Role,
    pub data: SignalReqData 
}
impl Message for SignalReq {
    type Result = Result<(), PeerNotConnected>;
}

pub enum SignalReqData {
    Offer { sdp: String },
    Answer { sdp: String },
    IceCandidate { candidate: String },
    IceGatheringComplete,
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
            Role::SENDER => {
                log::debug!("trying to connect sender");
                (&mut self.sender, self.receiver.as_ref())
            },
            Role::RECEIVER => {
                log::debug!("trying to connect receiver");
                (&mut self.receiver, self.sender.as_ref())
            }
        };
        if to_place.is_some() {
            log::debug!("failed: already connected");
            return Err(AlreadyConnected)
        }
        *to_place = Some(Peer { addr: msg.addr });
        log::debug!("successfully connected");
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
        let target = match req.from {
            Role::SENDER => self.receiver.as_ref(),
            Role::RECEIVER => self.sender.as_ref()
        };
        target
            .ok_or_else(|| PeerNotConnected)
            .map(|peer| peer.addr.do_send(to_signal(req.data)))
    }
}

fn to_signal(req: SignalReqData) -> Signal {
    match req {
        SignalReqData::Offer { sdp } => Signal::Offer { sdp },
        SignalReqData::Answer { sdp  } => Signal::Answer { sdp },
        SignalReqData::IceCandidate { candidate } => Signal::IceCandidate { candidate },
        SignalReqData::IceGatheringComplete => Signal::IceGatheringComplete
    }
}
