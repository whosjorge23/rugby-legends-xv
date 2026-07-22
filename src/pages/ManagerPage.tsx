import { tactics } from '../data/tactics'
import { calculateSquadRatings, selectedPlayers } from '../logic/ratings'
import type { MatchStage, MatchdaySetup, SelectedTeam, Squad, TeamRatings } from '../types/rugby'
import { Button } from '../components/Button'

type ManagerPageProps = {
  opponent: Squad
  stage: MatchStage
  matchNumber: number
  team: SelectedTeam
  ratings: TeamRatings
  setup: MatchdaySetup
  onSetupChange: (setup: MatchdaySetup) => void
  onPlay: () => void
  onRestart: () => void
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="scouting-stat">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
)

export const ManagerPage = ({
  opponent,
  stage,
  matchNumber,
  team,
  ratings,
  setup,
  onSetupChange,
  onPlay,
  onRestart,
}: ManagerPageProps) => {
  const players = selectedPlayers(team)
  const opponentRatings = calculateSquadRatings(opponent)
  const captain = players.find((player) => player.id === setup.captainId)
  const kicker = players.find((player) => player.id === setup.kickerId)

  return (
    <main className="manager-page">
      <section className="page-title">
        <div>
          <p className="eyebrow">Match {matchNumber} · {stage}</p>
          <h1>Matchday</h1>
        </div>
        <Button variant="secondary" onClick={onRestart}>Restart Cup</Button>
      </section>

      <section className="manager-grid">
        <article className="opponent-card">
          <p className="panel-kicker">Opposition Report</p>
          <div className="opponent-identity">
            <span aria-hidden="true">{opponent.flag}</span>
            <div>
              <h2>{opponent.country}</h2>
              <p>{opponent.year} {opponent.tournament}</p>
            </div>
          </div>
          <div className="scouting-grid">
            <Stat label="Overall" value={opponentRatings.overall} />
            <Stat label="Attack" value={opponentRatings.attack} />
            <Stat label="Defence" value={opponentRatings.defense} />
            <Stat label="Kicking" value={opponentRatings.kicking} />
          </div>
          <div className="versus-ratings">
            <span>Your XV {ratings.overall}</span>
            <strong>VS</strong>
            <span>{opponent.countryCode} {opponentRatings.overall}</span>
          </div>
        </article>

        <section className="manager-controls" aria-labelledby="manager-controls-title">
          <div>
            <p className="panel-kicker">Team Roles</p>
            <h2 id="manager-controls-title">Set your match plan</h2>
          </div>

          <div className="role-grid">
            <label className="role-control">
              <span>Captain</span>
              <select
                value={setup.captainId}
                onChange={(event) => onSetupChange({ ...setup, captainId: event.target.value })}
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} · Leadership {player.leadership ?? player.discipline}
                  </option>
                ))}
              </select>
              <small>{captain?.name} adds leadership to team discipline.</small>
            </label>

            <label className="role-control">
              <span>Goal-kicker</span>
              <select
                value={setup.kickerId}
                onChange={(event) => onSetupChange({ ...setup, kickerId: event.target.value })}
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} · Kicking {player.kicking}
                  </option>
                ))}
              </select>
              <small>{kicker?.name} takes every conversion and penalty.</small>
            </label>
          </div>

          <fieldset className="tactic-picker">
            <legend>Match tactic</legend>
            <div className="tactic-grid">
              {tactics.map((tactic) => (
                <button
                  key={tactic.id}
                  type="button"
                  className={`tactic-card ${setup.tactic === tactic.id ? 'is-selected' : ''}`}
                  aria-pressed={setup.tactic === tactic.id}
                  onClick={() => onSetupChange({ ...setup, tactic: tactic.id })}
                >
                  <strong>{tactic.name}</strong>
                  <span>{tactic.description}</span>
                  <em>{tactic.impact}</em>
                </button>
              ))}
            </div>
          </fieldset>

          <Button className="play-match-button" onClick={onPlay}>Play {stage}</Button>
        </section>
      </section>
    </main>
  )
}
