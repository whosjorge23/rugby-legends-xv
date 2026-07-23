import { useEffect, useMemo, useState } from 'react'
import { createEmptyTeam } from '../data/positions'
import { squads } from '../data/squads'
import { calculateRatings, completionCount, selectedPlayers } from '../logic/ratings'
import { pickOne } from '../logic/random'
import { createCupSchedule, cupStages, simulateGroupFixture, simulateMatch } from '../logic/simulation'
import { calculateChemistry } from '../logic/chemistry'
import type { GroupFixtureResult, MatchdaySetup, Player, SelectedTeam, SimulatedMatch, Squad } from '../types/rugby'

const STORAGE_KEY = 'rugby-legends-xv-state'
const STATE_VERSION = 3

type GameView = 'home' | 'build' | 'manager' | 'simulation' | 'result'

type SavedState = {
  version: typeof STATE_VERSION
  team: SelectedTeam
  drawnSquad: Squad | null
  hasPickedFromDraw: boolean
  teamRerolls: number
  cupRerolls: number
  matches: SimulatedMatch[]
  groupFixtures: GroupFixtureResult[]
  cupSchedule: Squad[]
  matchdaySetup: MatchdaySetup | null
}

const createInitialState = (): SavedState => ({
  version: STATE_VERSION,
  team: createEmptyTeam(),
  drawnSquad: null,
  hasPickedFromDraw: false,
  teamRerolls: 3,
  cupRerolls: 3,
  matches: [],
  groupFixtures: [],
  cupSchedule: [],
  matchdaySetup: null,
})

const isSelectedTeam = (value: unknown): value is SelectedTeam =>
  Boolean(value && typeof value === 'object' && 'slots' in value && typeof value.slots === 'object')

const loadState = (): SavedState => {
  const fallback = createInitialState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const stored = JSON.parse(raw) as Partial<SavedState> & { version?: number }
    const commonState = {
      ...fallback,
      team: isSelectedTeam(stored.team) ? stored.team : fallback.team,
      drawnSquad: stored.drawnSquad ?? null,
      hasPickedFromDraw: Boolean(stored.hasPickedFromDraw),
      teamRerolls: typeof stored.teamRerolls === 'number' ? stored.teamRerolls : fallback.teamRerolls,
      cupRerolls: typeof stored.cupRerolls === 'number' ? stored.cupRerolls : fallback.cupRerolls,
    }

    if (stored.version !== STATE_VERSION) return commonState

    return {
      ...commonState,
      matches: Array.isArray(stored.matches) ? stored.matches : [],
      groupFixtures: Array.isArray(stored.groupFixtures) ? stored.groupFixtures : [],
      cupSchedule: Array.isArray(stored.cupSchedule) ? stored.cupSchedule : [],
      matchdaySetup: stored.matchdaySetup ?? null,
    }
  } catch {
    return fallback
  }
}

const isTeamComplete = (team: SelectedTeam) => completionCount(team) === 15

const defaultMatchdaySetup = (team: SelectedTeam, previous?: MatchdaySetup | null): MatchdaySetup => {
  const players = selectedPlayers(team)
  const captain = [...players].sort((left, right) => (right.leadership ?? 0) - (left.leadership ?? 0))[0]
  const kicker = [...players].sort((left, right) => right.kicking - left.kicking)[0]
  const playerIds = new Set(players.map((player) => player.id))

  return {
    captainId: previous && playerIds.has(previous.captainId) ? previous.captainId : captain?.id ?? '',
    kickerId: previous && playerIds.has(previous.kickerId) ? previous.kickerId : kicker?.id ?? '',
    tactic: previous?.tactic ?? 'run-wide',
  }
}

export const useGameState = () => {
  const [view, setView] = useState<GameView>('home')
  const [state, setState] = useState<SavedState>(loadState)

  const ratings = useMemo(() => calculateRatings(state.team), [state.team])
  const chemistry = useMemo(() => calculateChemistry(state.team), [state.team])
  const completeCount = useMemo(() => completionCount(state.team), [state.team])
  const isComplete = completeCount === 15
  const nextMatchIndex = state.matches.length
  const nextOpponent = state.cupSchedule[nextMatchIndex]
  const nextStage = cupStages[nextMatchIndex]

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const roll = () => {
    setState((current) => {
      if (isTeamComplete(current.team)) return current
      return {
        ...current,
        drawnSquad: pickOne(squads, current.drawnSquad ?? undefined),
        hasPickedFromDraw: false,
      }
    })
  }

  const rerollTeam = () => {
    setState((current) => {
      if (isTeamComplete(current.team) || current.teamRerolls <= 0) return current
      return {
        ...current,
        teamRerolls: current.teamRerolls - 1,
        drawnSquad: pickOne(squads, current.drawnSquad ?? undefined),
        hasPickedFromDraw: false,
      }
    })
  }

  const rerollCup = () => {
    setState((current) => {
      if (isTeamComplete(current.team) || current.cupRerolls <= 0) return current
      const sameCountry = squads.filter((squad) => squad.country === current.drawnSquad?.country)
      return {
        ...current,
        cupRerolls: current.cupRerolls - 1,
        drawnSquad: pickOne(sameCountry.length > 1 ? sameCountry : squads, current.drawnSquad ?? undefined),
        hasPickedFromDraw: false,
      }
    })
  }

  const selectPlayer = (player: Player) => {
    setState((current) => {
      if (current.hasPickedFromDraw || current.team.slots[player.position]) return current

      return {
        ...current,
        team: { slots: { ...current.team.slots, [player.position]: player } },
        hasPickedFromDraw: true,
      }
    })
  }

  const beginCup = () => {
    setState((current) => ({
      ...current,
      matches: [],
      groupFixtures: [],
      cupSchedule: createCupSchedule(current.drawnSquad ?? undefined),
      matchdaySetup: defaultMatchdaySetup(current.team, current.matchdaySetup),
    }))
    setView('manager')
  }

  const updateMatchdaySetup = (setup: MatchdaySetup) => {
    setState((current) => ({ ...current, matchdaySetup: setup }))
  }

  const playCurrentMatch = () => {
    setState((current) => {
      const matchIndex = current.matches.length
      const opponent = current.cupSchedule[matchIndex]
      const stage = cupStages[matchIndex]
      const setup = defaultMatchdaySetup(current.team, current.matchdaySetup)
      if (!opponent || !stage || !isTeamComplete(current.team)) return current

      const match = simulateMatch(current.team, calculateRatings(current.team), opponent, stage, setup, matchIndex)
      const otherGroupTeams = current.cupSchedule.slice(0, 3).filter((squad) => squad.id !== opponent.id)
      const nextGroupFixtures = stage === 'Groups' && otherGroupTeams[0] && otherGroupTeams[1]
        ? [...current.groupFixtures, simulateGroupFixture(matchIndex, otherGroupTeams[0], otherGroupTeams[1])]
        : current.groupFixtures
      return { ...current, matchdaySetup: setup, matches: [...current.matches, match], groupFixtures: nextGroupFixtures }
    })
    setView('simulation')
  }

  const finishMatch = () => {
    const lastMatch = state.matches[state.matches.length - 1]
    const eliminated = lastMatch && lastMatch.stage !== 'Groups' && lastMatch.result !== 'win'
    const cupFinished = eliminated || state.matches.length >= cupStages.length
    setView(cupFinished ? 'result' : 'manager')
  }

  const resetBuild = () => {
    setState(createInitialState())
    setView('build')
  }

  const replay = () => {
    setState((current) => ({
      ...current,
      matches: [],
      groupFixtures: [],
      cupSchedule: createCupSchedule(current.drawnSquad ?? undefined),
      matchdaySetup: defaultMatchdaySetup(current.team, current.matchdaySetup),
    }))
    setView('manager')
  }

  return {
    ...state,
    ratings,
    chemistry,
    completeCount,
    isComplete,
    view,
    nextOpponent,
    nextStage,
    setView,
    roll,
    rerollTeam,
    rerollCup,
    selectPlayer,
    beginCup,
    updateMatchdaySetup,
    playCurrentMatch,
    finishMatch,
    resetBuild,
    replay,
  }
}
