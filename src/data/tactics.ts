import type { MatchTactic, TeamRatings } from '../types/rugby'

export type TacticDefinition = {
  id: MatchTactic
  name: string
  shortName: string
  description: string
  impact: string
}

export const tactics: TacticDefinition[] = [
  {
    id: 'run-wide',
    name: 'Run Wide',
    shortName: 'Wide',
    description: 'Move the ball quickly to your outside backs and chase tries.',
    impact: '+5 attack · -3 defence',
  },
  {
    id: 'rush-defence',
    name: 'Rush Defence',
    shortName: 'Rush',
    description: 'Close down space aggressively and force attacking mistakes.',
    impact: '+5 defence · -3 discipline',
  },
  {
    id: 'kick-for-territory',
    name: 'Kick for Territory',
    shortName: 'Territory',
    description: 'Play for field position and turn pressure into shots at goal.',
    impact: '+5 kicking · -3 attack · more penalties',
  },
]

export const tacticById = Object.fromEntries(tactics.map((tactic) => [tactic.id, tactic])) as Record<
  MatchTactic,
  TacticDefinition
>

const clampRating = (value: number) => Math.max(1, Math.min(99, value))

export const applyTactic = (ratings: TeamRatings, tactic: MatchTactic): TeamRatings => {
  const adjusted = { ...ratings }

  if (tactic === 'run-wide') {
    adjusted.attack += 5
    adjusted.defense -= 3
  }

  if (tactic === 'rush-defence') {
    adjusted.defense += 5
    adjusted.discipline -= 3
  }

  if (tactic === 'kick-for-territory') {
    adjusted.kicking += 5
    adjusted.attack -= 3
  }

  return {
    overall: ratings.overall,
    attack: clampRating(adjusted.attack),
    defense: clampRating(adjusted.defense),
    kicking: clampRating(adjusted.kicking),
    discipline: clampRating(adjusted.discipline),
  }
}
