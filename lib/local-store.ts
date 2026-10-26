import { useSyncExternalStore } from "react"

/**
 * Un tout petit magasin au-dessus de localStorage, en attendant le back :
 * le compteur de visites et le livre d'or vivent dans le navigateur du
 * visiteur. Côté serveur la valeur est `undefined`, ce qui évite tout écart
 * d'hydratation.
 */

const listeners = new Set<() => void>()

export function readLocal(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Navigation privée ou stockage bloqué : on garde l'interface fonctionnelle.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

export function useLocal(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readLocal(key),
    () => undefined,
  )
}
