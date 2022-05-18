use std::future::Future;

use sqlx::{Database, Pool, Postgres};
use sqlx::postgres::PgArguments;
use sqlx::query::QueryAs;

pub type PgQuery<'a, T> = QueryAs<'a, Postgres, T, PgArguments> ;

pub async fn tx<F, DB, Fut, T, E>(pool: &Pool<DB>, f: F) -> Result<Result<T, E>, sqlx::Error>
    where F: FnOnce() -> Fut,
          DB: Database,
          Fut: Future<Output = Result<T, E>>,
          E: std::error::Error
{
    let tx = pool.begin().await?;

    match f().await {
        Ok(res) => {
            tx.commit().await?;
            Ok(Ok(res))
        },
        Err(err) => {
            log::error!("rolling back transaction: {:?}", err);
            tx.rollback().await?;
            Ok(Err(err))
        }
    }
}

