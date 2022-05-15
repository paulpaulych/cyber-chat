use std::env;
use std::env::VarError;

const DATA_PATH_ENV: &str = "DATA_PATH_ENV";
const PG_URL_ENV: &str = "PG_URL";

#[derive(Clone, Debug)]
pub struct Config {
    pub ui_data_path: String,
    pub pg_url: String,
}

impl Config {
    pub fn init_from_env() -> Result<Config, VarError> {
        Ok(Config {
            ui_data_path: env::var(DATA_PATH_ENV)?,
            pg_url: env::var(PG_URL_ENV)?
        })
    }
}