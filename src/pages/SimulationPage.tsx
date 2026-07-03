import { MatchCard } from '../components/MatchCard'
import { Button } from '../components/Button'
import type { SimulatedMatch } from '../types/rugby'

type SimulationPageProps = {
  matches: SimulatedMatch[]
  onResult: () => void
  onReplay: () => void
}

export const SimulationPage = ({ matches, onResult, onReplay }: SimulationPageProps) => (
  <main className="simulation-page">
    <section className="page-title">
      <p className="eyebrow">Road to Webb Ellis</p>
      <h1>Cup Run</h1>
      <div className="result-actions">
        <Button variant="secondary" onClick={onReplay}>
          Replay
        </Button>
        <Button onClick={onResult}>Final Result</Button>
      </div>
    </section>
    <section className="match-grid">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </section>
  </main>
)
