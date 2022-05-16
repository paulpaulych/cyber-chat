create table if not exists users (
    id text primary key,
    name text null,
    wks_id text not null,
    archived boolean not null
);

create unique index uniq_wks_id on users(wks_id);