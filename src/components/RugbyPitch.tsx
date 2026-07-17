import { positions } from '../data/positions'
import type { SelectedTeam } from '../types/rugby'
import { PositionSlot } from './PositionSlot'

type RugbyPitchProps = {
  team: SelectedTeam
}

export const RugbyPitch = ({ team }: RugbyPitchProps) => (
  <section className="pitch-shell" aria-label="Rugby pitch lineup">
    <div className="pitch">
      <div className="try-line top" />
      <div className="halfway-line" />
      <div className="try-line bottom" />
      <div className="pitch-grid">
        {positions.map((position) => (
          <PositionSlot
            key={`${position.id}-${team.slots[position.id]?.id ?? 'empty'}`}
            positionId={position.id}
            player={team.slots[position.id]}
          />
        ))}
      </div>
    </div>
  </section>
)
