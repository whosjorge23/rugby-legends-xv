import type { RugbyPosition, RugbyPositionId, SelectedTeam } from '../types/rugby'

export const positions: RugbyPosition[] = [
  { id: 'LH', number: 1, name: 'Loosehead Prop' },
  { id: 'HK', number: 2, name: 'Hooker' },
  { id: 'TH', number: 3, name: 'Tighthead Prop' },
  { id: 'LO4', number: 4, name: 'Lock' },
  { id: 'LO5', number: 5, name: 'Lock' },
  { id: 'BF', number: 6, name: 'Blindside Flanker' },
  { id: 'OF', number: 7, name: 'Openside Flanker' },
  { id: 'N8', number: 8, name: 'Number Eight' },
  { id: 'SH', number: 9, name: 'Scrum-half' },
  { id: 'FH', number: 10, name: 'Fly-half' },
  { id: 'LW', number: 11, name: 'Left Wing' },
  { id: 'IC', number: 12, name: 'Inside Centre' },
  { id: 'OC', number: 13, name: 'Outside Centre' },
  { id: 'RW', number: 14, name: 'Right Wing' },
  { id: 'FB', number: 15, name: 'Fullback' },
]

export const createEmptyTeam = (): SelectedTeam => ({
  slots: positions.reduce(
    (slots, position) => ({ ...slots, [position.id]: null }),
    {} as Record<RugbyPositionId, null>,
  ),
})

export const positionById = Object.fromEntries(positions.map((position) => [position.id, position])) as Record<
  RugbyPositionId,
  RugbyPosition
>
