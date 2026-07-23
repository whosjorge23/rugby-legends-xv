import { useEffect, useState } from 'react'
import { MatchCard } from '../components/MatchCard'
import { Button } from '../components/Button'
import { LiveMatchPitch } from '../components/LiveMatchPitch'
import { TournamentTable } from '../components/TournamentTable'
import type { GroupFixtureResult, SelectedTeam, SimulatedMatch, Squad } from '../types/rugby'

type SimulationPageProps = {
  matches: SimulatedMatch[]
  groupFixtures: GroupFixtureResult[]
  cupSchedule: Squad[]
  team: SelectedTeam
  onContinue: () => void
  onReplay: () => void
}

const EVENT_REVEAL_MS = 1800

export const SimulationPage = ({ matches, groupFixtures, cupSchedule, team, onContinue, onReplay }: SimulationPageProps) => {
  const currentMatch = matches[matches.length - 1]
  const displayedMatches = [...matches].reverse()
  const [visibleEventCount, setVisibleEventCount] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const currentMatchComplete = currentMatch ? visibleEventCount >= currentMatch.events.length : false
  const revealedMatches = matches.filter((match) => match.id !== currentMatch?.id || currentMatchComplete)
  const completedGroupCount = revealedMatches.filter((match) => match.stage === 'Groups').length
  const revealedGroupFixtures = groupFixtures.filter((fixture) => fixture.roundIndex < completedGroupCount)
  const showTournamentTable = cupSchedule.slice(0, 3).length > 0
  const cupEnds = currentMatch
    ? (currentMatch.stage !== 'Groups' && currentMatch.result !== 'win') || currentMatch.stage === 'Final'
    : false

  useEffect(() => {
    setVisibleEventCount(0)
    setIsSimulating(false)
  }, [currentMatch?.id])

  useEffect(() => {
    if (!isSimulating || !currentMatch || currentMatchComplete) return

    const interval = window.setInterval(() => {
      setVisibleEventCount((count) => {
        const nextCount = Math.min(count + 1, currentMatch.events.length)
        if (nextCount >= currentMatch.events.length) {
          window.clearInterval(interval)
          window.setTimeout(() => setIsSimulating(false), 0)
        }
        return nextCount
      })
    }, EVENT_REVEAL_MS)

    return () => window.clearInterval(interval)
  }, [currentMatch, currentMatchComplete, isSimulating])

  if (!currentMatch) return null

  return (
    <main className="simulation-page">
      <section className="page-title">
        <div>
          <p className="eyebrow">Road to Webb Ellis</p>
          <h1>Cup Run</h1>
        </div>
        <div className="result-actions">
          <Button variant="secondary" onClick={onReplay}>Restart Cup</Button>
          {!currentMatchComplete && (
            <Button onClick={() => setIsSimulating(true)} disabled={isSimulating}>
              {isSimulating ? 'Simulating...' : 'Simulate Match'}
            </Button>
          )}
          {currentMatchComplete && (
            <Button onClick={onContinue}>{cupEnds ? 'Final Result' : 'Prepare Next Match'}</Button>
          )}
        </div>
      </section>
      <LiveMatchPitch
        match={currentMatch}
        team={team}
        visibleEventCount={visibleEventCount}
        isSimulating={isSimulating}
      />
      {showTournamentTable && (
        <TournamentTable matches={revealedMatches} groupFixtures={revealedGroupFixtures} cupSchedule={cupSchedule} />
      )}
      <section className="match-grid">
        {displayedMatches.map((match) => {
          const isActive = match.id === currentMatch.id
          return (
            <MatchCard
              key={match.id}
              match={match}
              visibleEventCount={isActive ? visibleEventCount : match.events.length}
              isActive={isActive}
              isComplete={!isActive || currentMatchComplete}
            />
          )
        })}
      </section>
    </main>
  )
}
