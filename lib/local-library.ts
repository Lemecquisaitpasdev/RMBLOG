/* Les livres ouverts depuis l'appareil restent dans ce navigateur (IndexedDB) : rien n'est envoyé. */

export type LocalBook = {
  id: string
  title: string
  author: string
  cover?: Blob
  file: Blob
  added: number
}

const DB = "liseuse"
const STORE = "livres"
// Si IndexedDB est indisponible (navigation privée…), le livre tient le temps de la visite.
const memory = new Map<string, LocalBook>()

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

/** Identifiant stable pour un même fichier : on retrouve sa page en le rouvrant. */
export function bookId(file: File) {
  let hash = 0
  for (const char of `${file.name}:${file.size}`) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0
  return `epub-${(hash >>> 0).toString(36)}-${file.size.toString(36)}`
}

export async function saveLocalBook(book: LocalBook) {
  memory.set(book.id, book)
  try {
    await run("readwrite", (store) => store.put(book))
  } catch {
    // reste en mémoire pour cette visite
  }
}

export async function getLocalBook(id: string) {
  try {
    return (await run<LocalBook | undefined>("readonly", (store) => store.get(id))) ?? memory.get(id)
  } catch {
    return memory.get(id)
  }
}

export async function listLocalBooks() {
  let stored: LocalBook[] = []
  try {
    stored = await run<LocalBook[]>("readonly", (store) => store.getAll())
  } catch {
    // rien d'enregistré
  }
  const byId = new Map([...memory.values(), ...stored].map((book) => [book.id, book]))
  return [...byId.values()].sort((a, b) => b.added - a.added)
}

export async function deleteLocalBook(id: string) {
  memory.delete(id)
  try {
    await run("readwrite", (store) => store.delete(id))
  } catch {
    // déjà absent
  }
  try {
    window.localStorage.removeItem(`liseuse:appareil:${id}`)
  } catch {
    // navigation privée
  }
}
