use std::borrow::Borrow;
use hmac::digest::KeyInit;
use hmac::Hmac;
use jwt::{SignWithKey, VerifyWithKey};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

#[derive(Serialize, Deserialize, PartialEq, Debug)]
pub struct Claims {
    pub user_id: String,
    pub wks_id: String,
}

#[derive(Clone)]
pub struct Jwt {
    secret: Hmac<Sha256>
}

impl Jwt {
    pub fn new(secret: &str) -> Jwt {
        Jwt { secret: Hmac::new_from_slice(secret.as_bytes()).unwrap() }
    }

    pub fn sign(&self, claims: Claims) -> String {
        claims.sign_with_key(self.secret.borrow()).unwrap()
    }

    pub fn verify(&self, jwt: String) -> Result<Claims, ()> {
        match jwt.verify_with_key(&self.secret) {
            Ok(claims) => {
                Ok(claims)
            },
            Err(_) => {
                Err(())
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "NTNv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=";

    const TOKEN: &str = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiVVNFUl9JRCIsIndrc19pZCI6IldLU19JRCJ9.owz8oNt7prmzKNjgQVm-COhscgfvByJFUR53hUklvEE";

    #[test]
    fn test_sign() {
        let token = Jwt::new(SECRET).sign(Claims {
            user_id: format!("USER_ID"),
            wks_id: format!("WKS_ID")
        });

        assert_eq!(token, TOKEN);
    }

    #[test]
    fn should_return_claims_on_valid_token() {
        let res = Jwt::new(SECRET).verify(String::from(TOKEN));

        let claims = res.expect("claims");
        assert_eq!(claims, Claims { user_id: format!("USER_ID"), wks_id: format!("WKS_ID") });
    }

    #[test]
    fn invalid_token() {
        let res = Jwt::new(SECRET).verify(String::from("invalidJwt"));

        res.expect_err("error expected")
    }
}

