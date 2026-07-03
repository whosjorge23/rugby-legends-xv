import { positionById } from '../data/positions'
import type { Player, RugbyPositionId } from '../types/rugby'

type PositionSlotProps = {
  positionId: RugbyPositionId
  player: Player | null
}

export const PositionSlot = ({ positionId, player }: PositionSlotProps) => {
  const position = positionById[positionId]

  return (
    <div className={`position-slot ${player ? 'is-filled' : ''}`}>
      <span className="slot-number">{position.number}</span>
      <span className="slot-name">{player?.name ?? position.name}</span>
      <span className="slot-meta">{player ? `${player.flag} ${player.countryCode} ${player.year}` : position.id}</span>
    </div>
  )
}
