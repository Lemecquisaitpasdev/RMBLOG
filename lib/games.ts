export type Game = {
  slug: string
  title: string
  year: number
  studio: string
  /** Couleur tirée de la pochette, pour la lueur de la sélection. */
  accent: string
}

/** Mes jeux vidéo préférés, dans l'ordre où je les ai cités. Pochettes dans public/images/jeux/<slug>.jpg. */
export const games: Game[] = [
  { slug: "gta-5", title: "Grand Theft Auto V", year: 2013, studio: "Rockstar North", accent: "#d9764a" },
  { slug: "the-last-of-us", title: "The Last of Us", year: 2013, studio: "Naughty Dog", accent: "#d98459" },
  { slug: "the-last-of-us-2", title: "The Last of Us Part II", year: 2020, studio: "Naughty Dog", accent: "#7aaed9" },
  { slug: "a-plague-tale-requiem", title: "A Plague Tale: Requiem", year: 2022, studio: "Asobo Studio", accent: "#d99a72" },
  { slug: "assassins-creed-3", title: "Assassin's Creed III", year: 2012, studio: "Ubisoft Montréal", accent: "#dcdcdc" },
  { slug: "assassins-creed-valhalla", title: "Assassin's Creed Valhalla", year: 2020, studio: "Ubisoft Montréal", accent: "#dcdcdc" },
  { slug: "fifa-19", title: "FIFA 19", year: 2018, studio: "EA Vancouver", accent: "#04a7e2" },
  { slug: "black-ops-3", title: "Call of Duty: Black Ops III", year: 2015, studio: "Treyarch", accent: "#d9500a" },
  { slug: "modern-warfare-3", title: "Call of Duty: Modern Warfare 3", year: 2011, studio: "Infinity Ward · Sledgehammer Games", accent: "#a9d947" },
  { slug: "gta-4", title: "Grand Theft Auto IV", year: 2008, studio: "Rockstar North", accent: "#d98462" },
  { slug: "red-dead-redemption", title: "Red Dead Redemption", year: 2010, studio: "Rockstar San Diego", accent: "#d90c13" },
  { slug: "infinite-warfare", title: "Call of Duty: Infinite Warfare", year: 2016, studio: "Infinity Ward", accent: "#d8d92a" },
  { slug: "ghost-of-tsushima", title: "Ghost of Tsushima", year: 2020, studio: "Sucker Punch Productions", accent: "#d94334" },
  { slug: "destiny", title: "Destiny", year: 2014, studio: "Bungie", accent: "#64a3d9" },
  { slug: "the-division", title: "Tom Clancy's The Division", year: 2016, studio: "Massive Entertainment", accent: "#e27734" },
  { slug: "shadow-of-the-tomb-raider", title: "Shadow of the Tomb Raider", year: 2018, studio: "Eidos-Montréal", accent: "#d95718" },
]

export const coverOf = (game: Game) => `/images/jeux/${game.slug}.jpg`
