import Link from "next/link"
import { RequestedUrl } from "@/components/blog/requested-url"

/** La page 404, déguisée en erreur Apache de 2003. */
export default function NotFound() {
  return (
    <div className="px-4 py-16 font-serif text-[18px] text-black md:px-8">
      <h1 className="text-[2rem] font-bold">Not Found</h1>
      <p className="mt-4">
        The requested URL <RequestedUrl /> was not found on this server.
      </p>
      <p className="mt-4">
        Traduction : cette page n&apos;existe pas, ou plus. Retour à l&apos;
        <Link href="/" className="retro-link">
          index.php
        </Link>{" "}
        ou au{" "}
        <Link href="/#sommaire" className="retro-link">
          sommaire
        </Link>
        .
      </p>
      <hr className="mt-6 border-black" />
      <address className="mt-2 italic">RMBLOG/2026 (Next.js) Server at rmblog Port 443</address>
    </div>
  )
}
