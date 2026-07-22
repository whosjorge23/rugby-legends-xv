import { pickOne } from './random'
import type { MatchEvent, Player } from '../types/rugby'

export const SIN_BIN_MINUTES = 10

export const activeSinBinCardsAt = (events: MatchEvent[], currentMinute: number) =>
  events
    .filter((event) => event.type === 'YELLOW_CARD')
    .filter(
      (event) => currentMinute >= event.minute && currentMinute < event.minute + SIN_BIN_MINUTES,
    )

export const respectSinBins = (
  events: MatchEvent[],
  playersByTeam: Record<MatchEvent['team'], Player[]>,
) => {
  const cards: MatchEvent[] = []

  return events
    .sort((left, right) => left.minute - right.minute)
    .map((event) => {
      const activeCards = activeSinBinCardsAt(
        cards.filter((card) => card.team === event.team),
        event.minute,
      )
      const isPlayerUnavailable = activeCards.some((card) => card.playerName === event.playerName)
      const availablePlayers = playersByTeam[event.team].filter(
        (player) => !activeCards.some((card) => card.playerName === player.name),
      )

      if (event.type === 'YELLOW_CARD') {
        cards.push(event)
        return event
      }

      if (!isPlayerUnavailable || availablePlayers.length === 0) return event

      const isKick = event.type === 'CONVERSION' || event.type === 'PENALTY' || event.type === 'DROP_GOAL'
      const replacement = isKick
        ? [...availablePlayers].sort((left, right) => right.kicking - left.kicking)[0]
        : pickOne(availablePlayers)

      return { ...event, playerName: replacement.name }
    })
}
