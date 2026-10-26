"use client"

import * as React from "react"
import { useLocal, writeLocal } from "@/lib/local-store"
import { formatShort } from "@/lib/format"

type Entry = { id: string; name: string; site?: string; message: string; at: string }

const KEY = "rmblog:livre-dor"

/** Le premier message, signé par l'auteur du carnet. */
const FIRST: Entry & { date: string } = {
  id: "premier",
  name: "RM (auteur du carnet)",
  message: "Premier message pour inaugurer le livre d'or. À vous de jouer : un mot, une correction, une vidéo qui vous a servi de mentor.",
  at: "",
  date: "2026-03-02",
}

function parse(raw: string | null | undefined): Entry[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/** N'accepte que des liens http(s), pour ne jamais rendre un « javascript: ». */
function safeUrl(value: string) {
  if (!value.trim()) return undefined
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`)
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined
  } catch {
    return undefined
  }
}

function stamp(iso: string) {
  const d = new Date(iso)
  const two = (n: number) => String(n).padStart(2, "0")
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()} à ${two(d.getHours())}h${two(d.getMinutes())}`
}

/**
 * Le livre d'or. En attendant un back, les messages restent dans le
 * navigateur de la personne qui les écrit.
 */
export function Guestbook() {
  const raw = useLocal(KEY)
  const entries = React.useMemo(() => parse(raw), [raw])
  const [error, setError] = React.useState("")

  function sign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get("nom") ?? "").trim()
    const message = String(data.get("message") ?? "").trim()
    const site = String(data.get("site") ?? "")
    if (!name || !message) {
      setError("Il manque un nom ou un message.")
      return
    }
    const url = safeUrl(site)
    if (site.trim() && !url) {
      setError("L'adresse du site ne ressemble pas à un lien http(s).")
      return
    }
    setError("")
    const entry: Entry = {
      id: crypto.randomUUID(),
      name: name.slice(0, 40),
      site: url,
      message: message.slice(0, 600),
      at: new Date().toISOString(),
    }
    writeLocal(KEY, JSON.stringify([entry, ...entries]))
    form.reset()
  }

  function remove(id: string) {
    writeLocal(KEY, JSON.stringify(entries.filter((entry) => entry.id !== id)))
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <form onSubmit={sign} className="bevel-out flex flex-col gap-3 self-start bg-win-face p-4 font-sans text-[14px] text-black" noValidate>
        <p className="font-mono text-[13px] font-bold">signer.php</p>
        <label className="flex flex-col gap-1">
          Nom ou pseudo *
          <input name="nom" maxLength={40} required className="win-input" autoComplete="nickname" />
        </label>
        <label className="flex flex-col gap-1">
          Votre site (facultatif)
          <input name="site" type="url" inputMode="url" placeholder="https://" className="win-input" />
        </label>
        <label className="flex flex-col gap-1">
          Message *
          <textarea name="message" maxLength={600} rows={5} required className="win-input resize-y" />
        </label>
        {error ? (
          <p role="alert" className="font-mono text-[13px] text-retro-red">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="win-btn font-bold">
            Signer le livre d&apos;or
          </button>
          <button type="reset" className="win-btn" onClick={() => setError("")}>
            Effacer
          </button>
        </div>
        <p className="font-mono text-[11px] leading-snug text-[#333]">
          Les messages restent dans votre navigateur tant que le back n&apos;est pas branché.
        </p>
      </form>

      <ol className="font-serif text-[19px] leading-snug" aria-live="polite">
        {entries.map((entry) => (
          <li key={entry.id} className="border-b border-dashed border-black py-4 first:pt-0">
            <p>
              <strong>{entry.name}</strong>
              {entry.site ? (
                <>
                  {" "}
                  (
                  <a href={entry.site} rel="nofollow ugc noopener" target="_blank" className="retro-link">
                    site
                  </a>
                  )
                </>
              ) : null}{" "}
              <span className="font-mono text-[13px] text-muted-foreground">— le {stamp(entry.at)}</span>
            </p>
            <p className="mt-1 whitespace-pre-line">{entry.message}</p>
            <button type="button" onClick={() => remove(entry.id)} className="retro-link mt-1 font-mono text-[12px]">
              [supprimer mon message]
            </button>
          </li>
        ))}
        <li className="py-4 first:pt-0">
          <p>
            <strong>{FIRST.name}</strong>{" "}
            <span className="font-mono text-[13px] text-muted-foreground">— le {formatShort(FIRST.date)}</span>
          </p>
          <p className="mt-1">{FIRST.message}</p>
        </li>
      </ol>
    </div>
  )
}
