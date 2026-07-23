import type { Player, SelectedTeam, Squad } from '../types/rugby'

type PlayerListProps = {
  squad: Squad | null
  team: SelectedTeam
  drawLocked: boolean
  onSelect: (player: Player) => void
}

export const PlayerList = ({ squad, team, drawLocked, onSelect }: PlayerListProps) => {
  const unavailableCount = squad
    ? squad.players.filter((player) => drawLocked || Boolean(team.slots[player.position])).length
    : 0

  return (
  <section className="panel player-panel">
    <div className="panel-heading">
      <p className="panel-kicker">Squad Sheet</p>
      <span>
        {squad ? (drawLocked ? 'Pick used' : `${squad.players.length - unavailableCount} available`) : 'Awaiting draw'}
      </span>
    </div>
    {squad && drawLocked && <p className="draw-lock">One legend taken from this draw. Roll again for the next pick.</p>}
    <div className="player-list" key={squad?.id ?? 'empty-squad'}>
      {squad ? (
        squad.players.map((player) => {
          const positionLocked = Boolean(team.slots[player.position])
          const isDisabled = drawLocked || positionLocked

          return (
            <button
              key={player.id}
              className="player-row"
              onClick={() => onSelect(player)}
              disabled={isDisabled}
              title={positionLocked ? 'Position already filled' : undefined}
            >
              <span className="player-number">#{player.shirtNumber}</span>
              <span className="player-name">{player.name}</span>
              <span className="player-position">{player.position}</span>
              <span className="player-rating">
                {positionLocked ? (
                  <svg
                    aria-label="Position locked"
                    className="player-lock-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 10V8a5 5 0 0 1 10 0v2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    <rect
                      width="14"
                      height="11"
                      x="5"
                      y="10"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                  </svg>
                ) : (
                  player.overall
                )}
              </span>
            </button>
          )
        })
      ) : (
        <p className="empty-copy">The team sheet will appear after your first roll.</p>
      )}
    </div>
  </section>
  )
}
