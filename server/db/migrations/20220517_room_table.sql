create table if not exists room
(
    id     text primary key,
    name   text    not null,
    closed boolean not null
);

create table if not exists host
(
    room_id text not null references room (id),
    user_id text not null references users (id),
    name    text null,

    unique (room_id, user_id)
);


create table if not exists guest
(
    room_id text not null references room (id),
    user_id text not null references users (id),
    name    text null,

    unique (room_id, user_id)
);
