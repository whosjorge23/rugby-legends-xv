# Rugby Dream XV — MVP Specification for Codex

## Goal
Create a web app inspired by the “7-0” fantasy/team-building concept, but for rugby.

The app lets the user roll a random historical rugby national team, pick one player from that team, build a full rugby XV, and then simulate a Rugby World Cup-style run.

## Important constraint for Phase 1
Phase 1 must be implemented **without backend and without database**.

Use only frontend code and local/static data.

However, structure the project so that a backend and database can be added later without rewriting everything.

Recommended stack:

- React
- TypeScript
- Vite
- Local JSON/mock data
- LocalStorage for saved runs
- CSS modules or simple CSS

Later backend idea:

- Vapor / Node backend
- PostgreSQL database
- REST API for teams, players, simulations, users, leaderboards, daily challenges

---

# App Name
Working title: **Rugby Legends XV**

Other possible names:

- Rugby Legends XV
- Build Your XV
- Road to Webb Ellis
- XV Builder
- Rugby Time Machine

Use **Rugby Legends XV** for now.

---

# Core Game Loop

1. User selects formation/style if needed.
2. User clicks **Roll**.
3. App randomly draws a historical national rugby team and tournament year.
4. User sees a list of players from that squad.
5. User picks one player.
6. Player is placed into the correct rugby position on the pitch.
7. User repeats until the full XV is complete.
8. User clicks **Simulate Cup**.
9. App simulates matches against historical national teams.
10. App shows final result and share card.

---

# Rugby Positions

The team must have 15 players:

```ts
const positions = [
  { id: 'LH', number: 1, name: 'Loosehead Prop' },
  { id: 'HK', number: 2, name: 'Hooker' },
  { id: 'TH', number: 3, name: 'Tighthead Prop' },
  { id: 'LO4', number: 4, name: 'Lock' },
  { id: 'LO5', number: 5, name: 'Lock' },
  { id: 'BF', number: 6, name: 'Blindside Flanker' },
  { id: 'OF', number: 7, name: 'Openside Flanker' },
  { id: 'N8', number: 8, name: 'Number Eight' },
  { id: 'SH', number: 9, name: 'Scrum-half' },
  { id: 'FH', number: 10, name: 'Fly-half' },
  { id: 'LW', number: 11, name: 'Left Wing' },
  { id: 'IC', number: 12, name: 'Inside Centre' },
  { id: 'OC', number: 13, name: 'Outside Centre' },
  { id: 'RW', number: 14, name: 'Right Wing' },
  { id: 'FB', number: 15, name: 'Fullback' }
]
```

For Phase 1, keep the standard 15-player rugby union formation.

---

# Main Screens

## 1. Home Screen

Hero style similar to the screenshots:

- Big title: **Dream XV**
- Subtitle: **Roll the dice. Build your legendary rugby team.**
- CTA button: **Play Now**
- Secondary button: **Daily Challenge** but disabled for Phase 1
- Button: **With Friends** but disabled for Phase 1

Show a rugby pitch preview with sample players.

---

## 2. Build Screen

Layout:

- Left panel:
  - Roll card
  - Current drawn team
  - Re-roll buttons
  - Player list
- Center:
  - Rugby pitch with 15 position slots
- Right panel:
  - Box score / team rating
  - List of selected players

### Roll behavior

When the user clicks **Roll**, randomly select one historical squad from local JSON.

Example drawn card:

```txt
DRAWN
🇳🇿 New Zealand
World Cup 2015
```

Then show available players from that squad.

Each player row should show:

```txt
#10 Dan Carter    FH    95
```

When clicked, the player goes to the correct position.

If a position is already filled, ask the user to confirm replacement.

### Re-roll behavior

Allow limited re-rolls:

- 3 team re-rolls
- 3 tournament/year re-rolls

For Phase 1, this can be simplified:

- Button: **Another Team**
- Button: **Another Cup**
- Each starts with 3 uses

---

## 3. Completed Lineup Screen State

When 15/15 positions are filled:

- Show **Lineup Complete 15/15**
- Show button: **Simulate the Cup**

Calculate:

- Overall rating
- Attack rating
- Defense rating
- Kicking rating
- Discipline rating

Simple calculation for MVP:

```ts
overall = average(player.overall)
attack = average(player.attack)
defense = average(player.defense)
kicking = average(player.kicking)
discipline = average(player.discipline)
```

---

## 4. Simulation Screen

The app simulates a Rugby World Cup-style run.

For Phase 1, keep it simple:

- 3 group stage matches
- Quarter-final
- Semi-final
- Final

The user’s team plays against random historical squads.

Each match should show:

```txt
GROUPS
Your Team vs 🇫🇷 France 1999
24 - 17 ✓
```

or

```txt
QUARTER FINAL
Your Team vs 🇿🇦 South Africa 2019
18 - 22 ✕
```

### Match simulation MVP

Use a simple formula:

```ts
userStrength = userTeam.overall + random(-10, 10)
opponentStrength = opponent.overall + random(-10, 10)
```

Convert strength into rugby-like score.

Example:

```ts
userScore = generateRugbyScore(userStrength)
opponentScore = generateRugbyScore(opponentStrength)
```

Scores should feel realistic:

- 12-9
- 18-15
- 24-17
- 31-28
- 35-12

Avoid football scores like 1-0 or 2-1.

### Events

For Phase 1, generate fake match events:

- Try
- Conversion
- Penalty
- Drop Goal
- Yellow Card

Example:

```txt
12' TRY — Jonah Lomu
13' CONVERSION — Dan Carter
28' PENALTY — Jonny Wilkinson
61' TRY — Bryan Habana
```

Events do not need to perfectly match the score in Phase 1, but try to make them plausible.

---

## 5. Final Result Screen

Show:

- Eliminated / Champion
- Final record
- Points For
- Points Against
- Overall team rating
- Wins
- Full selected XV

Example:

```txt
ELIMINATED
Quarter-final

Points For: 89
Points Against: 62
Overall: 87
Wins: 3
```

Show the selected XV as a vertical card list:

```txt
1 Os du Randt      🇿🇦 RSA 1995
2 Keith Wood       🇮🇪 IRE 1999
3 Jason Leonard    🏴 ENG 2003
...
10 Dan Carter      🇳🇿 NZL 2015
...
15 Serge Blanco    🇫🇷 FRA 1987
```

Add button:

- **Replay**
- **Build Another XV**

---

# Data Model

Use local JSON or TypeScript objects for Phase 1.

## Player model

```ts
export type Player = {
  id: string
  name: string
  country: string
  countryCode: string
  flag: string
  year: number
  tournament: string
  shirtNumber: number
  position: RugbyPositionId
  secondaryPositions?: RugbyPositionId[]
  overall: number
  attack: number
  defense: number
  kicking: number
  discipline: number
  speed?: number
  power?: number
  leadership?: number
}
```

## Squad model

```ts
export type Squad = {
  id: string
  country: string
  countryCode: string
  flag: string
  year: number
  tournament: string
  overall: number
  players: Player[]
}
```

## Selected team model

```ts
export type SelectedTeam = {
  slots: Record<RugbyPositionId, Player | null>
}
```

## Match model

```ts
export type SimulatedMatch = {
  id: string
  stage: 'Groups' | 'Quarter-final' | 'Semi-final' | 'Final'
  opponent: Squad
  userScore: number
  opponentScore: number
  result: 'win' | 'loss' | 'draw'
  events: MatchEvent[]
}
```

## Match event model

```ts
export type MatchEvent = {
  minute: number
  type: 'TRY' | 'CONVERSION' | 'PENALTY' | 'DROP_GOAL' | 'YELLOW_CARD'
  playerName: string
  team: 'user' | 'opponent'
}
```

---

# Sample Data for MVP

Create at least 8 historical squads for Phase 1.

Suggested squads:

- New Zealand 2015
- South Africa 1995
- South Africa 2007
- South Africa 2019
- England 2003
- Australia 1991
- Australia 1999
- France 1999
- France 2011
- Ireland 2023
- Argentina 2007
- Wales 2011

Each squad should have at least 15 players.

For the MVP, ratings can be manually invented but should feel realistic.

Example:

```ts
{
  id: 'nz-2015',
  country: 'New Zealand',
  countryCode: 'NZL',
  flag: '🇳🇿',
  year: 2015,
  tournament: 'World Cup',
  overall: 94,
  players: [
    {
      id: 'dan-carter-2015',
      name: 'Dan Carter',
      country: 'New Zealand',
      countryCode: 'NZL',
      flag: '🇳🇿',
      year: 2015,
      tournament: 'World Cup',
      shirtNumber: 10,
      position: 'FH',
      overall: 97,
      attack: 94,
      defense: 82,
      kicking: 99,
      discipline: 90,
      leadership: 95
    }
  ]
}
```

Important: do not use official logos, official competition branding, or copyrighted images in Phase 1. Use text, flags, and simple shapes only.

---

# UI Style

Use a retro sports newspaper / old tournament style.

Visual direction:

- Cream background
- Black bold typography
- Gold accent
- Red/orange primary CTA
- Green rugby pitch
- Big numbers
- Thick borders
- Slight shadow offset

Suggested colors:

```css
:root {
  --bg: #f4ecd8;
  --paper: #fffaf0;
  --black: #171713;
  --muted: #77705f;
  --gold: #caa246;
  --red: #ef3e2d;
  --green: #2f7f4f;
  --green-dark: #256a42;
  --line: #d8ccb0;
}
```

Use responsive design:

- Desktop: three columns
- Tablet: pitch center, panels stacked
- Mobile: vertical layout

---

# Components to Create

```txt
src/
  components/
    Header.tsx
    HomeHero.tsx
    RugbyPitch.tsx
    PositionSlot.tsx
    RollPanel.tsx
    PlayerList.tsx
    RatingPanel.tsx
    MatchCard.tsx
    ResultCard.tsx
    Button.tsx
  data/
    squads.ts
    positions.ts
  hooks/
    useGameState.ts
  logic/
    ratings.ts
    simulation.ts
    random.ts
  types/
    rugby.ts
  pages/
    HomePage.tsx
    BuildPage.tsx
    SimulationPage.tsx
    ResultPage.tsx
```

Use React Router if needed.

Routes:

```txt
/
/build
/simulation
/result
```

---

# State Management

For Phase 1, use React state or Zustand.

Persist current run in LocalStorage:

```txt
dreamXV_currentRun
```

Persist completed runs:

```txt
dreamXV_completedRuns
```

The user should be able to refresh the page and continue the current lineup.

---

# Game Rules for Phase 1

## Picking players

- One pick per roll.
- Player goes into his primary position by default.
- If the primary position is filled, allow compatible secondary position.
- If all compatible positions are filled, ask to replace an existing player.

## Re-rolls

- 3 team re-rolls per run.
- 3 cup/year re-rolls per run.

## Completion

- The lineup is complete when all 15 positions are filled.

## Simulation

- If the user loses a knockout match, the run ends.
- If the user wins the final, show Champion screen.
- Group stage can be simple: user advances with 2+ wins.
- If user has fewer than 2 group wins, eliminated in group stage.

---

# Future Backend and Database Plan

Do not implement this in Phase 1, but organize code so it can be added later.

## Future database tables

```txt
users
players
squads
tournaments
runs
run_players
matches
match_events
daily_challenges
leaderboards
```

## Future API endpoints

```txt
GET /squads
GET /squads/:id
GET /players
POST /runs
GET /runs/:id
POST /runs/:id/pick
POST /runs/:id/simulate
GET /daily-challenge
POST /daily-challenge/submit
GET /leaderboard
```

## Future features

- User accounts
- Daily challenge
- Global leaderboard
- Shareable result cards
- Multiplayer seed mode
- Friends challenge
- Admin panel to add/edit squads and players
- Real historical match data
- Advanced simulation engine
- Player chemistry
- Era bonus
- Nation bonus
- Tactical style

---

# MVP Acceptance Criteria

The MVP is complete when:

1. User can start a new run.
2. User can roll a historical rugby squad.
3. User can pick one player from the rolled squad.
4. Picked players appear on a rugby pitch.
5. The XV can be completed with 15 players.
6. Ratings update when players are added.
7. User can simulate a cup run.
8. Match results are shown with rugby-like scores.
9. Final result screen shows eliminated/champion state.
10. Current run is saved in LocalStorage.
11. No backend or database is required.
12. Code is structured so backend/database can be added later.

---

# Development Order

1. Create Vite React TypeScript project.
2. Add global CSS variables and layout.
3. Add positions and sample squads data.
4. Build Home screen.
5. Build RugbyPitch component.
6. Build RollPanel and PlayerList.
7. Implement pick logic.
8. Implement rating logic.
9. Add LocalStorage persistence.
10. Build simulation logic.
11. Build Simulation screen.
12. Build Result screen.
13. Polish responsive UI.
14. Add more sample squads.

---

# Notes for Codex

Keep the first version simple but clean.

Do not over-engineer.

Do not implement authentication.

Do not implement backend.

Do not implement database.

Do not use copyrighted images or official logos.

Use flags/emojis/text only.

Prioritize gameplay and a polished interface.

The goal of Phase 1 is to validate the idea quickly.

Make it ready to publish a first version on GitHub Pages
