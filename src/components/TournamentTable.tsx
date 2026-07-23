import type { GroupFixtureResult, SimulatedMatch, Squad } from '../types/rugby'

type TournamentTableProps = {
  matches: SimulatedMatch[]
  groupFixtures: GroupFixtureResult[]
  cupSchedule: Squad[]
}

type TableRow = {
  id: string
  name: string
  played: number
  wins: number
  draws: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  tablePoints: number
}

const createRow = (id: string, name: string): TableRow => ({
  id,
  name,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  pointsFor: 0,
  pointsAgainst: 0,
  tablePoints: 0,
})

const addResult = (row: TableRow, pointsFor: number, pointsAgainst: number) => {
  row.played += 1
  row.pointsFor += pointsFor
  row.pointsAgainst += pointsAgainst

  if (pointsFor > pointsAgainst) {
    row.wins += 1
    row.tablePoints += 4
  } else if (pointsFor < pointsAgainst) {
    row.losses += 1
  } else {
    row.draws += 1
    row.tablePoints += 2
  }
}

export const TournamentTable = ({ matches, groupFixtures, cupSchedule }: TournamentTableProps) => {
  const groupMatches = matches.filter((match) => match.stage === 'Groups')
  const groupOpponents = cupSchedule.slice(0, 3)
  if (groupOpponents.length === 0 && groupMatches.length === 0) return null

  const rows = new Map<string, TableRow>()
  rows.set('user', createRow('user', 'Your XV'))
  groupOpponents.forEach((squad) => {
    rows.set(squad.id, createRow(squad.id, `${squad.flag} ${squad.country} ${squad.year}`))
  })

  groupMatches.forEach((match) => {
    const opponentRow = rows.get(match.opponent.id) ?? createRow(match.opponent.id, `${match.opponent.flag} ${match.opponent.country} ${match.opponent.year}`)
    rows.set(match.opponent.id, opponentRow)
    addResult(rows.get('user')!, match.userScore, match.opponentScore)
    addResult(opponentRow, match.opponentScore, match.userScore)
  })

  groupFixtures.forEach((fixture) => {
    const homeRow = rows.get(fixture.home.id) ?? createRow(fixture.home.id, `${fixture.home.flag} ${fixture.home.country} ${fixture.home.year}`)
    const awayRow = rows.get(fixture.away.id) ?? createRow(fixture.away.id, `${fixture.away.flag} ${fixture.away.country} ${fixture.away.year}`)
    rows.set(fixture.home.id, homeRow)
    rows.set(fixture.away.id, awayRow)
    addResult(homeRow, fixture.homeScore, fixture.awayScore)
    addResult(awayRow, fixture.awayScore, fixture.homeScore)
  })

  const sortedRows = [...rows.values()].sort((left, right) => {
    const pointsDifference = right.tablePoints - left.tablePoints
    if (pointsDifference !== 0) return pointsDifference
    const scoreDifference = (right.pointsFor - right.pointsAgainst) - (left.pointsFor - left.pointsAgainst)
    if (scoreDifference !== 0) return scoreDifference
    return right.pointsFor - left.pointsFor
  })

  return (
    <section className="tournament-table-panel" aria-labelledby="group-table-title">
      <div className="live-match-header">
        <div>
          <p className="panel-kicker">Group Stage</p>
          <h2 id="group-table-title">Tournament Table</h2>
        </div>
        <span className="table-progress">{groupMatches.length}/3 played</span>
      </div>
      <div className="tournament-table" role="table" aria-label="Group stage standings">
        <div className="table-row table-head" role="row">
          <span>Team</span>
          <span>P</span>
          <span>W</span>
          <span>D</span>
          <span>L</span>
          <span>PD</span>
          <span>Pts</span>
        </div>
        {sortedRows.map((row) => (
          <div className={`table-row ${row.id === 'user' ? 'user-table-row' : ''}`} role="row" key={row.id}>
            <strong>{row.name}</strong>
            <span>{row.played}</span>
            <span>{row.wins}</span>
            <span>{row.draws}</span>
            <span>{row.losses}</span>
            <span>{row.pointsFor - row.pointsAgainst}</span>
            <span>{row.tablePoints}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
