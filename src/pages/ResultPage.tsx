import { ResultCard } from '../components/ResultCard'
import type { ResultSummary, SelectedTeam, SimulatedMatch, TeamRatings } from '../types/rugby'

type ResultPageProps = {
  matches: SimulatedMatch[]
  team: SelectedTeam
  ratings: TeamRatings
  onReplay: () => void
  onBuildAnother: () => void
}

const summarize = (matches: SimulatedMatch[]): ResultSummary => {
  const wins = matches.filter((match) => match.result === 'win').length
  const draws = matches.filter((match) => match.result === 'draw').length
  const losses = matches.filter((match) => match.result === 'loss').length
  const pointsFor = matches.reduce((total, match) => total + match.userScore, 0)
  const pointsAgainst = matches.reduce((total, match) => total + match.opponentScore, 0)
  const losingKnockout = matches.find((match) => match.stage !== 'Groups' && match.result !== 'win')
  const wonFinal = matches.some((match) => match.stage === 'Final' && match.result === 'win')

  return {
    status: wonFinal ? 'Champion' : 'Eliminated',
    exitStage: wonFinal ? 'Champion' : losingKnockout?.stage ?? 'Groups',
    record: `${wins}-${losses}-${draws}`,
    pointsFor,
    pointsAgainst,
    wins,
  }
}

export const ResultPage = ({ matches, team, ratings, onReplay, onBuildAnother }: ResultPageProps) => (
  <main className="result-page">
    <ResultCard
      summary={summarize(matches)}
      team={team}
      ratings={ratings}
      matches={matches}
      onReplay={onReplay}
      onBuildAnother={onBuildAnother}
    />
  </main>
)
