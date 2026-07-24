import { tacticById } from '../data/tactics'
import type { SimulatedMatch } from '../types/rugby'

type MatchCardProps = {
  match: SimulatedMatch
  visibleEventCount?: number
  isActive?: boolean
  isComplete?: boolean
}

const eventPoints = (event: SimulatedMatch['events'][number]) => {
  if (event.successful === false) return 0
  const { type } = event
  if (type === 'TRY') return 5
  if (type === 'CONVERSION') return 2
  if (type === 'PENALTY' || type === 'DROP_GOAL') return 3
  return 0
}

export const MatchCard = ({
  match,
  visibleEventCount = match.events.length,
  isActive = false,
  isComplete = true,
}: MatchCardProps) => {
  const visibleEvents = match.events.slice(0, visibleEventCount)
  const liveScore = visibleEvents.reduce(
    (score, event) => {
      const points = eventPoints(event)
      return event.team === 'user'
        ? { ...score, user: score.user + points }
        : { ...score, opponent: score.opponent + points }
    },
    { user: 0, opponent: 0 },
  )

  return (
  <article className={`match-card ${isComplete ? match.result : ''} ${isActive ? 'is-active' : ''}`}>
    <div className="match-topline">
      <span>{match.stage}</span>
      <strong>{isComplete ? (match.result === 'win' ? '✓' : match.result === 'loss' ? '✕' : '=') : '•'}</strong>
    </div>
    <h3>
      Your Team vs {match.opponent.flag} {match.opponent.country} {match.opponent.year}
    </h3>
    <p className="scoreline">
      <span className="user-score">{liveScore.user}</span>
      <span className="score-divider">-</span>
      <span>{liveScore.opponent}</span>
    </p>
    <div className="event-list">
      {visibleEvents.length > 0 ? (
        visibleEvents.map((event, index) => {
        const isUserTry = event.team === 'user' && event.type === 'TRY'
        const points = eventPoints(event)

        return (
          <p
            className={isUserTry ? 'user-try-event' : undefined}
            key={`${match.id}-${event.minute}-${event.playerName}-${event.type}-${index}`}
          >
            <span>{event.minute}'</span>{' '}
            <b className={event.team === 'user' ? 'event-team user-event-team' : 'event-team'}>
              {event.team === 'user' ? 'YOUR XV' : match.opponent.countryCode}
            </b>{' '}
            <strong>{event.type.replace('_', ' ')}{event.successful === false ? ' MISSED' : ''}</strong>
            {points > 0 && (
              <em className={event.team === 'user' ? 'event-points user-points' : 'event-points'}>
                +{points}
              </em>
            )}{' '}
            - {event.playerName}
          </p>
        )
        })
      ) : (
        <p className="awaiting-event">Ready to simulate the match</p>
      )}
    </div>
    <div className="match-plan-summary">
      <span>Captain: {match.captainName}</span>
      <span>Kicker: {match.kickerName}</span>
      <span>Tactic: {tacticById[match.setup.tactic].name}</span>
      <strong>Standout: {isComplete ? match.standoutPlayerName : ''}</strong>
    </div>
  </article>
  )
}
