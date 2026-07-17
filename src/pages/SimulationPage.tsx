import { useEffect, useMemo, useState } from 'react'
import { MatchCard } from '../components/MatchCard'
import { Button } from '../components/Button'
import { LiveMatchPitch } from '../components/LiveMatchPitch'
import type { SelectedTeam, SimulatedMatch } from '../types/rugby'

type SimulationPageProps = {
  matches: SimulatedMatch[]
  team: SelectedTeam
  onResult: () => void
  onReplay: () => void
}

const EVENT_REVEAL_MS = 1800

export const SimulationPage = ({ matches, team, onResult, onReplay }: SimulationPageProps) => {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [visibleEventCounts, setVisibleEventCounts] = useState<number[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const currentMatch = matches[currentMatchIndex]
  const currentVisibleEvents = visibleEventCounts[currentMatchIndex] ?? 0
  const currentMatchComplete = currentMatch ? currentVisibleEvents >= currentMatch.events.length : false
  const hasNextMatch = currentMatchIndex < matches.length - 1
  const visibleMatches = matches.slice(0, currentMatchIndex + 1)
  const matchEventTotals = useMemo(() => matches.map((match) => match.events.length), [matches])

  useEffect(() => {
    setCurrentMatchIndex(0)
    setVisibleEventCounts(matches.map(() => 0))
    setIsSimulating(false)
  }, [matches])

  useEffect(() => {
    if (!isSimulating || !currentMatch) return

    if (currentMatchComplete) {
      setIsSimulating(false)
      return
    }

    const interval = window.setInterval(() => {
      setVisibleEventCounts((counts) =>
        counts.map((count, index) => {
          if (index !== currentMatchIndex) return count

          const nextCount = Math.min(count + 1, matchEventTotals[index])
          if (nextCount >= matchEventTotals[index]) {
            window.clearInterval(interval)
            window.setTimeout(() => setIsSimulating(false), 0)
          }

          return nextCount
        }),
      )
    }, EVENT_REVEAL_MS)

    return () => window.clearInterval(interval)
  }, [currentMatch, currentMatchComplete, currentMatchIndex, isSimulating, matchEventTotals])

  const goToNextMatch = () => {
    setIsSimulating(false)
    setCurrentMatchIndex((index) => Math.min(index + 1, matches.length - 1))
  }

  return (
    <main className="simulation-page">
      <section className="page-title">
        <div>
          <p className="eyebrow">Road to Webb Ellis</p>
          <h1>Cup Run</h1>
        </div>
        <div className="result-actions">
          <Button variant="secondary" onClick={onReplay}>
            Replay
          </Button>
          {!currentMatchComplete && (
            <Button onClick={() => setIsSimulating(true)} disabled={isSimulating}>
              {isSimulating ? 'Simulating...' : 'Simulate Match'}
            </Button>
          )}
          {currentMatchComplete && hasNextMatch && <Button onClick={goToNextMatch}>Next Match</Button>}
          {currentMatchComplete && !hasNextMatch && <Button onClick={onResult}>Final Result</Button>}
        </div>
      </section>
      <LiveMatchPitch
        match={currentMatch}
        team={team}
        visibleEventCount={currentVisibleEvents}
        isSimulating={isSimulating}
      />
      <section className="match-grid">
        {visibleMatches.map((match, index) => (
          <MatchCard
            key={match.id}
            match={match}
            visibleEventCount={visibleEventCounts[index] ?? 0}
            isActive={index === currentMatchIndex}
            isComplete={index < currentMatchIndex || (index === currentMatchIndex && currentMatchComplete)}
          />
        ))}
      </section>
    </main>
  )
}
