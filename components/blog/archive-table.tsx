import Link from "next/link"
import { formatShort, pad } from "@/lib/format"
import { readingTime, type Post } from "@/lib/posts"

/** Les archives, rendues comme le résultat d'une requête MySQL sur une page PHP. */
export function ArchiveTable({ posts }: { posts: Post[] }) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-[14px] leading-snug">
        mysql&gt; SELECT id, titre, rubrique, date FROM articles ORDER BY date DESC;
        <br />
        {posts.length} lignes trouvées.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="bevel-in w-full min-w-[620px] border-separate border-spacing-[2px] bg-white font-serif text-[17px]">
          <caption className="sr-only">Tous les articles, du plus récent au plus ancien</caption>
          <thead>
            <tr className="bg-win-face text-left font-sans text-[14px]">
              {["N°", "Titre", "Rubrique", "Date", "Lecture"].map((h) => (
                <th key={h} scope="col" className="bevel-out px-2 py-1 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => (
              <tr key={post.slug} className={i % 2 ? "bg-[#eeeeee]" : "bg-white"}>
                <td className="border border-[#9a9a9a] px-2 py-1 font-mono text-[14px]">{pad(post.id)}</td>
                <td className="border border-[#9a9a9a] px-2 py-1">
                  <Link href={`/articles/${post.slug}`} className="retro-link visited-purple">
                    {post.title}
                  </Link>
                  {post.updated ? <span className="ml-2 font-mono text-[12px] text-retro-red">[mis à jour]</span> : null}
                </td>
                <td className="border border-[#9a9a9a] px-2 py-1">{post.category}</td>
                <td className="border border-[#9a9a9a] px-2 py-1 font-mono text-[14px]">{formatShort(post.date)}</td>
                <td className="border border-[#9a9a9a] px-2 py-1 font-mono text-[14px]">{readingTime(post)} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
