use crate::application::security::jwt::{Claims, Jwt};
use crate::application::user_store::UserStore;
use crate::domain::user::{User};
use crate::domain::workstation::WksId;

type Token = String;

pub struct LoginHandler<'a> {
    pub jwt_utils: &'a Jwt,
    pub users: &'a UserStore,
}

impl LoginHandler<'_> {
    pub async fn login(
        &self,
        wks_id: Option<&str>,
    ) -> Result<(Token, Option<WksId>), &str> {
        let (user, wks_id) = match wks_id {
            None => {
                let wks_id = WksId::new();
                let user = User::new(None, WksId(wks_id.0));
                log::debug!("saved new user: {:?}", &user);
                self.users.save(&user).await;
                (user, Some(wks_id))
            }
            Some(wks_id) => {
                let user = self.users.find_by_wks_id(WksId::from(wks_id))
                    .await
                    .ok_or_else(|| "User not found")?;
                log::debug!("logging in user: {:?}", &user);
                (user, None)
            }
        };

        Ok((self.create_token(user), wks_id))
    }

    fn create_token(&self, user: User) -> Token {
        return self.jwt_utils.sign(Claims {
            user_id: user.id.0.to_string(),
            wks_id: user.wks_id.0.to_string(),
        });
    }
}
