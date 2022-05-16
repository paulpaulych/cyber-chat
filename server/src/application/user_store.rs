use sqlx::{PgPool, FromRow, Postgres};
use sqlx::postgres::PgArguments;
use sqlx::query::QueryAs;
use crate::domain::user::{User, UserId};
use crate::domain::workstation::WksId;

#[derive(Clone)]
pub struct UserStore {
    pub(crate) pool: PgPool
}

#[derive(FromRow)]
struct UserRow {
    id: String,
    wks_id: String,
    name: Option<String>,
    archived: bool
}

type PgQuery<'a, T> = QueryAs<'a, Postgres, T, PgArguments> ;

impl UserStore {

    pub async fn find_by_id(&self, id: UserId) -> Option<User> {
        (sqlx::query_as("select id, wks_id, name, archived from users where id = $1")
            as PgQuery<UserRow>)
            .bind(id.0.to_string())
            .fetch_optional(&self.pool)
            .await.unwrap()
            .map(User::from)
    }

    pub async fn find_by_wks_id(&self, wks_id: WksId) -> Option<User> {
        (sqlx::query_as(
            "select id, wks_id, name, archived from users where wks_id = $1")
            as PgQuery<UserRow>)
            .bind(wks_id.0.to_string())
            .fetch_optional(&self.pool)
            .await.unwrap()
            .map(User::from)
    }

    pub async fn save(&self, user: &User) {
        sqlx::query("insert into users(id, wks_id, name, archived) values ($1, $2, $3, $4)")
            .bind(user.id.0.to_string())
            .bind(user.wks_id.0.to_string())
            .bind(&user.name)
            .bind(user.archived)
            .execute(&self.pool)
            .await.unwrap();
    }

    fn extract_user(&self, row: (String, String, Option<String>, bool)) -> User {
        User {
            id: UserId::from(&*row.0),
            wks_id: WksId::from(&*row.1),
            name: row.2,
            archived: row.3
        }
    }
}

impl From<&User> for UserRow {
    fn from(user: &User) -> Self {
        UserRow {
            id: user.id.0.to_string(),
            wks_id: user.wks_id.0.to_string(),
            archived: user.archived,
            name: user.name.clone(),
        }
    }
}

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        User {
            id: UserId::from(&*row.id),
            wks_id: WksId::from(&*row.wks_id),
            name: row.name,
            archived: row.archived,
        }
    }
}