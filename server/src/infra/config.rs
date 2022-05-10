use std::env;
use std::env::VarError;

const DATA_PATH_ENV: &str = "DATA_PATH_ENV";

#[derive(Clone, Debug)]
pub struct Config {
    pub ui_data_path: String
}

impl Config {
    pub fn init_from_env() -> Result<Config, VarError> {
        Ok(Config {
            ui_data_path: env::var(DATA_PATH_ENV)?
        })
    }
}