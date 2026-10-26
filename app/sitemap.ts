import type { MetadataRoute } from "next"
import { getPosts, lastUpdate } from "@/lib/posts"
import { site } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: lastUpdate() },
    ...getPosts().map((post) => ({
      url: `${site.url}/articles/${post.slug}`,
      lastModified: post.updated ?? post.date,
    })),
  ]
}
