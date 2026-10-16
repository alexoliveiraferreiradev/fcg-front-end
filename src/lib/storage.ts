// localStorage pode falhar (aba privada, cota); a tela continua funcionando sem ele.

export function readJson<T>(key: string, store: Storage = localStorage): T | null {
  try {
    const raw = store.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown, store: Storage = localStorage) {
  try {
    if (value === null || value === undefined) store.removeItem(key)
    else store.setItem(key, JSON.stringify(value))
  } catch {
    // sem persistência; o estado em memória segue valendo
  }
}
