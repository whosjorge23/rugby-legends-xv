import { positions } from '../data/positions'
import type { SelectedTeam, TeamChemistry, TeamRatings } from '../types/rugby'
import { Button } from './Button'

type RatingPanelProps = {
  team: SelectedTeam
  ratings: TeamRatings
  chemistry: TeamChemistry
  completeCount: number
  isComplete: boolean
  onSimulate: () => void
}

const RatingLine = ({ label, value }: { label: string; value: number }) => (
  <div className="rating-line">
    <span>{label}</span>
    <strong key={value}>{value || '-'}</strong>
  </div>
)

export const RatingPanel = ({ team, ratings, chemistry, completeCount, isComplete, onSimulate }: RatingPanelProps) => (
  <aside className="panel rating-panel">
    <div className="score-box">
      <p className="panel-kicker">{isComplete ? 'Lineup Complete' : 'Lineup'}</p>
      <strong>{completeCount}/15</strong>
    </div>
    <div className="ratings-grid">
      <RatingLine label="Overall" value={ratings.overall} />
      <RatingLine label="Attack" value={ratings.attack} />
      <RatingLine label="Defense" value={ratings.defense} />
      <RatingLine label="Kicking" value={ratings.kicking} />
      <RatingLine label="Discipline" value={ratings.discipline} />
    </div>
    <Button onClick={onSimulate} disabled={!isComplete}>
      Simulate the Cup
    </Button>
    <div className="chemistry-panel">
      <div className="chemistry-heading">
        <span>Chemistry</span>
        <strong>+{chemistry.score}</strong>
      </div>
      {chemistry.bonuses.length > 0 ? (
        <div className="chemistry-list">
          {chemistry.bonuses.map((bonus) => (
            <div className="chemistry-bonus" key={bonus.id}>
              <strong>{bonus.name}</strong>
              <span>{bonus.description}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="chemistry-empty">Build country, era and unit links to unlock rating boosts.</p>
      )}
    </div>
    <div className="selected-list">
      {positions.map((position) => {
        const player = team.slots[position.id]
        return (
          <div key={position.id} className="selected-row">
            <span>{position.number}</span>
            <strong>{player?.name ?? position.name}</strong>
            <em>{player ? `${player.flag} ${player.countryCode} ${player.year}` : position.id}</em>
          </div>
        )
      })}
    </div>
  </aside>
)
