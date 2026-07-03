import { useEffect, useMemo, useState } from 'react'
import { createEmptyTeam } from '../data/positions'
import { squads } from '../data/squads'
import { calculateRatings, completionCount } from '../logic/ratings'
import { pickOne } from '../logic/random'
import { simulateCup } from '../logic/simulation'
import type { Player, SelectedTeam, SimulatedMatch, Squad } from '../types/rugby'

const STORAGE_KEY = 'rugby-legends-xv-state'

type SavedState = {
  team: SelectedTeam
  drawnSquad: Squad | null
  hasPickedFromDraw: boolean
  teamRerolls: number
  cupRerolls: number
  matches: SimulatedMatch[]
}

const initialState: SavedState = {
  team: createEmptyTeam(),
  drawnSquad: null,
  hasPickedFromDraw: false,
  teamRerolls: 3,
  cupRerolls: 3,
  matches: [],
}

const loadState = (): SavedState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState
  } catch {
    return initialState
  }
}

export const useGameState = () => {
  const [view, setView] = useState<'home' | 'build' | 'simulation' | 'result'>('home')
  const [state, setState] = useState<SavedState>(loadState)

  const ratings = useMemo(() => calculateRatings(state.team), [state.team])
  const completeCount = useMemo(() => completionCount(state.team), [state.team])
  const isComplete = completeCount === 15

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const roll = () => {
    setState((current) => ({
      ...current,
      drawnSquad: pickOne(squads, current.drawnSquad ?? undefined),
      hasPickedFromDraw: false,
    }))
  }

  const rerollTeam = () => {
    setState((current) => {
      if (current.teamRerolls <= 0) return current
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
      if (current.cupRerolls <= 0) return current
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
      if (current.hasPickedFromDraw) return current
      if (current.team.slots[player.position]) return current

      return {
        ...current,
        team: {
          slots: {
            ...current.team.slots,
            [player.position]: player,
          },
        },
        hasPickedFromDraw: true,
      }
    })
  }

  const runSimulation = () => {
    setState((current) => ({ ...current, matches: simulateCup(current.team, ratings, current.drawnSquad ?? undefined) }))
    setView('simulation')
  }

  const resetBuild = () => {
    setState({ ...initialState, team: createEmptyTeam() })
    setView('build')
  }

  const replay = () => {
    setState((current) => ({ ...current, matches: simulateCup(current.team, ratings, current.drawnSquad ?? undefined) }))
    setView('simulation')
  }

  return {
    ...state,
    ratings,
    completeCount,
    isComplete,
    view,
    setView,
    roll,
    rerollTeam,
    rerollCup,
    selectPlayer,
    runSimulation,
    resetBuild,
    replay,
  }
}
