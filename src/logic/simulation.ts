import { squads } from '../data/squads'
import { selectedPlayers } from './ratings'
import { pickOne, randomInt, shuffle } from './random'
import type { MatchEvent, MatchStage, SelectedTeam, SimulatedMatch, Squad, TeamRatings } from '../types/rugby'

const stages: MatchStage[] = ['Groups', 'Groups', 'Groups', 'Quarter-final', 'Semi-final', 'Final']
const eventTypes: MatchEvent['type'][] = ['TRY', 'CONVERSION', 'PENALTY', 'DROP_GOAL', 'YELLOW_CARD']

const generateRugbyScore = (strength: number) => {
  const base = Math.max(8, Math.round(strength / 4) + randomInt(-7, 8))
  const rugbyShape = pickOne([0, 0, 1, 2, 3, 5, 7])
  return Math.max(6, base + rugbyShape)
}

const makeEvents = (team: SelectedTeam, opponent: Squad, userScore: number, opponentScore: number): MatchEvent[] => {
  const userPlayers = selectedPlayers(team)
  const events = Array.from({ length: randomInt(4, 7) }, (_, index) => {
    const isUser = Math.random() < userScore / Math.max(1, userScore + opponentScore)
    const player = isUser ? pickOne(userPlayers) : pickOne(opponent.players)
    return {
      minute: Math.min(80, randomInt(4, 76) + index),
      type: pickOne(eventTypes),
      playerName: player.name,
      team: isUser ? 'user' : 'opponent',
    } satisfies MatchEvent
  })

  return events.sort((a, b) => a.minute - b.minute)
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
    let userScore = generateRugbyScore(userStrength)
    let opponentScore = generateRugbyScore(opponentStrength)

    if (stage !== 'Groups' && userScore === opponentScore) {
      userScore += randomInt(0, 1) ? 3 : 0
      opponentScore += userScore === opponentScore ? 3 : 0
    }

    const match: SimulatedMatch = {
      id: `${stage}-${opponent.id}-${index}`,
      stage,
      opponent,
      userScore,
      opponentScore,
      result: resultFor(userScore, opponentScore),
      events: makeEvents(team, opponent, userScore, opponentScore),
    }

    matches.push(match)

    if (stage !== 'Groups' && match.result !== 'win') {
      break
    }
  }

  return matches
}
