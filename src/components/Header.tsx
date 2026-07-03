import { Button } from './Button'

type HeaderProps = {
  onHome: () => void
  onBuild: () => void
}

export const Header = ({ onHome, onBuild }: HeaderProps) => (
  <header className="site-header">
    <button className="brand-mark" onClick={onHome} aria-label="Go home">
      <span>RLXV</span>
    </button>
    <nav className="header-actions" aria-label="Main navigation">
      <Button variant="ghost" onClick={onHome}>
        Home
      </Button>
      <Button variant="secondary" onClick={onBuild}>
        Build XV
      </Button>
    </nav>
  </header>
)
