/**
 * Les articles du blog. Pour l'instant tout vit ici, en dur : c'est le front
 * d'abord. Le jour où un CMS ou une base arrive, seules ces fonctions changent.
 *
 * Dans les textes, `[libellé](/lien)` devient un lien et `**gras**` du gras.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "video"; youtubeId: string; title: string; caption?: string }

export type Post = {
  /** Numéro fixe : sert au sommaire, aux gros chiffres et à index.php?id= */
  id: number
  slug: string
  title: string
  /** Libellé court pour le sommaire « De A à Z ». */
  tocLabel: string
  /** Sous-titre en italique. */
  dek: string
  /** Paragraphe en gras affiché sur l'accueil. */
  excerpt: string
  /** Petit texte en Courier à droite du média, sur l'accueil. */
  note: string
  /** Dates au format AAAA-MM-JJ. */
  date: string
  updated?: string
  category: string
  tags: string[]
  cover: { src: string; alt: string }
  /** Si présent, l'accueil affiche la vidéo au lieu de l'image. */
  video?: { youtubeId: string; title: string }
  body: Block[]
}

const posts: Post[] = [
  {
    id: 1,
    slug: "pourquoi-ce-carnet",
    title: "Pourquoi ouvrir un carnet",
    tocLabel: "Pourquoi ce carnet",
    dek: "Un manifeste court pour un blog qui préfère les brouillons aux vitrines.",
    excerpt:
      "Écrire en public a longtemps été pour moi la partie la plus intimidante du travail. Ce carnet est ma façon de contourner la peur : publier tôt, publier petit, et considérer chaque article comme une version 0.1. Si une idée est cassée, on la répare. Si elle tient, on la creuse.",
    note: "Le point de départ. Pourquoi un blog en 2026, pourquoi sans réseau social au milieu, et pourquoi il ressemble à une page perso de 2003.",
    date: "2026-03-02",
    category: "Manifeste",
    tags: ["écriture", "blog", "méthode"],
    cover: { src: "/images/covers/24.jpg", alt: "Un livre ouvert posé sur une table en bois" },
    body: [
      {
        type: "p",
        text: "Pendant des années, j'ai rempli des carnets papier que personne n'a jamais lus. Ils m'ont appris une chose : une idée notée est une idée qu'on peut reprendre. Une idée gardée en tête finit par s'user, ou par disparaître.",
      },
      {
        type: "p",
        text: "Ce blog est la version publique de ces carnets. Il n'a pas vocation à être parfait, ni même terminé. Les articles sont datés, parfois corrigés, parfois contredits par des articles plus récents. C'est voulu.",
      },
      { type: "h2", text: "Trois règles" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Publier tôt** : un brouillon honnête vaut mieux qu'un article parfait jamais publié.",
          "**Publier petit** : une idée par article, pas un traité.",
          "**Garder les traces** : on ne supprime pas, on annote.",
        ],
      },
      {
        type: "quote",
        text: "Le brouillon n'est pas l'étape avant le travail. C'est le travail.",
        cite: "Note du 2 mars",
      },
      { type: "h2", text: "Pourquoi ce look" },
      {
        type: "p",
        text: "Parce que le web que j'ai aimé ressemblait à ça : des liens bleus soulignés, des fenêtres qui s'ouvrent dans tous les sens, un compteur de visites et un livre d'or. Des pages bricolées en PHP, hébergées chez un ami. Ce site rend hommage à cette époque, avec les outils d'aujourd'hui.",
      },
      {
        type: "p",
        text: "Si vous lisez ceci, bienvenue. Le [sommaire](/#sommaire) est en haut à droite, les [archives](/#archives) plus bas, et le [livre d'or](/#livre-dor) attend votre premier message.",
      },
    ],
  },
  {
    id: 2,
    slug: "nommer-les-choses",
    title: "Comment nommer un projet",
    tocLabel: "Nommer un projet",
    dek: "Le nom est le premier outil d'un projet : un point de référence auquel on revient sans cesse.",
    excerpt:
      "Un nom n'est pas une étiquette qu'on colle à la fin : c'est la première décision, celle qui oriente toutes les autres. Voici la méthode que j'utilise pour trouver, tester et parfois abandonner un nom. En changer n'est jamais un échec, juste une meilleure version.",
    note: "Méthode en quatre étapes, avec la liste des questions à se poser avant d'acheter un nom de domaine.",
    date: "2026-04-14",
    category: "Méthode",
    tags: ["nommer", "identité", "méthode"],
    cover: { src: "/images/covers/119.jpg", alt: "Un livre intitulé Symbol posé sur un bureau blanc" },
    body: [
      {
        type: "p",
        text: "Chaque projet que j'ai mené a commencé par un mauvais nom. Le bon est arrivé plus tard, souvent au moment où j'avais enfin compris ce que je faisais. C'est normal : un nom résume une intention, et l'intention se précise en travaillant.",
      },
      { type: "h2", text: "Ma méthode en quatre étapes" },
      {
        type: "list",
        ordered: true,
        items: [
          "Écrire en une phrase pourquoi le projet existe.",
          "Lister trente mots qui gravitent autour de cette phrase, sans filtre.",
          "Croiser les mots deux à deux, à voix haute, pendant une semaine.",
          "Garder trois finalistes et les tester dans une vraie phrase : « Je travaille sur ___. »",
        ],
      },
      {
        type: "quote",
        text: "Un bon nom, c'est un nom qu'on peut expliquer en une phrase et répéter sans gêne.",
      },
      { type: "h2", text: "Les questions à se poser" },
      {
        type: "list",
        items: [
          "Est-ce que je peux l'épeler au téléphone sans l'écrire ?",
          "Est-ce qu'il vieillira bien si le projet change de forme ?",
          "Est-ce qu'il est déjà pris (nom de domaine, réseaux, marque déposée) ?",
          "Est-ce qu'il me donne envie de raconter l'histoire derrière ?",
        ],
      },
      {
        type: "p",
        text: "Et si au bout de six mois le nom ne colle plus, on en change. Les idées neuves arrivent tout le temps ; s'accrocher à une ancienne par fierté coûte plus cher qu'un nouveau logo.",
      },
    ],
  },
  {
    id: 3,
    slug: "apprendre-en-public",
    title: "Apprendre en public",
    tocLabel: "Apprendre en public",
    dek: "Partager ce qu'on apprend pendant qu'on l'apprend, et pas une fois devenu expert.",
    excerpt:
      "Attendre d'être expert pour partager, c'est attendre pour toujours. Apprendre en public, c'est documenter le chemin pendant qu'on le parcourt : les erreurs, les sources, les petites victoires. C'est aussi la meilleure façon de rencontrer celles et ceux qui se posent les mêmes questions.",
    note: "Comment je documente ce que j'apprends : un fichier par sujet, une ligne par jour, un article par mois.",
    date: "2026-05-21",
    category: "Méthode",
    tags: ["apprendre", "notes", "partage"],
    cover: { src: "/images/covers/180.jpg", alt: "Un ordinateur portable ouvert à côté d'un carnet de notes" },
    body: [
      {
        type: "p",
        text: "L'idée n'est pas de moi, et c'est tant mieux : apprendre en public, c'est d'abord reconnaître qu'on apprend des autres. Chaque article de ce carnet cite ses sources, et chaque source mène à quelqu'un qui a pris le temps d'expliquer.",
      },
      { type: "h2", text: "Le système" },
      {
        type: "list",
        items: [
          "Un fichier texte par sujet, nommé simplement : « typographie.txt », « php.txt », « photo.txt ».",
          "Une ligne par jour minimum, datée, même si c'est « rien compris aujourd'hui ».",
          "Un article par mois, qui reprend le meilleur des notes.",
        ],
      },
      {
        type: "p",
        text: "Ce système tient sur une clé USB. Il ne dépend d'aucune application, d'aucun abonnement, d'aucun réseau social. Si ce site disparaissait demain, les fichiers resteraient.",
      },
      {
        type: "quote",
        text: "Le meilleur moment pour partager une leçon, c'est juste après l'avoir apprise : on se souvient encore de ce qui était difficile.",
      },
      { type: "h2", text: "Ce que ça change" },
      {
        type: "p",
        text: "Écrire pour quelqu'un d'autre oblige à comprendre pour de vrai. Les trous dans le raisonnement deviennent visibles. Et de temps en temps, un message arrive dans le [livre d'or](/#livre-dor) pour corriger une erreur : c'est le plus beau compliment qu'on puisse faire à un brouillon.",
      },
    ],
  },
  {
    id: 4,
    slug: "le-web-de-2003",
    title: "Ce que le web de 2003 savait déjà",
    tocLabel: "Le web de 2003",
    dek: "Livres d'or, compteurs de visites et webrings : petite archéologie des pages perso.",
    excerpt:
      "Avant les plateformes, il y avait les pages perso : du HTML écrit à la main, un peu de PHP pour le livre d'or, un compteur de visites qui tournait comme un odomètre. Tout était lent, moche et merveilleusement libre. Ce que ces pages savaient déjà mérite qu'on s'en souvienne.",
    note: "Pourquoi ce site a un livre d'or, un compteur et des fenêtres façon Windows 98. Par nostalgie, mais pas seulement.",
    date: "2026-06-30",
    updated: "2026-10-12",
    category: "Web",
    tags: ["php", "web", "nostalgie"],
    cover: { src: "/images/covers/403.jpg", alt: "Le clavier d'une machine à écrire ancienne" },
    body: [
      {
        type: "p",
        text: "En 2003, publier sur le web voulait dire louer un petit hébergement, ouvrir un client FTP et y glisser des fichiers. La page d'accueil s'appelait index.php, les articles avaient une adresse en ?id=3, et la mise en page tenait dans un tableau HTML aux bordures grises.",
      },
      { type: "h2", text: "Ce qu'on a perdu" },
      {
        type: "list",
        items: [
          "**La propriété** : votre page vous appartenait, fichier par fichier.",
          "**La bizarrerie** : chaque site avait sa propre logique, ses couleurs, ses fautes de goût.",
          "**Le voisinage** : les webrings reliaient des sites qui se ressemblaient, sans algorithme pour décider à votre place.",
        ],
      },
      { type: "quote", text: "Le web n'était pas plus beau. Il était plus personnel." },
      { type: "h2", text: "Ce que ce site reprend" },
      {
        type: "p",
        text: "Le [livre d'or](/#livre-dor), le compteur de visites, les liens bleus soulignés et les [archives en tableau](/#archives) sont des clins d'œil. Mais l'adresse [index.php?id=4](/index.php?id=4) fonctionne vraiment : elle vous ramène ici. Petit hommage aux URL d'antan, servi par Next.js.",
      },
      {
        type: "p",
        text: "Tout le reste est moderne : les images sont optimisées, les pages sont générées à l'avance, et le bandeau d'accueil tourne en 3D directement dans votre navigateur. Mi-rétro, mi-futuriste.",
      },
    ],
  },
  {
    id: 5,
    slug: "outils-2026",
    title: "Mes outils, édition 2026",
    tocLabel: "Mes outils (2026)",
    dek: "La liste honnête de ce que j'utilise pour écrire, coder et archiver, et de ce que j'ai abandonné.",
    excerpt:
      "Chaque année, je fais l'inventaire de mes outils. Pas pour comparer les applications, mais pour vérifier que chacune mérite sa place. Cette année, la liste a raccourci : un éditeur de texte, un appareil photo, un carnet papier, et ce site.",
    note: "Inventaire annuel : écrire, coder, photographier, archiver. Mis à jour chaque été.",
    date: "2026-08-18",
    category: "Outils",
    tags: ["outils", "setup", "code"],
    cover: { src: "/images/covers/26.jpg", alt: "Des objets du quotidien rangés à plat : portefeuille, montre, casque" },
    body: [
      { type: "h2", text: "Pour écrire" },
      {
        type: "list",
        items: [
          "Un éditeur de texte brut, sans synchronisation magique.",
          "Un carnet papier A5, toujours le même modèle.",
          "Un dictionnaire des synonymes, ouvert en permanence.",
        ],
      },
      { type: "h2", text: "Pour coder" },
      {
        type: "list",
        items: [
          "Next.js, React et Tailwind CSS pour ce site.",
          "Des composants shadcn/ui, copiés dans le projet plutôt qu'installés comme une boîte noire.",
          "Git, parce que tout ce qui n'est pas versionné finit par disparaître.",
        ],
      },
      { type: "h2", text: "Pour archiver" },
      {
        type: "p",
        text: "Un disque dur externe, une copie en ligne, et une règle : chaque fichier a une date dans son nom. Ce n'est pas glamour, mais ça fonctionne depuis dix ans.",
      },
      { type: "quote", text: "Le meilleur outil est celui qu'on a déjà sous la main et qu'on sait réparer." },
      {
        type: "p",
        text: "Ce que j'ai abandonné cette année : deux applications de notes, un gestionnaire de tâches, et l'idée de trouver un jour le système parfait.",
      },
    ],
  },
  {
    id: 6,
    slug: "archiver-plutot-que-publier",
    title: "Archiver plutôt que publier",
    tocLabel: "Archiver, pas publier",
    dek: "Et si le but d'un blog n'était pas d'être lu aujourd'hui, mais retrouvé dans dix ans ?",
    excerpt:
      "On publie pour être vu. On archive pour être retrouvé. Ce carnet essaie de faire la seconde chose : ranger, dater, relier, pour que chaque idée reste accessible longtemps après avoir quitté le fil d'actualité.",
    note: "Un essai sur la différence entre flux et archive, et pourquoi ce site range ses articles dans un tableau.",
    date: "2026-09-27",
    category: "Essai",
    tags: ["archive", "mémoire", "web"],
    cover: { src: "/images/covers/36.jpg", alt: "Un appareil démonté, ses pièces rangées sur une table blanche" },
    body: [
      {
        type: "p",
        text: "Un réseau social est un flux : ce qui y entre glisse vers le bas et disparaît. Une archive est l'inverse : ce qui y entre reste à sa place, avec une date, un numéro et une adresse stable.",
      },
      { type: "h2", text: "Démonter pour comprendre" },
      {
        type: "p",
        text: "La photo en tête de cet article montre un appareil démonté pièce par pièce, rangé sur une table. C'est exactement ce que je veux faire avec mes idées : les étaler, les étiqueter, voir comment elles s'assemblent.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Chaque article a un numéro, qui ne change jamais.",
          "Chaque article garde sa date de publication et sa date de mise à jour.",
          "Rien n'est supprimé : une idée dépassée reçoit une note qui renvoie vers la nouvelle.",
        ],
      },
      { type: "quote", text: "Une archive est une promesse faite à la personne que vous serez dans dix ans." },
      {
        type: "p",
        text: "Les [archives](/#archives) de ce site sont présentées comme le résultat d'une vieille requête SQL : un tableau, des colonnes, des liens bleus. C'est austère, et c'est voulu.",
      },
    ],
  },
  {
    id: 7,
    slug: "mentors-a-distance",
    title: "Mentors à distance",
    tocLabel: "Mentors à distance",
    dek: "Les vidéos et les textes qui m'ont appris des millions de choses, sans que leurs auteurs le sachent.",
    excerpt:
      "Je n'ai pas eu de mentor au sens classique. J'ai eu des vidéos regardées dix fois, des livres annotés jusqu'à la dernière page, des conférences écoutées en boucle. Voici les premières de la liste, avec ce que chacune m'a appris.",
    note: "Mentor à distance n°1 : un discours de quinze minutes, vu pour la première fois à deux heures du matin. Il m'a appris à relier les points après coup.",
    date: "2026-10-20",
    category: "Influences",
    tags: ["mentors", "vidéo", "influences"],
    cover: { src: "/images/covers/250.jpg", alt: "Un appareil photo argentique posé sur un piano" },
    video: { youtubeId: "UF8uR6Z6KLc", title: "Steve Jobs' 2005 Stanford Commencement Address" },
    body: [
      {
        type: "p",
        text: "On parle souvent du mentorat comme d'une relation : quelqu'un vous prend sous son aile. Mais pour beaucoup de gens, surtout quand on arrive par la marge, le premier mentor est un inconnu sur un écran.",
      },
      {
        type: "video",
        youtubeId: "UF8uR6Z6KLc",
        title: "Steve Jobs' 2005 Stanford Commencement Address",
        caption: "Stanford, 2005. Quinze minutes, trois histoires.",
      },
      { type: "h2", text: "Ce que j'en ai retenu" },
      {
        type: "list",
        items: [
          "On ne relie les points qu'en regardant en arrière.",
          "Perdre quelque chose peut libérer de la place pour autre chose.",
          "Le temps est compté : autant le passer sur ce qui compte vraiment.",
        ],
      },
      { type: "quote", text: "Un mentor à distance ne vous connaît pas. Mais il vous a laissé ses notes." },
      {
        type: "p",
        text: "Cette liste va grandir. Si une vidéo ou un texte vous a servi de mentor, laissez-le dans le [livre d'or](/#livre-dor) : je l'ajouterai ici, avec votre nom.",
      },
    ],
  },
]

/** Les articles dans l'ordre du sommaire (n° 1, 2, 3…). */
export function getPosts() {
  return posts
}

/** Les articles du plus récent au plus ancien, pour les archives. */
export function getPostsByDate() {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug)
}

export function getPostById(id: number) {
  return posts.find((p) => p.id === id)
}

/** Article précédent et suivant dans l'ordre du sommaire. */
export function getNeighbours(slug: string) {
  const i = posts.findIndex((p) => p.slug === slug)
  return { prev: i > 0 ? posts[i - 1] : undefined, next: i >= 0 && i < posts.length - 1 ? posts[i + 1] : undefined }
}

export function readingTime(post: Post) {
  const text = [post.excerpt, ...post.body.map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : ""))].join(" ")
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

/** Date la plus récente du carnet (publication ou mise à jour). */
export function lastUpdate() {
  return posts.map((p) => p.updated ?? p.date).sort().at(-1) ?? ""
}
