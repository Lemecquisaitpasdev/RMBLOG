"use client"

import { useSyncExternalStore } from "react"

const noop = () => () => {}

/** Affiche le chemin demandé, lu côté navigateur (la 404 est prégénérée). */
export function RequestedUrl() {
  const path = useSyncExternalStore(
    noop,
    () => window.location.pathname,
    () => "",
  )
  return <code className="font-mono">{path || "/…"}</code>
}
