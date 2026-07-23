import { useRef, useState } from 'react'
import { positions } from '../data/positions'
import { tacticById } from '../data/tactics'
import type { ResultSummary, SelectedTeam, SimulatedMatch, TeamRatings } from '../types/rugby'
import { Button } from './Button'

type ResultShareCardProps = {
  summary: ResultSummary
  team: SelectedTeam
  ratings: TeamRatings
  matches: SimulatedMatch[]
}

const EXPORT_WIDTH = 1200
const EXPORT_HEIGHT = 1500

const shareCardExportCss = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .share-card {
    width: ${EXPORT_WIDTH}px;
    height: ${EXPORT_HEIGHT}px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    background: #fbfdf9;
    color: #172321;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 64px;
  }
  .share-card-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #d7352a;
    font-size: 34px;
    font-weight: 950;
    text-transform: uppercase;
  }
  .share-card h3 {
    margin: 0;
    color: #153248;
    font-size: 92px;
    line-height: 0.9;
    text-transform: uppercase;
  }
  .share-card-result {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 18px;
  }
  .share-card-result strong,
  .share-card-result span {
    border-radius: 28px;
    padding: 26px;
  }
  .share-card-result strong {
    background: #d7352a;
    color: #fff;
    font-size: 60px;
    line-height: 0.95;
    text-transform: uppercase;
  }
  .share-card-result span {
    background: #eef8f4;
    color: #153248;
    font-size: 38px;
    font-weight: 950;
  }
  .share-card-stats,
  .share-card-roles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .share-card-roles {
    grid-template-columns: repeat(2, 1fr);
  }
  .share-card-stat,
  .share-card-role {
    display: grid;
    gap: 8px;
    border: 2px solid #cddbd3;
    border-radius: 24px;
    background: #f8f4dc;
    padding: 22px;
  }
  .share-card-stat span,
  .share-card-role span {
    color: #66756f;
    font-size: 20px;
    font-weight: 950;
    text-transform: uppercase;
  }
  .share-card-stat strong,
  .share-card-role strong {
    color: #153248;
    font-size: 32px;
    line-height: 1.08;
  }
  .share-card-xv {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: auto;
  }
  .share-card-player {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    border-top: 2px solid #cddbd3;
    padding-top: 12px;
  }
  .share-card-player span {
    color: #d7352a;
    font-size: 30px;
    font-weight: 950;
  }
  .share-card-player strong {
    color: #172321;
    font-size: 24px;
    line-height: 1.05;
  }
  .share-card-player em {
    color: #66756f;
    font-size: 16px;
    font-style: normal;
    font-weight: 900;
  }
  .share-card-footer {
    display: flex;
    justify-content: space-between;
    border-top: 3px solid #153248;
    padding-top: 18px;
    color: #66756f;
    font-size: 22px;
    font-weight: 950;
    text-transform: uppercase;
  }
`

const mostFrequent = <Value extends string>(values: Value[]) => {
  const counts = values.reduce((map, value) => {
    map.set(value, (map.get(value) ?? 0) + 1)
    return map
  }, new Map<Value, number>())

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]
}

const downloadBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rugby-legends-xv-result.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const ResultShareCard = ({ summary, team, ratings, matches }: ResultShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const lastMatch = matches[matches.length - 1]
  const favouriteTactic = mostFrequent(matches.map((match) => match.setup.tactic))
  const cupStandout = mostFrequent(matches.map((match) => match.standoutPlayerName))

  const exportPng = async () => {
    const card = cardRef.current
    if (!card) return

    setIsExporting(true)
    setExportError('')

    try {
      const cardMarkup = card.outerHTML
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}">
          <foreignObject width="100%" height="100%">
            <html xmlns="http://www.w3.org/1999/xhtml">
              <head>
                <style>${shareCardExportCss}</style>
              </head>
              <body>${cardMarkup}</body>
            </html>
          </foreignObject>
        </svg>
      `
      const image = new Image()
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('Unable to render result card.'))
        image.src = svgUrl
      })

      const canvas = document.createElement('canvas')
      canvas.width = EXPORT_WIDTH
      canvas.height = EXPORT_HEIGHT
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas export is unavailable.')

      context.fillStyle = '#fbfdf9'
      context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
      context.drawImage(image, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
      URL.revokeObjectURL(svgUrl)

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('PNG export failed.'))
        }, 'image/png')
      })

      downloadBlob(pngBlob)
    } catch {
      setExportError('Could not export the card. Try another browser or screenshot this card.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="share-card-section" aria-labelledby="share-card-title">
      <div className="share-card-heading">
        <div>
          <p className="panel-kicker">Share Card</p>
          <h2 id="share-card-title">My Rugby Legends XV</h2>
        </div>
        <Button onClick={exportPng} disabled={isExporting}>
          {isExporting ? 'Preparing...' : 'Download PNG'}
        </Button>
      </div>
      {exportError && <p className="share-card-error">{exportError}</p>}
      <div className="share-card-frame">
        <div className="share-card" ref={cardRef}>
          <div className="share-card-topline">
            <span>Rugby Legends XV</span>
            <span>{summary.status}</span>
          </div>
          <h3>My Rugby Legends XV</h3>
          <div className="share-card-result">
            <strong>{summary.status}</strong>
            <span>{summary.exitStage}</span>
          </div>
          <div className="share-card-stats">
            <div className="share-card-stat"><span>Record</span><strong>{summary.record}</strong></div>
            <div className="share-card-stat"><span>Points For</span><strong>{summary.pointsFor}</strong></div>
            <div className="share-card-stat"><span>Overall</span><strong>{ratings.overall}</strong></div>
          </div>
          <div className="share-card-roles">
            <div className="share-card-role"><span>Captain</span><strong>{lastMatch?.captainName ?? '-'}</strong></div>
            <div className="share-card-role"><span>Kicker</span><strong>{lastMatch?.kickerName ?? '-'}</strong></div>
            <div className="share-card-role">
              <span>Cup Standout</span>
              <strong>{cupStandout ?? '-'}</strong>
            </div>
            <div className="share-card-role">
              <span>Favourite Tactic</span>
              <strong>{favouriteTactic ? tacticById[favouriteTactic].name : '-'}</strong>
            </div>
          </div>
          <div className="share-card-xv">
            {positions.map((position) => {
              const player = team.slots[position.id]
              return (
                <div className="share-card-player" key={position.id}>
                  <span>{position.number}</span>
                  <div>
                    <strong>{player?.name ?? 'Empty'}</strong>
                    <em>{player ? `${player.flag} ${player.countryCode} ${player.year}` : position.name}</em>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="share-card-footer">
            <span>PF {summary.pointsFor}</span>
            <span>PA {summary.pointsAgainst}</span>
            <span>Wins {summary.wins}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
