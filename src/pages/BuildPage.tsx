import { PlayerList } from '../components/PlayerList'
import { RatingPanel } from '../components/RatingPanel'
import { RollPanel } from '../components/RollPanel'
import { RugbyPitch } from '../components/RugbyPitch'
import type { Player, SelectedTeam, Squad, TeamChemistry, TeamRatings } from '../types/rugby'

type BuildPageProps = {
  drawnSquad: Squad | null
  team: SelectedTeam
  ratings: TeamRatings
  chemistry: TeamChemistry
  completeCount: number
  isComplete: boolean
  hasPickedFromDraw: boolean
  teamRerolls: number
  cupRerolls: number
  onRoll: () => void
  onRerollTeam: () => void
  onRerollCup: () => void
  onSelectPlayer: (player: Player) => void
  onSimulate: () => void
}

export const BuildPage = ({
  drawnSquad,
  team,
  ratings,
  chemistry,
  completeCount,
  isComplete,
  hasPickedFromDraw,
  teamRerolls,
  cupRerolls,
  onRoll,
  onRerollTeam,
  onRerollCup,
  onSelectPlayer,
  onSimulate,
}: BuildPageProps) => (
  <main className="build-layout">
    <div className="left-rail">
      <RollPanel
        squad={drawnSquad}
        canRoll={!drawnSquad || hasPickedFromDraw}
        isComplete={isComplete}
        teamRerolls={teamRerolls}
        cupRerolls={cupRerolls}
        onRoll={onRoll}
        onRerollTeam={onRerollTeam}
        onRerollCup={onRerollCup}
      />
      <PlayerList squad={drawnSquad} team={team} drawLocked={hasPickedFromDraw} onSelect={onSelectPlayer} />
    </div>
    <RugbyPitch team={team} />
    <RatingPanel
      team={team}
      ratings={ratings}
      chemistry={chemistry}
      completeCount={completeCount}
      isComplete={isComplete}
      onSimulate={onSimulate}
    />
  </main>
)
