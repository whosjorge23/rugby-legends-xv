export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export const pickOne = <T>(items: T[], exclude?: T): T => {
  const pool = exclude ? items.filter((item) => item !== exclude) : items
  return pool[randomInt(0, pool.length - 1)]
}

export const shuffle = <T>(items: T[]): T[] =>
  [...items].sort(() => (Math.random() > 0.5 ? 1 : -1))
