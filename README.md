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
- Polices via `next/font` : Archivo (logo), Permanent Marker (pinceau), Playfair Display (italiques), Courier Prime

## Où modifier quoi

| Fichier | Rôle |
| --- | --- |
| `lib/projects.ts` | Les projets lancés qui défilent dans le bandeau 3D (nom, vignette 16:9, futur lien vers leur histoire) |
| `lib/site.ts` | Nom, texte d'intro, titre au pinceau, sommaire « De A à Z » (vide pour l'instant), réseaux, e-mail, URL du site (RSS, sitemap) |
| `lib/posts.ts` | Les articles (blocs : paragraphe, intertitre, citation, liste, image, vidéo YouTube). `[texte](/lien)` et `**gras**` sont reconnus |
| `public/images/` | Couvertures d'articles, vignettes des projets (`projects/`), images des effets ASCII (`franklin.jpg`, `portrait.jpg`) |
| `app/globals.css` | Couleurs (bleu des liens, rouge, gris Windows), utilitaires rétro, animations |

## Pages

- `/` : en-tête collant (intro en Courier, logo qui tourne, sommaire « De A à Z »), bandeau 3D, un portrait en plein écran, « All about the Benjamins » en plein écran (même effet), la Kaaba en plein écran
- `/articles/[slug]` : article avec chiffre au pinceau collant, métadonnées en Courier, boîte de dialogue « fin de l'article »
- `/index.php?id=4`, `/index.php?page=kaaba` : les vieilles adresses redirigent vraiment
- `/feed.xml` (RSS), `/sitemap.xml`, `/robots.txt`, et une 404 déguisée en erreur Apache

## Composants intégrés (`components/ui`)

| Composant | Utilisé dans |
| --- | --- |
| `tilted-grid-hero.tsx` : rangée d'images sur un cylindre 3D | bandeau d'accueil des projets (`components/blog/hero.tsx`) |
| `wild-hunt-footer.tsx` : pied de page tramé, gothique en cellules | pied de page (`components/blog/site-footer.tsx`) |
| `ascii-effect.tsx` : effet ASCII « All about the Benjamins », réimplémenté en Canvas2D (25 modes de rendu, réglages couleur, flous, post-effets, lumières, masque, animations) | sections plein écran `#portrait` et `#benjamins` (Franklin), sous le bandeau |
| `kaaba.tsx` : vidéo ASCII « kaaba » de 21st.dev | section plein écran `#kaaba`, avant le pied de page |

Les composants sont copiés dans `components/ui` parce que c'est le dossier de la convention shadcn : la CLI (`npx shadcn add …`) y dépose ses composants et l'alias `@/components/ui` de `components.json` pointe dessus. Tout ce qui est propre au blog vit à côté, dans `components/blog`.

`AsciiEffect` accepte n'importe quelle photo de même origine et des réglages partiels fusionnés avec la recette Benjamins :

```tsx
<AsciiEffect src="/images/franklin.jpg" alt="…" className="aspect-[4/3] w-full" />
<AsciiEffect src="/photo.jpg" alt="…" params={{ renderMode: "matrix", tint: "#00ff66" }} />
```

## À brancher plus tard (back)

- Articles : un CMS ou des fichiers MDX peuvent remplacer `lib/posts.ts` sans toucher aux pages

Crédits des images : `public/images/CREDITS.md`.
