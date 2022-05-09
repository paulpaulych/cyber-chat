``# **Video Chat**

# Glossary
1. **Room** - video call between two people
2. **Room owner** - person who created room
3. **Local room settings** - settings that participant can apply on his/her own
4. **Shared room settings** - settings that require another participant's agreement/approval
5. **Recent user** - person who has unfinished rooms

# Use Cases by roles

## User (unknown main page visitor)
1. Create room
2. Join room

## Recent user
1. View list of recent(unfinished) rooms
1. Join recent room
3. End recent room

## Room participant
1. Configure room
   1. Configure local settings
   2. Configure shared settings
2. Leave the room without its finishing
3. Leave room without ending the room

# Requirements
1. The room is held using a web browser
2. Only one person except call owner can join room. Another tryer should get corresponding message
3. Room participation should be durable(i.e., leaving a room page by participant should not finish a room, local and shared settings should be saved)
4. Mic and webcam should be disabled by default when creating or joining a room

### Appendix

## Local Setting
1. Participant name

## Common settings
1. Room name
2. Room time-to-live