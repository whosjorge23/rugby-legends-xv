import { squads } from '../data/squads'
import { selectedPlayers } from './ratings'
import { pickOne, randomInt, shuffle } from './random'
import type { MatchEvent, MatchStage, SelectedTeam, SimulatedMatch, Squad, TeamRatings } from '../types/rugby'

const stages: MatchStage[] = ['Groups', 'Groups', 'Groups', 'Quarter-final', 'Semi-final', 'Final']
const scoringEventPoints: Record<Exclude<MatchEvent['type'], 'YELLOW_CARD'>, number> = {
  TRY: 5,
  CONVERSION: 2,
  PENALTY: 3,
  DROP_GOAL: 3,
}

const scoreEvents = (events: MatchEvent[]) =>
  events.reduce(
    (score, event) => {
      const points = event.type === 'YELLOW_CARD' ? 0 : scoringEventPoints[event.type]
      return event.team === 'user'
        ? { ...score, userScore: score.userScore + points }
        : { ...score, opponentScore: score.opponentScore + points }
    },
    { userScore: 0, opponentScore: 0 },
  )

const scoringProfile = (strength: number) => {
  const tries = Math.max(0, Math.round((strength - 72) / 10) + randomInt(-1, 2))
  const conversions = randomInt(Math.max(0, tries - 2), tries)
  const penalties = randomInt(1, 5)
  const dropGoals = Math.random() > 0.78 ? 1 : 0

  return { conversions, dropGoals, penalties, tries }
}

const makeTeamScoringEvents = (
  players: { name: string }[],
  profile: ReturnType<typeof scoringProfile>,
  eventTeam: MatchEvent['team'],
): MatchEvent[] => {
  const events: MatchEvent[] = []
  const tryMinutes = Array.from({ length: profile.tries }, () => randomInt(6, 76)).sort((a, b) => a - b)

  tryMinutes.forEach((minute, index) => {
    const tryScorer = pickOne(players)
    events.push({
      minute,
      type: 'TRY',
      playerName: tryScorer.name,
      team: eventTeam,
    })

    if (index < profile.conversions) {
      events.push({
        minute: Math.min(80, minute + 1),
        type: 'CONVERSION',
        playerName: pickOne(players).name,
        team: eventTeam,
      })
    }
  })

  Array.from({ length: profile.penalties }, () => {
    events.push({
      minute: randomInt(5, 78),
      type: 'PENALTY',
      playerName: pickOne(players).name,
      team: eventTeam,
    })
  })

  Array.from({ length: profile.dropGoals }, () => {
    events.push({
      minute: randomInt(18, 79),
      type: 'DROP_GOAL',
      playerName: pickOne(players).name,
      team: eventTeam,
    })
  })

  return events
}

const makeEvents = (team: SelectedTeam, opponent: Squad, userStrength: number, opponentStrength: number): MatchEvent[] => {
  const userPlayers = selectedPlayers(team)
  const scoringEvents: MatchEvent[] = [
    ...makeTeamScoringEvents(userPlayers, scoringProfile(userStrength), 'user'),
    ...makeTeamScoringEvents(opponent.players, scoringProfile(opponentStrength), 'opponent'),
  ]

  const yellowCards = Array.from({ length: randomInt(0, 2) }, () => {
    const isUser = Math.random() < 0.5

    return {
      minute: randomInt(12, 76),
      type: 'YELLOW_CARD',
      playerName: (isUser ? pickOne(userPlayers) : pickOne(opponent.players)).name,
      team: isUser ? 'user' : 'opponent',
    } satisfies MatchEvent
  })

  return [...scoringEvents, ...yellowCards].sort((a, b) => a.minute - b.minute)
}

const resultFor = (userScore: number, opponentScore: number): SimulatedMatch['result'] => {
  if (userScore > opponentScore) return 'win'
  if (userScore < opponentScore) return 'loss'
  return 'draw'
}

export const simulateCup = (team: SelectedTeam, ratings: TeamRatings, currentSquad?: Squad): SimulatedMatch[] => {
  const opponents = shuffle(squads.filter((squad) => squad.id !== currentSquad?.id)).slice(0, stages.length)
  const matches: SimulatedMatch[] = []

  for (const [index, stage] of stages.entries()) {
    const opponent = opponents[index]
    const userStrength = ratings.overall + randomInt(-10, 10)
    const opponentStrength = opponent.overall + randomInt(-10, 10)
    let events = makeEvents(team, opponent, userStrength, opponentStrength)
    let { userScore, opponentScore } = scoreEvents(events)

    if (stage !== 'Groups' && userScore === opponentScore) {
      const penaltyTeam = randomInt(0, 1) ? 'user' : 'opponent'
      const penaltyPlayers = penaltyTeam === 'user' ? selectedPlayers(team) : opponent.players

      const tieBreaker: MatchEvent = {
        minute: 80,
        type: 'PENALTY',
        playerName: pickOne(penaltyPlayers).name,
        team: penaltyTeam,
      }

      events = [
        ...events,
        tieBreaker,
      ].sort((a, b) => a.minute - b.minute)
      ;({ userScore, opponentScore } = scoreEvents(events))
    }

    const match: SimulatedMatch = {
      id: `${stage}-${opponent.id}-${index}`,
      stage,
      opponent,
      userScore,
      opponentScore,
      result: resultFor(userScore, opponentScore),
      events,
    }

    matches.push(match)

    if (stage !== 'Groups' && match.result !== 'win') {
      break
    }
  }

  return matches
}
