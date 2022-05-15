use sqlx::{Pool, Postgres};
use crate::PgPoolOptions;

pub async fn create_pg_pool(url: &str) -> Pool<Postgres> {
    PgPoolOptions::new()
        .max_connections(5)
        .connect(url)
        .await.unwrap()
}