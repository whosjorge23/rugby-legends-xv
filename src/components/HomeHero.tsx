import { Button } from './Button'
import { RugbyPitch } from './RugbyPitch'
import { createEmptyTeam } from '../data/positions'

type HomeHeroProps = {
  onPlay: () => void
}

export const HomeHero = ({ onPlay }: HomeHeroProps) => (
  <main className="home-layout">
    <section className="hero-copy">
      <p className="eyebrow">Rugby Legends XV</p>
      <h1>Dream XV</h1>
      <p className="hero-subtitle">Roll the dice. Build your legendary rugby team.</p>
      <div className="hero-actions">
        <Button onClick={onPlay}>Play Now</Button>
        <Button variant="secondary" disabled>
          Daily Challenge
        </Button>
        <Button variant="secondary" disabled>
          With Friends
        </Button>
      </div>
    </section>
    <section className="hero-preview" aria-label="Pitch preview">
      <RugbyPitch team={createEmptyTeam()} />
    </section>
  </main>
)
