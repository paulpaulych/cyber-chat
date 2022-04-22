# **Video Chat**

# Glossary
1. **Conference** - video call between two people
2. **Conference owner** - person who created conference
3. **Local conference settings** - settings that participant can apply on his/her own
4. **Shared conference settings** - settings that require another participant's agreement/approval
5. **Recent user** - person who has unfinished conferences

# Use Cases by roles

## User (unknown main page visitor)
1. Create conference
2. Join conference

## Recent user
1. View list of recent(unfinished) conferences
1. Join recent conference
3. End recent conference

## Conference participant
1. Configure conference
   1. Configure local settings
   2. Configure shared settings
2. Leave the conference without its finishing
3. Leave conference without ending the conference

# Requirements
1. The conference is held using a web browser
2. Only one person except call owner can join conference. Another tryer should get corresponding message
3. Conference participation should be durable(i.e., leaving a conference page by participant should not finish a conference, local and shared settings should be saved)
4. Mic and webcam should be disabled by default when creating or joining a conference

### Appendix

## Local Setting
1. Participant name

## Common settings
1. Conference name
2. Conference time-to-live