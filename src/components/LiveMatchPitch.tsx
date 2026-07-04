import type { CSSProperties } from 'react'
import { positions } from '../data/positions'
import type { MatchEvent, Player, SelectedTeam, SimulatedMatch } from '../types/rugby'

type LiveMatchPitchProps = {
  match: SimulatedMatch | undefined
  team: SelectedTeam
  visibleEventCount: number
  isSimulating: boolean
}

type DotPlayer = {
  id: string
  name: string
  number: number
  team: MatchEvent['team']
  x: number
  y: number
  tryY: number
}

type DotStyle = CSSProperties & {
  '--home-x': string
  '--home-y': string
  '--event-x': string
  '--event-y': string
  '--break-mid-x': string
  '--drift-delay': string
  '--line-shift': string
  '--try-chase': string
}

const lineOrder = [11, 14, 15, 13, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

const lineSpotByNumber = lineOrder.reduce(
  (spots, number, index) => ({
    ...spots,
    [number]: {
      x: 36,
      y: 12 + index * 5.4,
    },
  }),
  {} as Record<number, { x: number; y: number }>,
)

const fallbackLineSpot = (index: number) => ({
  x: 36,
  y: 12 + Math.min(index, 14) * 5.4,
})

const mirrorLineSpot = (spot: { x: number; y: number }) => ({
  x: 100 - spot.x,
  y: spot.y,
})

const reverseLineSpot = (spot: { x: number; y: number }) => ({
  x: spot.x,
  y: 100 - spot.y,
})

const lineSpotFor = (number: number, index = 0) => {
  return lineSpotByNumber[number] ?? fallbackLineSpot(index)
}

const tryYFor = (number: number, team: MatchEvent['team'], index = 0) => {
  const base = team === 'user' ? lineSpotFor(number, index) : reverseLineSpot(lineSpotFor(number, index))

  return base.y
}

const tryXFor = (playerTeam: MatchEvent['team'], scoringTeam: MatchEvent['team']) => {
  if (scoringTeam === 'user') return playerTeam === 'user' ? 18 : 11
  return playerTeam === 'opponent' ? 82 : 89
}

const eventLabel: Record<MatchEvent['type'], string> = {
  TRY: 'TRY',
  CONVERSION: 'CONVERSION',
  PENALTY: 'PENALTY',
  DROP_GOAL: 'DROP GOAL',
  YELLOW_CARD: 'YELLOW CARD',
}

const playerNumber = (player: Player) => positions.find((position) => position.id === player.position)?.number ?? player.shirtNumber

const toUserDots = (team: SelectedTeam): DotPlayer[] =>
  positions
    .map((position) => team.slots[position.id])
    .filter((player): player is Player => Boolean(player))
    .map((player, index) => {
      const number = playerNumber(player)
      const home = mirrorLineSpot(lineSpotFor(number, index))

      return {
        id: player.id,
        name: player.name,
        number,
        team: 'user',
        x: home.x,
        y: home.y,
        tryY: tryYFor(number, 'user', index),
      }
    })

const toOpponentDots = (match: SimulatedMatch): DotPlayer[] =>
  match.opponent.players.slice(0, 15).map((player, index) => {
    const number = playerNumber(player) || index + 1
    const home = reverseLineSpot(lineSpotFor(number, index))

    return {
      id: player.id,
      name: player.name,
      number,
      team: 'opponent',
      x: home.x,
      y: home.y,
      tryY: tryYFor(number, 'opponent', index),
    }
  })

const eventTarget = (event: MatchEvent | undefined, scorerY?: number) => {
  if (!event) return { x: 50, y: 50 }

  const attackingRight = event.team === 'opponent'
  const tryX = attackingRight ? 91 : 9
  const postX = attackingRight ? 84 : 16
  const touchline = scorerY ?? 50

  if (event.type === 'TRY') return { x: tryX, y: touchline }
  if (event.type === 'YELLOW_CARD') return { x: 50, y: 8 }

  return { x: postX, y: 50 }
}

export const LiveMatchPitch = ({ match, team, visibleEventCount, isSimulating }: LiveMatchPitchProps) => {
  if (!match) return null

  const activeEvent = visibleEventCount > 0 ? match.events[visibleEventCount - 1] : undefined
  const players = [...toUserDots(team), ...toOpponentDots(match)]
  const activePlayer = activeEvent
    ? players.find((player) => activeEvent.team === player.team && activeEvent.playerName === player.name)
    : undefined
  const activeTarget = eventTarget(activeEvent, activePlayer?.y)
  const isTryPhase = activeEvent?.type === 'TRY'
  const eventKey = activeEvent
    ? `${match.id}-${visibleEventCount}-${activeEvent.minute}-${activeEvent.playerName}-${activeEvent.type}`
    : match.id

  return (
    <section className="live-match-panel">
      <div className="live-match-header">
        <div>
          <p className="panel-kicker">Live View</p>
          <h2>
            Your XV vs {match.opponent.flag} {match.opponent.country}
          </h2>
        </div>
        <div className="live-match-status">
          <span className="team-chip user-chip">Your XV</span>
          <span className="team-chip opponent-chip">{match.opponent.countryCode}</span>
        </div>
      </div>
      <div className={`live-pitch ${isSimulating ? 'is-running' : ''}`} aria-label="Live match pitch">
        <div className="live-try-zone left">TRY</div>
        <div className="live-try-zone right">TRY</div>
        <div className="live-halfway-line" />
        <div className="live-posts left">
          <span />
          <span />
        </div>
        <div className="live-posts right">
          <span />
          <span />
        </div>
        {players.map((player, index) => {
          const isActive = activeEvent?.team === player.team && activeEvent.playerName === player.name
          const isTryEvent = isActive && activeEvent?.type === 'TRY'
          const trySpot = {
            x: activeEvent ? tryXFor(player.team, activeEvent.team) : player.x,
            y: player.tryY,
          }
          const homeX = isTryPhase ? trySpot.x : player.x
          const homeY = isTryPhase ? trySpot.y : player.y
          const breakMidX = (homeX + activeTarget.x) / 2
          const style: DotStyle = {
            '--home-x': `${homeX}%`,
            '--home-y': `${homeY}%`,
            '--event-x': `${activeTarget.x}%`,
            '--event-y': `${activeTarget.y}%`,
            '--break-mid-x': `${breakMidX}%`,
            '--drift-delay': `${(index % 6) * -0.8}s`,
            '--line-shift': player.team === 'user' ? '-22px' : '22px',
            '--try-chase': '0px',
            left: 'var(--home-x)',
            top: 'var(--home-y)',
          }

          return (
            <span
              key={`${player.team}-${player.id}-${isActive ? eventKey : 'home'}`}
              className={`player-dot ${player.team}-dot ${isActive ? 'is-eventing' : ''} ${
                isTryEvent ? 'is-try-break' : ''
              } ${isTryPhase && !isTryEvent ? 'is-try-chasing' : ''}`}
              style={style}
              title={player.name}
            >
              <span>{player.number}</span>
            </span>
          )
        })}
        {activeEvent && (
          <div className="ball-marker" key={eventKey} style={{ left: `${activeTarget.x}%`, top: `${activeTarget.y}%` }} />
        )}
      </div>
      <div className="live-event-strip">
        {activeEvent ? (
          <>
            <span>{activeEvent.minute}'</span>
            <strong>{eventLabel[activeEvent.type]}</strong>
            <em>{activeEvent.playerName}</em>
          </>
        ) : (
          <span>Kick-off ready</span>
        )}
      </div>
    </section>
  )
}
