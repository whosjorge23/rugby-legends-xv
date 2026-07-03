import { positions } from '../data/positions'
import type { ResultSummary, SelectedTeam, TeamRatings } from '../types/rugby'
import { Button } from './Button'

type ResultCardProps = {
  summary: ResultSummary
  team: SelectedTeam
  ratings: TeamRatings
  onReplay: () => void
  onBuildAnother: () => void
}

export const ResultCard = ({ summary, team, ratings, onReplay, onBuildAnother }: ResultCardProps) => (
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
