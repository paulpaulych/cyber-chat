use uuid::Uuid;

pub struct WksId(Uuid);
impl WksId {
    pub fn new() -> WksId {
        WksId(Uuid::new_v4())
    }
}