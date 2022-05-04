use std::{
    collections::{HashMap},
};

use actix::prelude::*;

pub struct SignalReq {
    pub src: usize,
    pub signal: Signal,
}
impl Message for SignalReq {
    type Result = ();
}

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
        SignalServer { peers: HashMap::new() }
    }
}

impl Actor for SignalServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for SignalServer {
    type Result = usize;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        log::debug!("Someone connected");

        let id = self.peers.len();

        log::debug!("generated id = {}", id);

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
        let bla = msg.src;
        let dests = self
            .peers
            .iter()
            .filter(|&(&peer_id, _)| peer_id != bla)
            .map(|(_, dest)| dest);

        for dest in dests {
            dest.do_send(msg.signal.into())
        }
    }
}
