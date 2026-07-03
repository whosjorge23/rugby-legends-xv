import { HomeHero } from '../components/HomeHero'

type HomePageProps = {
  onPlay: () => void
}

export const HomePage = ({ onPlay }: HomePageProps) => <HomeHero onPlay={onPlay} />
