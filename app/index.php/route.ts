import { NextResponse, type NextRequest } from "next/server"
import { getPostById } from "@/lib/posts"

const PAGES: Record<string, string> = {
  sommaire: "/#sommaire",
  benjamins: "/#benjamins",
  portrait: "/#portrait",
  kaaba: "/#kaaba",
  portefeuille: "/#portefeuille",
  reve: "/#reve",
  jeux: "/#jeux",
}

/**
 * Les vieilles adresses marchent vraiment : /index.php?id=4 mène à l'article
 * n° 4, /index.php?page=sommaire au sommaire. Hommage aux URL des années 2000.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const post = getPostById(Number(params.get("id")))
  const target = post ? `/articles/${post.slug}` : (PAGES[params.get("page") ?? ""] ?? "/")
  return NextResponse.redirect(new URL(target, request.url), 308)
}
