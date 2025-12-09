import jokesData from '@/assets/jokes.json'
import type { JokeDto, AddJokePayload } from './jokes.service.types'

const LOCAL_STORAGE_KEY = 'myapp.jokes.custom'

function safeGetLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

function loadCustomJokes(): JokeDto[] {
  const ls = safeGetLocalStorage()
  if (!ls) return []
  try {
    const raw = ls.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveCustomJokes(jokes: JokeDto[]) {
  const ls = safeGetLocalStorage()
  if (!ls) return
  try {
    ls.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jokes))
  } catch {
    // ignore
  }
}

export function getAllJokes(): JokeDto[] {
  const custom = loadCustomJokes()
  return [...jokesData, ...custom]
}

export function getRandomJoke(): JokeDto | null {
  const all = getAllJokes()
  if (all.length === 0) return null
  const index = Math.floor(Math.random() * all.length)
  return all[index]
}

export function addJoke({ question, answer }: AddJokePayload): JokeDto {
  const trimmedQuestion = question?.trim()
  const trimmedAnswer = answer?.trim()
  if (!trimmedQuestion || !trimmedAnswer) {
    throw new Error('La question et la réponse sont obligatoires.')
  }

  const custom = loadCustomJokes()
  const newJoke = {
    id: String(Date.now()),
    question: trimmedQuestion,
    answer: trimmedAnswer,
  }
  const updated = [...custom, newJoke]
  saveCustomJokes(updated)

  if (typeof window !== 'undefined' && window.electronApi?.notifyJokeAdded) {
    try {
      window.electronApi.notifyJokeAdded(newJoke)
    } catch (e) {
      // ignorer silencieusement si la notif échoue
    }
  }

  return newJoke
}

export function removeJoke(id: string): JokeDto[] {
  const custom = loadCustomJokes()
  const updated = custom.filter((j) => j.id !== id)
  saveCustomJokes(updated)
  return updated
}

export function resetCustomJokes(): void {
  saveCustomJokes([])
}
