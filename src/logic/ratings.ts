import { positions } from '../data/positions'
import type { Player, SelectedTeam, TeamRatings } from '../types/rugby'

const average = (players: Player[], key: keyof TeamRatings) => {
  if (players.length === 0) return 0
  return Math.round(players.reduce((total, player) => total + player[key], 0) / players.length)
}

export const selectedPlayers = (team: SelectedTeam) =>
  positions.map((position) => team.slots[position.id]).filter((player): player is Player => Boolean(player))

export const calculateRatings = (team: SelectedTeam): TeamRatings => {
  const players = selectedPlayers(team)
  return {
    overall: average(players, 'overall'),
    attack: average(players, 'attack'),
    defense: average(players, 'defense'),
    kicking: average(players, 'kicking'),
    discipline: average(players, 'discipline'),
  }
}

export const completionCount = (team: SelectedTeam) => selectedPlayers(team).length
