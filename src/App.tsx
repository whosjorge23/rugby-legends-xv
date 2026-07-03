import { Header } from './components/Header'
import { useGameState } from './hooks/useGameState'
import { BuildPage } from './pages/BuildPage'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { SimulationPage } from './pages/SimulationPage'

export const App = () => {
  const game = useGameState()

  return (
    <>
      <Header onHome={() => game.setView('home')} onBuild={() => game.setView('build')} />
      {game.view === 'home' && <HomePage onPlay={() => game.setView('build')} />}
      {game.view === 'build' && (
        <BuildPage
          drawnSquad={game.drawnSquad}
          team={game.team}
          ratings={game.ratings}
          completeCount={game.completeCount}
          isComplete={game.isComplete}
          hasPickedFromDraw={game.hasPickedFromDraw}
          teamRerolls={game.teamRerolls}
          cupRerolls={game.cupRerolls}
          onRoll={game.roll}
          onRerollTeam={game.rerollTeam}
          onRerollCup={game.rerollCup}
          onSelectPlayer={game.selectPlayer}
          onSimulate={game.runSimulation}
        />
      )}
      {game.view === 'simulation' && (
        <SimulationPage matches={game.matches} onResult={() => game.setView('result')} onReplay={game.replay} />
      )}
      {game.view === 'result' && (
        <ResultPage
          matches={game.matches}
          team={game.team}
          ratings={game.ratings}
          onReplay={game.replay}
          onBuildAnother={game.resetBuild}
        />
      )}
    </>
  )
}
