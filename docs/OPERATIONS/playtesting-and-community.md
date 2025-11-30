# Operations: Playtesting Framework & Community Guidelines (플레이테스트 및 커뮤니티 가이드라인)

**Document Type**: Operations Document
**Status**: Active
**Last Updated**: 2025-11-30
**Target Audience**: Playtesters, Community Managers, Game Designers, Moderators

---

## PART 1: PLAYTESTING FRAMEWORK (플레이테스트 프레임워크)

### 1.1 Playtesting Overview

**Objective**: Identify game balance issues, broken mechanics, and player experience problems before public release.

**Timeline**:
- **Alpha Phase** (Months 1-2): Internal team playtesting
- **Closed Beta** (Months 3-4): 500-1000 selected testers
- **Open Beta** (Months 5-6): Unlimited participation
- **Pre-Launch** (Month 7): Final tuning and bug fixes
- **Launch**: Month 8

### 1.2 Playtesting Phases

#### 1.2.1 Alpha Playtesting (Internal)

**Participants**: Game designers, developers, balance team (10-15 people)

**Objectives**:
- Find critical bugs that crash the game
- Identify completely broken mechanics
- Test basic game flow and turn structure
- Validate card costs and stat distributions

**Schedule**:
- 3 playtests per week, 2 hours each
- Weekday sessions (3 times/week)
- Total: 24+ hours of gameplay per week

**Playtest Format**:
- **Format 1: Constructed** (pre-built decks with specific mechanics to test)
- **Format 2: Limited** (random card pools to test game feel)
- **Format 3: Stress Test** (100+ games in rapid succession to find rare bugs)

**Documentation**:
- Bugs logged in development tracker immediately
- Balance concerns noted in spreadsheet
- Video recording for critical issues
- Post-session debrief (30 minutes)

**Metrics Tracked**:
- Game crashes/errors
- Infinite loops or breaks
- Mechanics that don't work as designed
- Win rates by deck archetype
- Average game length
- Player enjoyment rating (1-10 scale)

#### 1.2.2 Closed Beta Playtesting

**Participants**: 500-1000 selected players (sign-up form)

**Recruitment**:
- Social media announcement
- TCG community forums
- Invitation to top competitive players
- Geographic diversity (US, EU, Asia)
- Skill level diversity (casual to pro)
- Gender diversity target (40%+ non-male)

**Selection Criteria**:
- Demonstrated history with TCGs
- Ability to provide detailed feedback
- Time commitment (8+ hours/week)
- Access to required devices
- Non-disclosure agreement (NDA) acceptance

**Testing Duration**: 4 weeks

**Playtest Activities**:

1. **Constructed Ladder** (Ranked):
   - Build decks from available cards
   - Ranked matchmaking
   - 20+ games per week per tester
   - Win rate tracking by deck archetype

2. **Limited Events** (Weekly):
   - Sealed deck tournaments (48-hour duration)
   - Draft events (unlimited, on-demand)
   - Measure player satisfaction

3. **Specific Mechanics Testing**:
   - Week 1: Combat system focus
   - Week 2: Ability resolution focus
   - Week 3: Meta deck testing
   - Week 4: Edge cases and corner rules

4. **Survey Feedback** (Weekly):
   - Player satisfaction (1-10)
   - Favorite/least favorite cards
   - Rules clarity questions
   - Bugs reported
   - Balance concerns

**Feedback Collection**:
- **In-Game**: Feedback buttons on specific cards
- **Survey**: Weekly Google Form survey
- **Discord**: Private Discord server for testers
- **Forums**: Dedicated forum for suggestions
- **Email**: Direct email for critical bugs

**Data Analysis**:
- Win rates calculated for each archetype
- Inclusion rates for each card
- Player satisfaction aggregated
- Bug frequency ranked by severity

**Communication**:
- Weekly playtest update blog post
- Friday development diary
- Acknowledge top contributors
- Transparency on what changes will be made

#### 1.2.3 Open Beta Playtesting

**Participants**: Unlimited (anyone with account)

**Duration**: 2 weeks

**Server Configuration**:
- Lower server requirements (accommodate peak load)
- Matchmaking queue prioritization
- Automatic disconnection after 30 minutes inactive
- Regular maintenance windows (announced 48 hours prior)

**Data Tracking** (Larger Scale):
- Win rates calculated hourly
- Meta evolution tracked daily
- Deck popularity distribution
- Bug reports aggregated by category
- Player feedback compilation

**Focus Areas**:
- Deck archetype balance (final tweaks)
- New player experience (onboarding flow)
- Tutorial clarity (players complete without help?)
- Community feedback (most common requests)
- Server stability (stress testing)

**Communication**:
- Daily updates on balance changes being considered
- Transparent discussion of controversial cards
- Regular town halls (live streams with Q&A)
- Acknowledgment of community feedback

### 1.3 Balance Testing Methodology

#### 1.3.1 Metrics and Analysis

**Win Rate Analysis**:
```
Archetype A: 55% win rate (slightly strong, acceptable)
Archetype B: 62% win rate (too strong, needs nerf)
Archetype C: 42% win rate (too weak, needs buff)
Target: All archetypes between 48-52% win rate
```

**Inclusion Rate** (percentage of decks using card):
```
Card X: 85% of decks (over-included, possibly too efficient)
Card Y: 15% of decks (under-included, possibly too weak)
Card Z: 40% of decks (good balance)
Target: Most cards between 30-60% inclusion
```

**Meta Diversity**:
- Count number of distinct viable decks
- Target: 8-12 competitive deck archetypes
- If <5: Meta stale, needs balance changes
- If >15: Meta scattered, some cards underused

#### 1.3.2 Decision Framework for Balance Changes

| Metric | Action |
|--------|--------|
| Win rate >58% | Schedule nerf (reduce cost OR reduce stats/effects) |
| Win rate 48-58% | Monitor, may not need change |
| Win rate <45% | Schedule buff (reduce cost OR increase stats/effects) |
| Inclusion >75% | Likely too strong, may need nerf |
| Inclusion <20% | Likely too weak, may need buff |
| Only 1 viable deck | Meta is stale, need balance overhaul |
| Infinite loops possible | Immediate fix required |

#### 1.3.3 Change Implementation

**Minor Changes** (can go live immediately):
- Cost changes (±1 CE)
- Stat changes (±1 ATK/DEF)
- Keyword addition/removal

**Major Changes** (require 1-week notice):
- Text rewrites (changing ability function)
- Card type changes
- Rarity changes

**Card Bans** (require 2-week notice):
- Announced in advance
- Players offered refund/replacement
- Removed from future printings

### 1.4 Playtest Reporting

**Weekly Report Structure**:

```
WEEK 3 PLAYTEST REPORT

EXECUTIVE SUMMARY:
- 4,250 games played this week
- 8 distinct meta archetypes
- Average game length: 12 minutes
- Player satisfaction: 8.1/10

BALANCE DATA:
- Strongest archetype: Combo Deck (56% WR)
- Weakest archetype: Control Deck (43% WR)
- Recommendation: Nerf Combo Deck by 2% (reduce card cost or effect)

TOP COMPLAINTS:
1. Card X feels overpowered (mentioned 234 times)
2. Matchmaking pairing seems unfair (89 times)
3. Tutorial doesn't explain Rule Y (67 times)

BUGS REPORTED:
- [CRITICAL] Infinite loop possible with Cards A+B (reproduce rate: 100%)
- [MAJOR] Combat damage calculation incorrect in edge case
- [MINOR] Typo in Card C flavor text

RECOMMENDATIONS:
1. Fix infinite loop immediately
2. Nerf Card X by reducing cost from 5 to 6 CE
3. Improve tutorial explanation of Rule Y
4. Monitor Archetype B (approaching 55% win rate)
```

### 1.5 Playtest Incentives

**Reward System**:
- **Daily Participation**: +5 playcoin (in-game currency)
- **Weekly Survey**: +50 playcoin
- **Bug Reports**: +100 playcoin per critical bug, +20 per minor
- **Top Contributors**: Monthly rewards ($50-200 store credit)
- **Random Drawings**: Monthly drawing of all testers for prizes

**Recognition**:
- Top playtesters listed on website
- Special "Playtester" title in-game
- Exclusive playtester cosmetics
- Special mention in credits

**End-of-Beta Rewards**:
- All closed beta testers: 500 playcoin
- Top 100 testers (by contribution): Exclusive full-art card playset
- Top 10 testers: $500 store credit

### 1.6 Handling Playtest Feedback

**Feedback Evaluation Process**:

1. **Collection**: Feedback gathered from all sources (surveys, Discord, forums, email)
2. **Categorization**: Grouped by card/mechanic/system affected
3. **Analysis**: Validity assessed (is problem real or perception?)
4. **Priority**: Ranked by severity and frequency
5. **Decision**: Implement, monitor, or reject (with explanation)
6. **Communication**: Feedback team responds to submitter within 7 days

**Response Template**:
```
Thank you for your feedback about Card X!

We appreciate your report. After analyzing playtest data:
- Card X currently has 52% win rate (within target range)
- Inclusion rate is 45% (healthy diversity)
- We have received 12 reports of similar concerns

Decision: We will monitor Card X for one more week. If win rate
rises above 55%, we will consider a cost increase from 4 to 5 CE.

We value your feedback and will update you on our decision.
- Balance Team
```

---

## PART 2: COMMUNITY GUIDELINES (커뮤니티 가이드라인)

### 2.1 Community Overview

**Platform Scope**:
- Official Discord server
- Official forums
- Subreddit (r/JujutsuKaisenCB)
- In-game chat systems
- Official social media (Twitter, YouTube, TikTok)

**Community Goal**: Create welcoming, inclusive, competitive, and fun environment for all players.

### 2.2 Community Values

1. **Respect**: Treat all community members with dignity
2. **Inclusion**: Welcome players of all backgrounds and skill levels
3. **Fairness**: Enforce rules equally, no favoritism
4. **Transparency**: Community managers explain decisions
5. **Safety**: Zero tolerance for harassment or threats
6. **Fun**: Game should be enjoyable above all else

### 2.3 Code of Conduct

#### 2.3.1 Prohibited Behavior

**Zero Tolerance (Immediate Ban)**:
- Harassment, bullying, or personal attacks
- Hate speech (slurs, racism, sexism, homophobia)
- Sexual content or sexual harassment
- Threats of violence or harm
- Doxxing (sharing personal information)
- Spam or botting

**Suspension Offenses** (1-7 day suspension):
- Repeated rule violations after warning
- Rudeness or disrespect toward moderators
- Advertising unrelated products
- Posting spoiler content without tags
- Profanity (context-dependent)

**Warnings** (First-time lesser violations):
- Friendly disagreement taken too far
- Minor off-topic discussion
- Unintentional rule violation (if educated, likely no action)

#### 2.3.2 Discussion Guidelines

**Permitted Topics**:
- Card balance and mechanics
- Deck building and strategy
- Tournament results and analysis
- Game news and announcements
- Jujutsu Kaisen anime/manga (relevant to game)
- Casual game chat
- Suggestions and feedback

**Off-Topic (Allowed in designated channels only)**:
- Other TCGs (permitted in #off-topic)
- Personal life updates (permitted in #general-chat)
- Non-game topics (permitted in #off-topic)

**Prohibited Topics**:
- Politics (unrelated to game)
- Religion (unrelated to game)
- Other games (except brief mentions)
- Illegal activities
- Discussions promoting hate

#### 2.3.3 Appropriate Content

**Image Guidelines**:
- No NSFW content
- No graphic violence
- No hate symbols
- Anime/game-related art encouraged
- Real people should have consent

**Language**:
- Profanity acceptable in context-appropriate channels
- Slurs and hate speech absolutely forbidden
- Excessive profanity discouraged (flagged as spam)
- All languages welcome, English preferred in main chat

**Spoiler Protection**:
- Anime spoilers must be tagged `[SPOILER ANIME]`
- Manga spoilers must be tagged `[SPOILER MANGA]`
- Future set spoilers tagged `[SPOILER SET]`
- Discussion of spoilers allowed in spoiler channels

### 2.4 Moderation Structure

#### 2.4.1 Moderation Team

**Positions**:
- **Community Manager** (1): Oversees all moderation, makes policy decisions
- **Senior Moderators** (3-5): Handle appeals, serious violations
- **Moderators** (10-20): Day-to-day moderation, warnings
- **Volunteers** (20-50): Assist with community events, basic support

**Selection Criteria**:
- Active community member (6+ months)
- Demonstrated leadership and fairness
- Time commitment (5+ hours/week)
- Bias prevention training completed
- Background check (basic verification)

**Moderation Training**:
- Code of Conduct review
- De-escalation techniques
- Bias awareness training
- Privacy and confidentiality
- Decision documentation

#### 2.4.2 Moderation Actions

**Warning** (Step 1):
- Private message to user
- Explanation of violation
- Opportunity to respond
- No action taken if user explains/apologizes

**Suspension** (Step 2):
- Duration: 1-7 days (depends on severity)
- User cannot post during suspension
- Can still read content
- Reason communicated in message
- Appeal process available

**Ban** (Step 3):
- Permanent removal from community
- All accounts banned (including alts)
- Option to appeal after 30 days
- Reason logged for transparency

**Silencing** (Alt to Suspension):
- User can still read but cannot post
- Used for spam or pattern violations
- Easier enforcement than suspension
- Lifted after correction or after duration

#### 2.4.3 Appeal Process

**Appeal Submission**:
- Email appeal@[domain] within 7 days of action
- Explain why action was unfair
- Provide any evidence/context

**Appeal Review**:
- Senior moderator reviews (not original moderator)
- Additional context gathered
- Decision made within 7 days
- Outcome communicated via email

**Grounds for Appeal**:
- Misinformation about violation
- Disproportionate punishment
- Violation of moderation policy
- Evidence of bias

**Successful Appeal Outcomes**:
- Action lifted (full reinstatement)
- Reduced action (shorter suspension)
- Escalation to Community Manager
- Appeal denied with explanation

### 2.5 Community Channels and Categories

**Discord Server Structure**:

```
📢 ANNOUNCEMENTS
└─ #official-news - Game updates and patch notes

🎮 GAMEPLAY
├─ #deck-building - Strategy and deck construction
├─ #card-discussion - Balance and mechanics discussion
├─ #tournament - Competitive scene news
└─ #rules-questions - Game rule clarifications

🤝 COMMUNITY
├─ #introduce-yourself - New member introductions
├─ #general-chat - Casual conversation
├─ #art-showcase - Community artwork and cosplay
└─ #streaming - Links to Twitch/YouTube streams

🎤 EVENTS
├─ #community-events - Community-organized tournaments
└─ #tournament-results - Post match results and discussion

🔨 SUPPORT
├─ #bug-reports - Report technical issues
├─ #feedback - Suggest game improvements
└─ #support - Customer support issues

⚙️ ADMIN
├─ #moderators - Mod discussion (private)
└─ #transparency - Moderation decisions (public-facing)
```

**Channel Rules**:
- **Stay on topic**: Discuss relevant content to channel
- **No spam**: No repeated messages or excessive notifications
- **Search first**: Check pinned messages for FAQs
- **Use threads**: Reply to discussions in threads when possible
- **Respect quiet hours**: No notifications 12am-8am local time

### 2.6 Community Events

#### 2.6.1 Official Events

**Monthly Community Tournaments**:
- Date: First Saturday of each month
- Format: Online Swiss (3 rounds)
- Entry: Free
- Prize: Store credit and cosmetics for top 8
- All skill levels welcome

**Weekly Community Streams**:
- Hosted on official Twitch
- Feature: Pro player games, deck techs, interviews
- Chat integration with in-game rewards
- Rebroadcast on YouTube

**Seasonal Challenges**:
- Monthly challenge (complete 20 games)
- Completion reward: 500 playcoin
- Leaderboard tracking
- Top 10 receive exclusive cosmetics

**Seasonal Festivals** (4x/year):
- Special events with unique rules
- Limited-time cosmetics
- Community-driven voting on event rules
- 2-week duration

#### 2.6.2 Community-Organized Events

**Grassroots Tournaments**:
- Community organizers welcome to host events
- Must follow game rules and Code of Conduct
- Event applications approved by Community Manager
- Organizer receives promotional support

**Streamer Programs**:
- Partner streamers get platform on official channel
- Subscription revenue sharing (50/50 split)
- Early access to spoilers and new cards
- Official status and badge

**Content Creator Fund**:
- Monthly fund ($2000) distributed to content creators
- Application-based: quality, views, engagement
- Grants of $50-500 depending on contribution
- Transparency on distribution decisions

### 2.7 Community Safety

#### 2.7.1 Harassment and Bullying Prevention

**Policy**:
- Zero tolerance for targeted harassment
- Single incident may result in ban for severe cases
- Pattern of behavior results in escalating action
- Context considered (banter between friends ≠ harassment)

**Examples of Harassment**:
- Repeated unwanted contact after person asks to stop
- Insults based on identity (race, gender, sexuality, disability)
- Sexual advances or comments
- Threats or intimidation
- Mocking or memes targeting specific person

**Reporting Harassment**:
- Report in DMs to moderators
- Include context and timeline
- Screenshots or video evidence helpful
- Confidentiality protected (harasser not told who reported)

#### 2.7.2 Mental Health Support

**Crisis Resources** (pinned in #support):
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

**Community Culture**:
- Takes mental health seriously
- Celebrates competition but not at cost of wellbeing
- Encourages breaks from gaming if needed
- Supports players dealing with personal issues

#### 2.7.3 Protecting Minors

**Policies**:
- No private messages with users under 18 (unless staff)
- No sexual or romantic content involving minors
- Parental permission required for accounts under 13
- Age verification available (optional, for youth tournaments)

**Monitoring**:
- Moderators watch for grooming behavior
- Reports of inappropriate contact investigated
- Perpetrators banned immediately
- Authorities notified if appropriate

### 2.8 Community Communication

#### 2.8.1 Official Channels

**Development Updates**:
- Friday Development Diary (blog post)
- Monthly State of the Game (live stream)
- Patch notes posted 1 week before release
- Advance notice of major changes (1+ month)

**Transparency**:
- Balance change reasoning explained
- Community feedback acknowledged
- Decisions that reject popular feedback explained
- Moderation decisions published (with privacy protection)

**Community Manager AMA** (Ask Me Anything):
- Quarterly live streams
- Open Q&A about game, community, future plans
- Recorded and uploaded to YouTube

#### 2.8.2 Social Media

**Official Accounts**:
- Twitter: @JKCardBattle (game updates, news)
- YouTube: Jujutsu Kaisen Card Battle (official gameplay, tutorials)
- TikTok: @JKCardBattle (short gameplay clips, memes)
- Instagram: @JKCardBattle (art, cosplay, events)

**Community Social Media**:
- Subreddit: r/JujutsuKaisenCB (moderated by community volunteers)
- Fan art retweets with credit
- Community creations featured monthly

### 2.9 Community Recognition Program

#### 2.9.1 Badges and Titles

**In-Game Titles**:
- "Playtester" (participated in closed/open beta)
- "Tournament Champion" (won monthly tournament)
- "Community Builder" (organized events, 50+ participants)
- "Guide" (answered 100+ rules questions with >90% accuracy)
- "Streamer" (partner streamer)

**Discord Roles**:
- @Playtester (beta testers)
- @Tournament Champion (monthly winners)
- @Content Creator (streamers, artists)
- @Moderator (community moderators)
- @Verified Account (verified pro players)

#### 2.9.2 Hall of Fame

**Monthly Recognition**:
- Top 10 most helpful community members
- Best community artwork
- Best community-organized event
- Funniest memes/clips
- Featured in monthly community highlight video

**Annual Recognition**:
- Community Player of the Year (won most tournaments)
- Community Helper of the Year (helped most players)
- Community Creator of the Year (best content)
- Community Event Organizer of the Year

---

## PART 3: COMMUNITY RESOURCES

### 3.1 New Player Resources

**Learning Path**:
1. Watch official tutorial video (5 minutes)
2. Read beginner's rulebook (10 minutes)
3. Play practice games against AI (30 minutes)
4. Join #new-players channel for questions
5. Complete tutorial tournament (best-of-3 against starter deck)

**Starter Decks** (Free):
- 3 pre-built decks covering different archetypes
- Can duplicate cards to optimize
- Enough to be competitive in casual play

**Community Mentorship Program**:
- Experienced players volunteer as mentors
- Match with new players based on timezone/interests
- Weekly 1-on-1 coaching sessions
- Mentor receives cosmetics/playcoin as incentive

### 3.2 Reference Materials

**Official Wiki**: community.jkcardbattle.com/wiki
- Card database searchable
- Rules clarifications
- Meta analysis
- Tournament results

**YouTube Channel**: All official videos
- Tutorial series (beginner to advanced)
- Set review videos
- Pro player interviews
- Deck techs by community members

**Deck Building Tool**: deckbuilder.jkcardbattle.com
- Test deck legality
- Calculate mana curves
- Share deck codes
- Analyze card statistics

### 3.3 Accessibility

**Accessibility Commitment**:
- Game designed for players with disabilities
- Colorblind mode available
- Text-to-speech for card effects
- High contrast UI option
- Adjustable game speed (for processing speed)

**Community Accessibility**:
- Discord uses accessible formatting
- Streams captioned (live and archive)
- Alt-text on all images
- Content warnings for flashing/seizure-inducing effects

### 3.4 Reporting Violations

**Reporting Procedure**:
- In-game report button (three-dot menu on player profile)
- Discord: Message any moderator
- Email: conduct@[domain]
- Anonymous reporting form: jkcardbattle.com/report

**Report Contents**:
- Specific violation (be detailed)
- When it occurred
- Evidence (screenshots, usernames, links)
- Your contact info (optional but helpful for follow-up)

**Response Timeline**:
- Acknowledgment within 24 hours
- Initial investigation within 7 days
- Resolution within 14 days
- Outcome communicated to reporter (unless they request anonymity)

---

**Last Reviewed**: 2025-11-30
**Next Review**: 2026-03-30

These guidelines are living documents and may be updated as the community evolves. Material changes communicated to community members.
