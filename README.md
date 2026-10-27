# RMBLOG

Blog personnel, **mi-rétro** (page perso PHP de 2003 : liens bleus soulignés, fenêtre Windows 98, URL `index.php?id=`) et **mi-futuriste** (Next.js 16, bandeau 3D, art ASCII plein écran, pied de page tramé). La mise en page rend hommage au site « Free Game » de Virgil Abloh.

Pour l'instant **tout est front** : les articles sont dans `lib/posts.ts`.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production
npm run lint
```

## Pile technique

- **Next.js 16** (App Router, Cache Components, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4** (configuration dans `app/globals.css`)
- Structure **shadcn/ui** : `components.json`, alias `@/components/ui`, `@/lib/utils` (`cn`)
- Polices via `next/font` : Cormorant Garamond (le titre « Carnet libre », les onglets, les cartels), Archivo (logo), Permanent Marker (pinceau des articles), Playfair Display (italiques), Courier Prime ; Geist et Geist Mono auto-hébergées (`public/fonts`) pour le tableau de bord
- **three.js** + `@react-three/fiber` + `@react-three/drei` pour la galerie 3D (chargés seulement à l'approche de la section)

## Où modifier quoi

| Fichier | Rôle |
| --- | --- |
| `lib/projects.ts` | Les projets lancés qui défilent dans le bandeau 3D (nom, vignette 16:9, futur lien vers leur histoire) |
| `lib/site.ts` | Nom, texte d'intro, titre du carnet et sa ligne de garde, les cinq onglets du menu (et les sections qui les allument), réseaux, profil SoundCloud, e-mail, URL du site (RSS, sitemap) |
| `lib/works.ts` | Mes tableaux : description et format (horizontal ou vertical) ; les fichiers vont dans `public/images/oeuvres/01.jpg`, `02.jpg`… (tant qu'un fichier manque, le tableau n'apparaît pas) |
| `lib/posts.ts` | Les articles (blocs : paragraphe, intertitre, citation, liste, image, vidéo YouTube). `[texte](/lien)` et `**gras**` sont reconnus |
| `lib/portfolio.ts` | Le portefeuille de 50 000 000 $ : la base, sa répartition (dollar, euro, SPY, QQQ, BTC, ETH, SOL) et les exemples de la démo (paiements, objectifs, flux) |
| `lib/live-quotes.ts` | Les connecteurs de cours (Binance, Finnhub) : reconnexion automatique, un cours par seconde |
| `lib/dream.ts` | Les images de la galerie « Mon rêve, sûrement fabriqué par les autres » |
| `lib/aspirations.ts` | Mes aspirations préférées : nom, rôle, dates, crédit de la photo ; photos dans `public/images/aspirations/<slug>.jpg` (sans crédit, un cadre « photo à venir ») |
| `lib/games.ts` | Mes jeux vidéo préférés : titre, année, studio, couleur d'accent ; pochettes dans `public/images/jeux/<slug>.jpg` |
| `public/images/` | Couvertures d'articles, vignettes des projets (`projects/`), images des effets ASCII (`franklin.jpg`, `portrait.jpg`), paysages de la galerie (`reve/`) |
| `app/globals.css` | Couleurs (bleu des liens, rouge, gris Windows), utilitaires rétro, animations |

## Pages

- `/` : en-tête collant (intro en Courier, logo qui tourne, les cinq onglets du carnet sur la tranche droite, qui se replient en tranche au bord de l'écran quand on descend), le titre « Carnet libre » au-dessus du bandeau 3D, un portrait en plein écran, « All about the Benjamins » en plein écran, la Kaaba en plein écran, le portefeuille de 50 000 000 $ au cours en direct, la galerie 3D « Mon rêve, sûrement fabriqué par les autres », « Mes jeux vidéo préférés » (la pochette choisie teinte le fond, la sélection défile seule), « Mes aspirations préférées » (les noms en grand, le portrait suit la souris), puis « Mes œuvres » (les tableaux sur une cimaise qui défile, en grand au clic, et le lecteur SoundCloud)
- `/articles/[slug]` : article avec chiffre au pinceau collant, métadonnées en Courier, boîte de dialogue « fin de l'article »
- `/index.php?id=4`, `/index.php?page=kaaba` : les vieilles adresses redirigent vraiment
- `/feed.xml` (RSS), `/sitemap.xml`, `/robots.txt`, et une 404 déguisée en erreur Apache

## Composants intégrés (`components/ui`)

| Composant | Utilisé dans |
| --- | --- |
| `tilted-grid-hero.tsx` : rangée d'images sur un cylindre 3D | bandeau d'accueil des projets (`components/blog/hero.tsx`) |
| `wild-hunt-footer.tsx` : pied de page tramé, gothique en cellules | pied de page (`components/blog/site-footer.tsx`) |
| `ascii-effect.tsx` : effet ASCII « All about the Benjamins », réimplémenté en Canvas2D (25 modes de rendu, réglages couleur, flous, post-effets, lumières, masque, animations) | sections plein écran `#portrait` et `#benjamins` (Franklin), sous le bandeau |
| `kaaba.tsx` : vidéo ASCII « kaaba » de 21st.dev | section plein écran `#kaaba` |
| `finance-bento.tsx` : tableau de bord de vasnev.art (patrimoine, répartition, crypto, actions…) | section `#portefeuille` (`components/blog/live-portfolio.tsx`) |
| `3d-gallery-photography.tsx` : galerie 3D infinie (three.js) | section plein écran `#reve`, avant le pied de page (`components/blog/dream-gallery.tsx`) |

Les composants sont copiés dans `components/ui` parce que c'est le dossier de la convention shadcn : la CLI (`npx shadcn add …`) y dépose ses composants et l'alias `@/components/ui` de `components.json` pointe dessus. Tout ce qui est propre au blog vit à côté, dans `components/blog`.

`AsciiEffect` accepte n'importe quelle photo de même origine et des réglages partiels fusionnés avec la recette Benjamins :

```tsx
<AsciiEffect src="/images/franklin.jpg" alt="…" className="aspect-[4/3] w-full" />
<AsciiEffect src="/photo.jpg" alt="…" params={{ renderMode: "matrix", pfx: { chromatic: { enabled: false, intensity: 0 } } }} />
```

Retouches apportées aux deux derniers, le reste est d'origine :

- `finance-bento.tsx` : montants en millions (`$50.0M`), compteur à points assez large pour huit chiffres et plus (il rétrécit sur mobile), autonomie affichée en années au-delà de deux ans, variation crypto calculée au lieu d'être écrite en dur, et une entrée `live` qui redessine les cartes chaque seconde sans rejouer leur apparition.
- `3d-gallery-photography.tsx` : elle écoute sa propre toile (la page en compte plusieurs), transmet enfin `speed` et `visibleCount`, s'arrête hors de l'écran, et `followPageScroll` la fait avancer avec le défilement de la page au lieu de capturer la molette (sinon on resterait coincé sur la section).

## Le portefeuille en direct

À l'ouverture de la page, le compteur vaut **50 000 000 $** : chaque ligne achète sa part au premier cours reçu, puis vaut quantité × cours, recalculé chaque seconde. Recharger la page repose la base.

| Connecteur | Cours | Clé |
| --- | --- | --- |
| Binance (`data-stream.binance.vision`, données de marché publiques) | BTC, ETH, SOL et euro/dollar, un ticker par seconde, cotés en USDT | aucune |
| Finnhub (`ws.finnhub.io`) | actions SPY et QQQ : dernier cours au chargement, puis chaque transaction pendant la séance de Wall Street (15 h 30 – 22 h à Paris) | gratuite |

Pour brancher les actions : créer une clé sur [finnhub.io](https://finnhub.io/register), l'ajouter dans Vercel (Settings → Environment Variables) sous le nom `NEXT_PUBLIC_FINNHUB_TOKEN`, puis redéployer. La clé est lue par le navigateur, donc visible : c'est le fonctionnement prévu par Finnhub pour sa WebSocket, mais ne mettez pas une clé payante. Sans clé, les actions restent à leur valeur de départ et la barre d'état le dit.

## À brancher plus tard (back)

- Articles : un CMS ou des fichiers MDX peuvent remplacer `lib/posts.ts` sans toucher aux pages

Crédits des images : `public/images/CREDITS.md`.
