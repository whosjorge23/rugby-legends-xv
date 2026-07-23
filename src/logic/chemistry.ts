import { positions } from '../data/positions'
import type { ChemistryBonus, Player, SelectedTeam, TeamChemistry, TeamRatings } from '../types/rugby'

const clampRating = (value: number) => Math.max(1, Math.min(99, value))

const selectedPlayers = (team: SelectedTeam) =>
  positions.map((position) => team.slots[position.id]).filter((player): player is Player => Boolean(player))

const mostCommonCount = (players: Player[], key: keyof Pick<Player, 'country' | 'year'>) => {
  const counts = players.reduce((map, player) => {
    const value = String(player[key])
    map.set(value, (map.get(value) ?? 0) + 1)
    return map
  }, new Map<string, number>())

  return [...counts.values()].sort((left, right) => right - left)[0] ?? 0
}

const sameCountry = (...players: Array<Player | null | undefined>) => {
  const availablePlayers = players.filter((player): player is Player => Boolean(player))
  return availablePlayers.length > 1 && availablePlayers.every((player) => player.country === availablePlayers[0].country)
}

const sameEra = (...players: Array<Player | null | undefined>) => {
  const years = players.filter((player): player is Player => Boolean(player)).map((player) => player.year)
  if (years.length < 2) return false
  return Math.max(...years) - Math.min(...years) <= 4
}

const addBonus = (bonuses: ChemistryBonus[], bonus: ChemistryBonus) => {
  bonuses.push(bonus)
}

export const calculateChemistry = (team: SelectedTeam): TeamChemistry => {
  const players = selectedPlayers(team)
  const bonuses: ChemistryBonus[] = []
  const spine = [team.slots.HK, team.slots.N8, team.slots.SH, team.slots.FH, team.slots.FB]

  if (mostCommonCount(players, 'country') >= 4) {
    addBonus(bonuses, {
      id: 'country-core',
      name: 'National Core',
      description: 'Four or more players share a country.',
      overall: 2,
      discipline: 2,
    })
  }

  if (mostCommonCount(players, 'year') >= 3) {
    addBonus(bonuses, {
      id: 'same-cup',
      name: 'Same Cup Memory',
      description: 'Three or more players come from the same tournament year.',
      overall: 1,
      attack: 1,
      defense: 1,
    })
  }

  if (spine.filter(Boolean).length >= 4 && sameEra(...spine)) {
    addBonus(bonuses, {
      id: 'settled-spine',
      name: 'Settled Spine',
      description: 'Hooker, No. 8, halves and fullback come from a similar era.',
      attack: 2,
      kicking: 1,
      discipline: 1,
    })
  }

  if (sameCountry(team.slots.SH, team.slots.FH) || sameEra(team.slots.SH, team.slots.FH)) {
    addBonus(bonuses, {
      id: 'halfback-link',
      name: 'Half-back Link',
      description: 'Scrum-half and fly-half share country or era.',
      attack: 3,
      kicking: 2,
    })
  }

  if (sameCountry(team.slots.IC, team.slots.OC) || sameEra(team.slots.IC, team.slots.OC)) {
    addBonus(bonuses, {
      id: 'midfield-read',
      name: 'Midfield Read',
      description: 'The centre pairing speaks the same rugby language.',
      attack: 2,
      defense: 2,
    })
  }

  if (sameCountry(team.slots.BF, team.slots.OF, team.slots.N8) || sameEra(team.slots.BF, team.slots.OF, team.slots.N8)) {
    addBonus(bonuses, {
      id: 'back-row-unit',
      name: 'Back-row Unit',
      description: 'The loose forwards arrive as a connected trio.',
      defense: 3,
      discipline: 1,
    })
  }

  return {
    score: bonuses.reduce((total, bonus) => total + Object.entries(bonus).reduce((sum, [key, value]) => {
      if (key === 'id' || key === 'name' || key === 'description') return sum
      return sum + Number(value)
    }, 0), 0),
    bonuses,
  }
}

export const applyChemistry = (ratings: TeamRatings, chemistry: TeamChemistry): TeamRatings => {
  const totals = chemistry.bonuses.reduce(
    (adjusted, bonus) => ({
      overall: adjusted.overall + (bonus.overall ?? 0),
      attack: adjusted.attack + (bonus.attack ?? 0),
      defense: adjusted.defense + (bonus.defense ?? 0),
      kicking: adjusted.kicking + (bonus.kicking ?? 0),
      discipline: adjusted.discipline + (bonus.discipline ?? 0),
    }),
    ratings,
  )

  return {
    overall: clampRating(totals.overall),
    attack: clampRating(totals.attack),
    defense: clampRating(totals.defense),
    kicking: clampRating(totals.kicking),
    discipline: clampRating(totals.discipline),
  }
}
