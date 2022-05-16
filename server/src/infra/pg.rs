use sqlx::{PgPool, Pool, Postgres};
use sqlx::migrate::MigrateError;
use crate::PgPoolOptions;

pub async fn init_pg_pool(url: &str) -> Result<Pool<Postgres>, sqlx::Error> {
    let pg = PgPoolOptions::new()
        .max_connections(5)
        .connect(url)
        .await?;

    pg_migrate(&pg).await?;

    Ok(pg)
}

async fn pg_migrate(pg: &PgPool) -> Result<(), MigrateError> {
    sqlx::migrate!("./db/migrations")
        .run(pg)
        .await
}