export type Aspiration = {
  slug: string
  name: string
  /** Ce qu'il a fait, en quelques mots. */
  role?: string
  dates?: string
  /**
   * Crédit de la photo (Wikimedia Commons), affiché sous la liste.
   * Pas de crédit, pas de photo : un cadre « photo à venir » en attendant.
   */
  credit?: string
}

/** Mes aspirations préférées, dans l'ordre où je les ai citées. Photos dans public/images/aspirations/<slug>.jpg. */
export const aspirations: Aspiration[] = [
  { slug: "mohamed-ali", name: "Mohamed Ali", role: "boxeur", dates: "1942–2016", credit: "Ira Rosenberg, 1967, domaine public" },
  { slug: "virgil-abloh", name: "Virgil Abloh", role: "designer", dates: "1980–2021", credit: "Myles Kalus Anak Jihem, CC BY-SA 4.0" },
  { slug: "charles-gave", name: "Charles Gave", role: "économiste et financier", dates: "né en 1943", credit: "Thinkerview, CC BY 3.0" },
  { slug: "ateyaba", name: "Ateyaba", role: "rappeur", dates: "né en 1989", credit: "Pablo Tupin-Noriega, CC BY-SA 4.0" },
  { slug: "kanye-west", name: "Kanye West", role: "rappeur, producteur, designer", dates: "né en 1977", credit: "David Shankbone, domaine public" },
  { slug: "spinoza", name: "Spinoza", role: "philosophe", dates: "1632–1677", credit: "anonyme, v. 1665, Herzog August Bibliothek, domaine public" },
  { slug: "leibniz", name: "Leibniz", role: "philosophe et mathématicien", dates: "1646–1716", credit: "Christoph Bernhard Francke, v. 1695, Herzog Anton Ulrich-Museum, domaine public" },
  { slug: "socrate", name: "Socrate", role: "philosophe", dates: "v. 470–399 av. J.-C.", credit: "buste du Louvre, photo Eric Gaba, CC BY-SA 2.5" },
  { slug: "cristiano-ronaldo", name: "Cristiano Ronaldo", role: "footballeur", dates: "né en 1985", credit: "Bryan Berlin, CC BY-SA 4.0" },
  { slug: "drake", name: "Drake", role: "rappeur", dates: "né en 1986", credit: "photo fournie, tous droits réservés" },
  { slug: "tom-ford", name: "Tom Ford", role: "styliste et cinéaste", dates: "né en 1961", credit: "Nicolas Genin, CC BY-SA 2.0" },
  { slug: "tadao-ando", name: "Tadao Ando", role: "architecte", dates: "né en 1941", credit: "Christopher Schriner, CC BY-SA 2.0" },
  { slug: "moriba-kone", name: "Moriba Kone", credit: "photo Technikart, tous droits réservés" },
  { slug: "enzo-destouches", name: "Enzo Destouches" },
  { slug: "adam-sandler", name: "Adam Sandler", role: "acteur et humoriste", dates: "né en 1966", credit: "Bryan Berlin, CC BY-SA 4.0" },
  { slug: "younes-bendjima", name: "Younes Bendjima", role: "mannequin" },
  { slug: "idriss-aberkane", name: "Idriss Aberkane", role: "essayiste et conférencier", dates: "né en 1986", credit: "Vivre et réussir en Afrique, CC BY 4.0" },
  { slug: "theo-lion", name: "Théo Lion", role: "fondateur de Coudac", credit: "photo fournie, tous droits réservés" },
  { slug: "anice-lajnef", name: "Anice Lajnef", role: "ancien trader, économiste et écrivain", credit: "photo fournie, tous droits réservés" },
  { slug: "arthur-kar", name: "Arthur Kar", role: "fondateur de L'Art de L'Automobile" },
  { slug: "jean-marc-jancovici", name: "Jean-Marc Jancovici", role: "ingénieur, énergie et climat", dates: "né en 1962", credit: "Thinkerview, CC BY-SA 4.0" },
  { slug: "haroun", name: "Haroun", role: "humoriste", dates: "né en 1984", credit: "A ODW, CC BY-SA 4.0" },
  { slug: "julie-kegels", name: "Julie Kegels", role: "styliste, prix LVMH 2026", credit: "autoportrait de Julie Kegels, tous droits réservés" },
]

export const photoOf = (a: Aspiration) => (a.credit ? `/images/aspirations/${a.slug}.jpg` : null)
