use sqlx::Postgres;
use sqlx::postgres::PgArguments;
use sqlx::query::QueryAs;

pub type PgQuery<'a, T> = QueryAs<'a, Postgres, T, PgArguments> ;
