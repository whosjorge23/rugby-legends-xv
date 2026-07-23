export type RugbyPositionId =
  | 'LH'
  | 'HK'
  | 'TH'
  | 'LO4'
  | 'LO5'
  | 'BF'
  | 'OF'
  | 'N8'
  | 'SH'
  | 'FH'
  | 'LW'
  | 'IC'
  | 'OC'
  | 'RW'
  | 'FB'

export type RugbyPosition = {
  id: RugbyPositionId
  number: number
  name: string
}

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

export type SelectedTeam = {
  slots: Record<RugbyPositionId, Player | null>
}

export type MatchStage = 'Groups' | 'Quarter-final' | 'Semi-final' | 'Final'

export type MatchTactic = 'run-wide' | 'rush-defence' | 'kick-for-territory'

export type MatchdaySetup = {
  captainId: string
  kickerId: string
  tactic: MatchTactic
}

export type MatchEvent = {
  minute: number
  type: 'TRY' | 'CONVERSION' | 'PENALTY' | 'DROP_GOAL' | 'YELLOW_CARD'
  playerName: string
  team: 'user' | 'opponent'
  successful?: boolean
}

export type SimulatedMatch = {
  id: string
  stage: MatchStage
  opponent: Squad
  userScore: number
  opponentScore: number
  result: 'win' | 'loss' | 'draw'
  events: MatchEvent[]
  setup: MatchdaySetup
  captainName: string
  kickerName: string
  standoutPlayerName: string
}

export type GroupFixtureResult = {
  id: string
  roundIndex: number
  home: Squad
  away: Squad
  homeScore: number
  awayScore: number
}

export type TeamRatings = {
  overall: number
  attack: number
  defense: number
  kicking: number
  discipline: number
}

export type ChemistryBonus = {
  id: string
  name: string
  description: string
  overall?: number
  attack?: number
  defense?: number
  kicking?: number
  discipline?: number
}

export type TeamChemistry = {
  score: number
  bonuses: ChemistryBonus[]
}

export type ResultSummary = {
  status: 'Champion' | 'Eliminated'
  exitStage: MatchStage | 'Champion'
  record: string
  pointsFor: number
  pointsAgainst: number
  wins: number
}
