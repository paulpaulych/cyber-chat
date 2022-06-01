use actix::Recipient;
use crate::application::room_server::Signal;
use crate::domain::user::UserId;

#[derive(Clone, Debug)]
pub enum Role {
    HOST,
    GUEST
}

pub struct Peer {
    user_id: UserId,
    addr: Recipient<Signal>
}

pub struct ActiveRoom {
    host: Conn,
    guest: Conn
}

enum Conn {
    Expecting(Option<UserId>),
    Connected(Peer)
}

enum ConnErr {
    NotYourRoom,
    AlreadyConn { role: Role }
}

impl ActiveRoom {

    fn connect(&mut self, candidate: Peer) -> Result<Role, ConnErr> {
        match validate_conn_as(&self.host, &candidate) {
            Ok(()) => {
                self.host = Conn::Connected(candidate);
                Ok(Role::HOST)
            },
            Err(ValidationErr::AlreadyConn) =>
                Err(ConnErr::AlreadyConn { role: Role::HOST}),
            Err(ValidationErr::AnotherExpected) => {
                validate_conn_as(&self.guest, &candidate)
                    .map_err(|err| match err {
                        ValidationErr::AlreadyConn => ConnErr::AlreadyConn { role: Role::GUEST },
                        ValidationErr::AnotherExpected => ConnErr::NotYourRoom
                    })?;
                self.guest = Conn::Connected(candidate);
                Ok(Role::GUEST)
            }
        }
    }

    fn disconnect(&mut self, user_id: &UserId) {
        if user_id.is_connected_as(&self.host) {
            self.host = Conn::Expecting(Some(user_id.to_owned()));
            return
        }
        if user_id.is_connected_as(&self.host) {
            self.host = Conn::Expecting(Some(user_id.to_owned()));
            return
        }
    }
}

enum DisconnectRes {
    NoChange(Conn),
    Ok(Conn),
}

impl UserId {

    fn is_connected_as(&self, conn: &Conn) -> bool {
        match &conn {
            Conn::Expecting(_) => false,
            Conn::Connected(connected_user_id) => connected_user_id == self
        }
    }
}


enum ValidationErr {
    AnotherExpected,
    AlreadyConn
}

fn validate_conn_as(
    conn: &Conn,
    candidate: &Peer
) -> Result<(), ValidationErr>{
    match &conn {
        Conn::Connected(peer) => {
            if peer.user_id == candidate.user_id {
                Err(ValidationErr::AlreadyConn)
            } else {
                Err(ValidationErr::AnotherExpected)
            }
        },
        Conn::Expecting(Some(expected_user_id)) =>
            if expected_user_id != candidate.user_id {
                Err(ValidationErr::AnotherExpected)
            } else {
                Ok(())
            },
        Conn::Expecting(None) => Ok(())
    }
}