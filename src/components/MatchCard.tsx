import type { SimulatedMatch } from '../types/rugby'

type MatchCardProps = {
  match: SimulatedMatch
}

export const MatchCard = ({ match }: MatchCardProps) => (
  <article className={`match-card ${match.result}`}>
    <div className="match-topline">
      <span>{match.stage}</span>
      <strong>{match.result === 'win' ? '✓' : match.result === 'loss' ? '✕' : '='}</strong>
    </div>
    <h3>
      Your Team vs {match.opponent.flag} {match.opponent.country} {match.opponent.year}
    </h3>
    <p className="scoreline">
      <span className="user-score">{match.userScore}</span>
      <span className="score-divider">-</span>
      <span>{match.opponentScore}</span>
    </p>
    <div className="event-list">
      {match.events.map((event) => {
        const isUserTry = event.team === 'user' && event.type === 'TRY'

        return (
        <p className={isUserTry ? 'user-try-event' : undefined} key={`${match.id}-${event.minute}-${event.playerName}-${event.type}`}>
          <span>{event.minute}'</span> <strong>{event.type.replace('_', ' ')}</strong> - {event.playerName}
        </p>
        )
      })}
    </div>
  </article>
)
