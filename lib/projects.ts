/**
 * Les projets lancés, qui défilent dans le bandeau 3D de l'accueil.
 * Chaque image est une vignette 16:9 dans public/images/projects.
 *
 * Plus tard : `href` mènera à la page qui raconte l'histoire du projet.
 */
export type Project = {
  name: string
  image: string
  alt: string
  href?: string
}

export const projects: Project[] = [
  {
    name: "Dune",
    image: "/images/projects/dune.jpg",
    alt: "Dune : le logo sur des dunes orange, couverture du pitch deck",
  },
  {
    // Nom à confirmer : c'est le texte imprimé sur la carte.
    name: "Founding Member",
    image: "/images/projects/founding-member.jpg",
    alt: "Une carte noire texturée marquée « Founding Member », signée A.L",
  },
  {
    name: "Tanse",
    image: "/images/projects/tanse.png",
    alt: "Le logo de Tanse : un T en carrés crème et vert sur fond noir",
  },
  {
    // Nom à compléter.
    name: "Chevrons",
    image: "/images/projects/chevrons.png",
    alt: "Un logo de trois chevrons turquoise pointant vers le haut",
  },
]
