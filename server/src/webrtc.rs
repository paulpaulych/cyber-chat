use std::collections::HashMap;

use actix::prelude::*;

#[derive(Debug)]
pub struct SignalReq {
    pub from_id: usize,
    pub signal: Signal,
}
impl Message for SignalReq {
    type Result = ();
}

#[derive(Clone)]
#[derive(Debug)]
pub enum Signal {
    Offer { sdp: String },
    Answer { sdp: String },
}
impl Message for Signal {
    type Result = ();
}

pub struct Connect {
    pub signaller: Recipient<Signal>,
}
impl Message for Connect {
    type Result = usize;
}

pub struct Disconnect {
    pub id: usize,
}
impl Message for Disconnect {
    type Result = ();
}

pub struct SignalServer {
    peers: HashMap<usize, Recipient<Signal>>,
}

impl SignalServer {
    pub fn new() -> SignalServer {
        SignalServer {
            peers: HashMap::new(),
        }
    }
}

impl Actor for SignalServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for SignalServer {
    type Result = usize;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        let id = self.peers.len();

        log::debug!("Peer connected. Generated id = {}", id);

        self.peers.insert(id.to_owned(), msg.signaller);

        id
    }
}

impl Handler<Disconnect> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        log::info!("Peer {} disconnected", msg.id);

        self.peers.remove(&msg.id);
    }
}

impl Handler<SignalReq> for SignalServer {
    type Result = ();

    fn handle(&mut self, msg: SignalReq, _: &mut Context<Self>) {
        let dests = self
            .peers
            .iter()
            .filter(|&(&peer_id, _)| peer_id != msg.from_id)
            .map(|(_, dest)| dest);

        for dest in dests {
            log::debug!("sending signal {:?} to {:?}", msg.signal, dest);
            dest.do_send(msg.signal.clone())
        }
    }
}
