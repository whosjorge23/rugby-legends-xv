import { positions } from '../data/positions'
import type { Player, SelectedTeam, SimulatedMatch } from '../types/rugby'
import { Button } from './Button'

type LineupDialogProps = {
  match: SimulatedMatch
  team: SelectedTeam
  onClose: () => void
  onStart: () => void
}

const playerMeta = (player: Player) => `${player.flag} ${player.countryCode} ${player.year}`

export const LineupDialog = ({ match, team, onClose, onStart }: LineupDialogProps) => (
  <div className="lineup-backdrop" role="presentation">
    <section className="lineup-dialog" role="dialog" aria-modal="true" aria-labelledby="lineup-title">
      <div className="lineup-dialog-header">
        <div>
          <p className="eyebrow">{match.stage}</p>
          <h2 id="lineup-title">Starting XV</h2>
          <p>
            Your XV vs {match.opponent.flag} {match.opponent.country} {match.opponent.year}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label="Close lineup dialog">
          Close
        </Button>
      </div>

      <div className="lineup-columns">
        <article className="lineup-team">
          <div className="lineup-team-title">
            <span className="team-chip user-chip">Your XV</span>
            <strong>Custom Legends</strong>
          </div>
          <div className="lineup-list">
            {positions.map((position) => {
              const player = team.slots[position.id]

              return (
                <div className="lineup-row" key={position.id}>
                  <span>{position.number}</span>
                  <div>
                    <strong>{player?.name ?? 'Unfilled'}</strong>
                    <em>{player ? playerMeta(player) : position.name}</em>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="lineup-team">
          <div className="lineup-team-title">
            <span className="team-chip opponent-chip">{match.opponent.countryCode}</span>
            <strong>
              {match.opponent.flag} {match.opponent.country} {match.opponent.year}
            </strong>
          </div>
          <div className="lineup-list">
            {positions.map((position, index) => {
              const player = match.opponent.players[index]

              return (
                <div className="lineup-row" key={`${match.opponent.id}-${position.id}`}>
                  <span>{position.number}</span>
                  <div>
                    <strong>{player.name}</strong>
                    <em>{position.name}</em>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <div className="lineup-actions">
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button onClick={onStart}>Start Match</Button>
      </div>
    </section>
  </div>
)
