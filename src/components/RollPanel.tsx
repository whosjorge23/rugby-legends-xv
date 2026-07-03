import type { Squad } from '../types/rugby'
import { Button } from './Button'

type RollPanelProps = {
  squad: Squad | null
  canRoll: boolean
  teamRerolls: number
  cupRerolls: number
  onRoll: () => void
  onRerollTeam: () => void
  onRerollCup: () => void
}

export const RollPanel = ({ squad, canRoll, teamRerolls, cupRerolls, onRoll, onRerollTeam, onRerollCup }: RollPanelProps) => (
  <section className="panel roll-panel">
    <p className="panel-kicker">Drawn</p>
    {squad ? (
      <div className="drawn-card">
        <span className="drawn-flag">{squad.flag}</span>
        <h2>{squad.country}</h2>
        <p>
          {squad.tournament} {squad.year}
        </p>
      </div>
    ) : (
      <div className="drawn-card empty">
        <span className="drawn-flag">?</span>
        <h2>No squad yet</h2>
        <p>Roll to reveal a historical national team.</p>
      </div>
    )}
    {squad && !canRoll && <p className="draw-lock">Choose one available player before rolling again.</p>}
    <div className="stacked-actions">
      <Button onClick={onRoll} disabled={!canRoll}>
        {squad ? 'Roll Again' : 'Roll'}
      </Button>
      <Button variant="secondary" onClick={onRerollTeam} disabled={!squad || !canRoll || teamRerolls === 0}>
        Another Team ({teamRerolls})
      </Button>
      <Button variant="secondary" onClick={onRerollCup} disabled={!squad || !canRoll || cupRerolls === 0}>
        Another Cup ({cupRerolls})
      </Button>
    </div>
  </section>
)
