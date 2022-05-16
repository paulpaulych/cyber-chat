use uuid::Uuid;

#[derive(Debug)]
pub struct WksId(pub Uuid);

impl WksId {
    pub fn new() -> WksId {
        WksId(Uuid::new_v4())
    }
}

impl From<&str> for WksId {
    fn from(s: &str) -> Self {
        WksId(Uuid::parse_str(s).unwrap())
    }
}
