## Aggregates

1. User
```
aggregate User {
    id: UserId
    name: Option<String>
    workstationId: WksId
    archived: boolean

    value UserId(GUID)

    value WksId(GUID)

    op archive()
}

op createUser(name: Option<String>): User

```
[comment]: <> (todo: rename Participant?)
2. Room
```
aggregate Room {
    id: RoomId
    name: string
    closed: boolean

    participants: {
        host: Participant
        guest: Option<Participant>
    }

    value RoomId(GUID)

    value Participant {
        userId: UserId
        name: Option<String>,
    }

    op join(
        userId: UserId,
        name: Option<String>
    ): Participant

    close()
}

op createRoom(
    userId: UserId, 
    roomName: String
): Room
```
