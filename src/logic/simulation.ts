import { squads } from '../data/squads'
import { applyTactic } from '../data/tactics'
import { calculateSquadRatings, selectedPlayers } from './ratings'
import { pickOne, randomInt, shuffle } from './random'
import type {
  MatchEvent,
  MatchStage,
  MatchdaySetup,
  Player,
  SelectedTeam,
  SimulatedMatch,
  Squad,
  TeamRatings,
} from '../types/rugby'

export const cupStages: MatchStage[] = ['Groups', 'Groups', 'Groups', 'Quarter-final', 'Semi-final', 'Final']

const scoringEventPoints: Record<Exclude<MatchEvent['type'], 'YELLOW_CARD'>, number> = {
  TRY: 5,
  CONVERSION: 2,
  PENALTY: 3,
  DROP_GOAL: 3,
}

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value))

const scoreEvents = (events: MatchEvent[]) =>
  events.reduce(
    (score, event) => {
      const points = event.type === 'YELLOW_CARD' || event.successful === false ? 0 : scoringEventPoints[event.type]
      return event.team === 'user'
        ? { ...score, userScore: score.userScore + points }
        : { ...score, opponentScore: score.opponentScore + points }
    },
    { userScore: 0, opponentScore: 0 },
  )

const kickSucceeds = (kicking: number, difficulty = 0) =>
  Math.random() < clamp(0.42 + (kicking - 55) * 0.012 - difficulty, 0.35, 0.94)

const scoringProfile = (
  attack: number,
  oppositionDefense: number,
  oppositionDiscipline: number,
  territoryBonus = false,
) => {
  const advantage = attack - oppositionDefense
  const tries = Math.max(0, Math.round(2.3 + advantage / 9) + randomInt(-1, 1) - (territoryBonus ? 1 : 0))
  const penaltyPressure = oppositionDiscipline < 84 ? 1 : 0
  const penalties = Math.max(1, randomInt(1, 3) + penaltyPressure + (territoryBonus ? 1 : 0))
  const dropGoals = Math.random() > 0.86 ? 1 : 0

  return { dropGoals, penalties, tries }
}

const makeTeamScoringEvents = (
  players: Player[],
  profile: ReturnType<typeof scoringProfile>,
  eventTeam: MatchEvent['team'],
  kicker: Player,
  effectiveKicking: number,
): MatchEvent[] => {
  const events: MatchEvent[] = []
  const tryMinutes = Array.from({ length: profile.tries }, () => randomInt(6, 76)).sort((a, b) => a - b)

  tryMinutes.forEach((minute) => {
    events.push({ minute, type: 'TRY', playerName: pickOne(players).name, team: eventTeam })
    events.push({
      minute: Math.min(80, minute + 1),
      type: 'CONVERSION',
      playerName: kicker.name,
      team: eventTeam,
      successful: kickSucceeds(effectiveKicking, 0.04),
    })
  })

  Array.from({ length: profile.penalties }, () => {
    events.push({
      minute: randomInt(5, 78),
      type: 'PENALTY',
      playerName: kicker.name,
      team: eventTeam,
      successful: kickSucceeds(effectiveKicking),
    })
  })

  Array.from({ length: profile.dropGoals }, () => {
    events.push({
      minute: randomInt(18, 79),
      type: 'DROP_GOAL',
      playerName: kicker.name,
      team: eventTeam,
      successful: kickSucceeds(effectiveKicking, 0.12),
    })
  })

  return events
}

const addYellowCard = (
  events: MatchEvent[],
  players: Player[],
  team: MatchEvent['team'],
  discipline: number,
) => {
  const cardChance = clamp(0.12 + (86 - discipline) * 0.018, 0.02, 0.42)
  if (Math.random() < cardChance) {
    events.push({
      minute: randomInt(12, 76),
      type: 'YELLOW_CARD',
      playerName: pickOne(players).name,
      team,
    })
  }
}

const leadershipBonusFor = (captain: Player) => clamp(Math.round(((captain.leadership ?? 80) - 80) / 4), 0, 4)

const makeEvents = (
  team: SelectedTeam,
  opponent: Squad,
  userRatings: TeamRatings,
  opponentRatings: TeamRatings,
  setup: MatchdaySetup,
): MatchEvent[] => {
  const userPlayers = selectedPlayers(team)
  const captain = userPlayers.find((player) => player.id === setup.captainId) ?? userPlayers[0]
  const userKicker = userPlayers.find((player) => player.id === setup.kickerId) ?? userPlayers[0]
  const opponentKicker = [...opponent.players].sort((left, right) => right.kicking - left.kicking)[0]
  const adjustedUserRatings = applyTactic(userRatings, setup.tactic)
  const userDiscipline = clamp(adjustedUserRatings.discipline + leadershipBonusFor(captain), 1, 99)
  const territoryBonus = setup.tactic === 'kick-for-territory'
  const events: MatchEvent[] = [
    ...makeTeamScoringEvents(
      userPlayers,
      scoringProfile(
        adjustedUserRatings.attack,
        opponentRatings.defense,
        opponentRatings.discipline,
        territoryBonus,
      ),
      'user',
      userKicker,
      Math.round((userKicker.kicking * 2 + adjustedUserRatings.kicking) / 3),
    ),
    ...makeTeamScoringEvents(
      opponent.players,
      scoringProfile(opponentRatings.attack, adjustedUserRatings.defense, userDiscipline),
      'opponent',
      opponentKicker,
      Math.round((opponentKicker.kicking * 2 + opponentRatings.kicking) / 3),
    ),
  ]

  addYellowCard(events, userPlayers, 'user', userDiscipline)
  addYellowCard(events, opponent.players, 'opponent', opponentRatings.discipline)

  return events.sort((left, right) => left.minute - right.minute)
}

const resultFor = (userScore: number, opponentScore: number): SimulatedMatch['result'] => {
  if (userScore > opponentScore) return 'win'
  if (userScore < opponentScore) return 'loss'
  return 'draw'
}

const standoutFor = (events: MatchEvent[], fallback: Player) => {
  const contributions = new Map<string, number>()

  events
    .filter((event) => event.team === 'user' && event.type !== 'YELLOW_CARD' && event.successful !== false)
    .forEach((event) => {
      const points = scoringEventPoints[event.type as Exclude<MatchEvent['type'], 'YELLOW_CARD'>]
      contributions.set(event.playerName, (contributions.get(event.playerName) ?? 0) + points)
    })

  return [...contributions.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? fallback.name
}

export const createCupSchedule = (excludedSquad?: Squad): Squad[] =>
  shuffle(squads.filter((squad) => squad.id !== excludedSquad?.id)).slice(0, cupStages.length)

export const simulateMatch = (
  team: SelectedTeam,
  ratings: TeamRatings,
  opponent: Squad,
  stage: MatchStage,
  setup: MatchdaySetup,
  matchIndex: number,
): SimulatedMatch => {
  const players = selectedPlayers(team)
  const opponentRatings = calculateSquadRatings(opponent)
  let events = makeEvents(team, opponent, ratings, opponentRatings, setup)
  let { userScore, opponentScore } = scoreEvents(events)

  if (stage !== 'Groups' && userScore === opponentScore) {
    const penaltyTeam = randomInt(0, 1) ? 'user' : 'opponent'
    const penaltyPlayers = penaltyTeam === 'user' ? players : opponent.players
    const namedKicker = penaltyTeam === 'user'
      ? players.find((player) => player.id === setup.kickerId)
      : [...opponent.players].sort((left, right) => right.kicking - left.kicking)[0]
    const tieBreaker: MatchEvent = {
      minute: 80,
      type: 'PENALTY',
      playerName: namedKicker?.name ?? pickOne(penaltyPlayers).name,
      team: penaltyTeam,
      successful: true,
    }

    events = [...events, tieBreaker].sort((left, right) => left.minute - right.minute)
    ;({ userScore, opponentScore } = scoreEvents(events))
  }

  const captain = players.find((player) => player.id === setup.captainId) ?? players[0]
  const kicker = players.find((player) => player.id === setup.kickerId) ?? players[0]

  return {
    id: `${stage}-${opponent.id}-${matchIndex}`,
    stage,
    opponent,
    userScore,
    opponentScore,
    result: resultFor(userScore, opponentScore),
    events,
    setup,
    captainName: captain.name,
    kickerName: kicker.name,
    standoutPlayerName: standoutFor(events, captain),
  }
}
