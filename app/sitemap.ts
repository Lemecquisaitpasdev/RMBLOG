import type { MetadataRoute } from "next"
import { getPosts, lastUpdate } from "@/lib/posts"
import { books } from "@/lib/books"
import { site } from "@/lib/site"
import { thoughts } from "@/lib/thoughts"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: lastUpdate() },
    { url: `${site.url}/carnet-de-pensees`, lastModified: thoughts.map((t) => t.date).sort().at(-1) },
    { url: `${site.url}/livres` },
    ...books.map((book) => ({ url: `${site.url}/livres/${book.slug}` })),
    ...getPosts().map((post) => ({
      url: `${site.url}/articles/${post.slug}`,
      lastModified: post.updated ?? post.date,
    })),
  ]
}
