export type Painting = {
  /** Fichier attendu dans public/images/oeuvres/. Tant qu'il manque, un cadre « tableau à venir ». */
  src: string
  alt: string
  /** 16:9 à l'horizontale, 9:16 à la verticale. */
  portrait?: boolean
}

/** Mes tableaux, dans l'ordre où je les ai envoyés. Tous signés Riyane. */
export const paintings: Painting[] = [
  {
    src: "/images/oeuvres/01.jpg",
    alt: "Un garçon en costume rayé, les yeux cernés de violet, serre une tirelire cochon ; autour de lui flottent des billets et des portraits en médaillon",
  },
  {
    src: "/images/oeuvres/02.jpg",
    alt: "Un homme en costume noir, le visage peint en orange et vert, sourit devant un fond de billets qui tourbillonnent",
  },
  {
    src: "/images/oeuvres/03.jpg",
    alt: "Une femme à la peau rose, de profil, les bras tendus, prise dans un long ruban et une spirale bleue et jaune, sur fond noir",
  },
  {
    src: "/images/oeuvres/04.jpg",
    alt: "Un enfant en costume crème, cigare aux lèvres et liasses de billets dans les poches, seul dans une aire de jeux déserte",
  },
  {
    src: "/images/oeuvres/05.jpg",
    alt: "Une vieille dame en manteau de fourrure et colliers de perles, fume-cigarette à la main, devant des billets et le portrait d'une jeune femme",
  },
  {
    src: "/images/oeuvres/06.jpg",
    alt: "Un homme à la peau rouge et bleue, lunettes noires et chaînes en or, brandit une liasse de billets devant un mur de billets",
  },
  {
    src: "/images/oeuvres/07.jpg",
    alt: "Quatre figures dansantes sur papier crème, coiffées de billets et de formes colorées, parmi des lettres et des symboles",
  },
  {
    src: "/images/oeuvres/08.jpg",
    alt: "Une mosaïque de visages et de masques de toutes les couleurs, mêlée de lettres, de chiffres et de signes dollar",
  },
  {
    src: "/images/oeuvres/09.jpg",
    alt: "Un personnage à la peau rouge et aux yeux verts, coiffé d'un grand nœud rose, deux mains tachetées, grise et jaune, au bout de ses tresses ; un autre visage le regarde par-dessus",
    portrait: true,
  },
  {
    src: "/images/oeuvres/10.jpg",
    alt: "Une créature bleue et verte aux longs tentacules enroulés en spirales, sur un fond rose pâle",
    portrait: true,
  },
  {
    src: "/images/oeuvres/11.jpg",
    alt: "De longues formes rouges, comme des flammes à cornes, s'élèvent d'une nébuleuse violette, orange et rose",
    portrait: true,
  },
  {
    src: "/images/oeuvres/12.jpg",
    alt: "Deux grandes fleurs aux pétales épais, l'une brune et rouge, l'autre verte et violette, traversées d'un trait noir, sur fond beige",
  },
  {
    src: "/images/oeuvres/13.jpg",
    alt: "Deux danseuses à la peau rouge près d'un grand vase bleu doté d'yeux et de lèvres rouges, entre des vases fleuris",
  },
  {
    src: "/images/oeuvres/14.jpg",
    alt: "Des volutes vertes, violettes et brunes s'enroulent au-dessus d'un disque orné d'une étoile",
  },
  {
    src: "/images/oeuvres/15.jpg",
    alt: "Une abstraction aux touches vives et emmêlées, verts, bleus et orangés",
  },
  {
    src: "/images/oeuvres/16.jpg",
    alt: "Une foule de visages serrés, aux teints orangés, roses et bleus, autour d'un visage rouge au centre",
  },
  {
    src: "/images/oeuvres/17.jpg",
    alt: "Une figure allongée parmi des fruits et des fleurs, sur fond sombre semé de formes dorées en amande",
  },
  {
    src: "/images/oeuvres/18.jpg",
    alt: "Trois femmes enlacées au milieu de formes et de créatures colorées qui flottent sur un fond brun",
  },
  {
    src: "/images/oeuvres/19.jpg",
    alt: "Un couple de touristes en lunettes noires, cocktails à la main, sur une plage ; derrière eux, des serveurs et des enfants",
  },
]
