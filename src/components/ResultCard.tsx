import { positions } from '../data/positions'
import { tacticById } from '../data/tactics'
import type { ResultSummary, SelectedTeam, SimulatedMatch, TeamRatings } from '../types/rugby'
import { Button } from './Button'

type ResultCardProps = {
  summary: ResultSummary
  team: SelectedTeam
  ratings: TeamRatings
  matches: SimulatedMatch[]
  onReplay: () => void
  onBuildAnother: () => void
}

export const ResultCard = ({ summary, team, ratings, matches, onReplay, onBuildAnother }: ResultCardProps) => {
  const lastMatch = matches[matches.length - 1]
  const tacticCounts = matches.reduce((counts, match) => {
    counts.set(match.setup.tactic, (counts.get(match.setup.tactic) ?? 0) + 1)
    return counts
  }, new Map<SimulatedMatch['setup']['tactic'], number>())
  const favouriteTactic = [...tacticCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]
  const standoutCounts = matches.reduce((counts, match) => {
    counts.set(match.standoutPlayerName, (counts.get(match.standoutPlayerName) ?? 0) + 1)
    return counts
  }, new Map<string, number>())
  const cupStandout = [...standoutCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]

  return (
  <section className="result-card">
    <p className="panel-kicker">Final Result</p>
    <h1>{summary.status}</h1>
    <h2>{summary.exitStage}</h2>
    <div className="result-stats">
      <span>Record: {summary.record}</span>
      <span>Points For: {summary.pointsFor}</span>
      <span>Points Against: {summary.pointsAgainst}</span>
      <span>Overall: {ratings.overall}</span>
      <span>Wins: {summary.wins}</span>
    </div>
    <div className="manager-summary">
      <div><span>Final captain</span><strong>{lastMatch?.captainName ?? '—'}</strong></div>
      <div><span>Final kicker</span><strong>{lastMatch?.kickerName ?? '—'}</strong></div>
      <div><span>Favourite tactic</span><strong>{favouriteTactic ? tacticById[favouriteTactic].name : '—'}</strong></div>
      <div><span>Cup standout</span><strong>{cupStandout ?? '—'}</strong></div>
    </div>
    <div className="result-actions">
      <Button onClick={onReplay}>Replay</Button>
      <Button variant="secondary" onClick={onBuildAnother}>
        Build Another XV
      </Button>
    </div>
    <div className="final-xv">
      {positions.map((position) => {
        const player = team.slots[position.id]
        return (
          <div key={position.id} className="final-row">
            <span>{position.number}</span>
            <strong>{player?.name}</strong>
            <em>
              {player?.flag} {player?.countryCode} {player?.year}
            </em>
          </div>
        )
      })}
    </div>
  </section>
  )
}
