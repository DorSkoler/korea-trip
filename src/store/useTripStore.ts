import { create } from 'zustand'
import type { Item, PlaceItem, TimeOfDay, Trip } from '../data/trip.schema'
import { computeEffectiveTrip } from '../lib/effectiveTrip'
import { tripRepo } from '../repository/LocalStorageTripRepo'
import type { PlacePatch, UserOverlay } from '../repository/TripRepository'

type TripState = {
  seed: Trip
  overlay: UserOverlay
  trip: Trip
  totalPlaces: number
  isDone: (id: string) => boolean
  toggleDone: (id: string) => void
  patchPlace: (id: string, patch: PlacePatch) => void
  deleteItem: (id: string) => void
  addPlace: (dayNumber: number, timeOfDay: TimeOfDay) => string
  reorderDay: (dayNumber: number, newOrder: string[]) => void
  resetProgress: () => void
  exportBackup: () => string
  importBackup: (json: string) => void
}

function countPlaces(trip: Trip): number {
  return trip.days.reduce(
    (n, d) => n + d.items.filter((i) => i.kind === 'place').length,
    0,
  )
}

function commit(overlay: UserOverlay): UserOverlay {
  tripRepo.saveOverlay(overlay)
  return overlay
}

function nextCustomId(overlay: UserOverlay): string {
  const n = Object.keys(overlay.customItems).length + 1
  return `custom-${Date.now().toString(36)}-${n}`
}

function rebuild(
  seed: Trip,
  overlay: UserOverlay,
): { trip: Trip; totalPlaces: number } {
  const trip = computeEffectiveTrip(seed, overlay)
  return { trip, totalPlaces: countPlaces(trip) }
}

export const useTripStore = create<TripState>((set, get) => {
  const seed = tripRepo.getTrip()
  const overlay = tripRepo.loadOverlay()
  const { trip, totalPlaces } = rebuild(seed, overlay)

  return {
    seed,
    overlay,
    trip,
    totalPlaces,

    isDone: (id) => Boolean(get().overlay.done[id]),

    toggleDone: (id) => {
      const current = get().overlay
      const next: UserOverlay = {
        ...current,
        done: { ...current.done },
      }
      if (next.done[id]) delete next.done[id]
      else next.done[id] = true
      set({ overlay: commit(next) })
    },

    patchPlace: (id, patch) => {
      const current = get().overlay
      const existing = current.placePatches[id] ?? {}
      const merged: PlacePatch = { ...existing, ...patch }
      const next: UserOverlay = {
        ...current,
        placePatches: { ...current.placePatches, [id]: merged },
      }
      const committed = commit(next)
      set({ overlay: committed, ...rebuild(get().seed, committed) })
    },

    deleteItem: (id) => {
      const current = get().overlay
      const next: UserOverlay = {
        ...current,
        deletedIds: { ...current.deletedIds, [id]: true },
      }
      const committed = commit(next)
      set({ overlay: committed, ...rebuild(get().seed, committed) })
    },

    addPlace: (dayNumber, timeOfDay) => {
      const current = get().overlay
      const id = nextCustomId(current)
      const newPlace: PlaceItem = {
        kind: 'place',
        id,
        timeOfDay,
        name: 'New place',
        category: 'street',
        address: '',
      }
      const dayKey = String(dayNumber)
      const existingCustom = current.customByDay[dayKey] ?? []
      const next: UserOverlay = {
        ...current,
        customItems: { ...current.customItems, [id]: newPlace as Item },
        customByDay: {
          ...current.customByDay,
          [dayKey]: [...existingCustom, id],
        },
      }
      const committed = commit(next)
      set({ overlay: committed, ...rebuild(get().seed, committed) })
      return id
    },

    reorderDay: (dayNumber, newOrder) => {
      const current = get().overlay
      const next: UserOverlay = {
        ...current,
        dayOrder: {
          ...current.dayOrder,
          [String(dayNumber)]: newOrder,
        },
      }
      const committed = commit(next)
      set({ overlay: committed, ...rebuild(get().seed, committed) })
    },

    resetProgress: () => {
      const fresh = tripRepo.resetOverlay()
      set({ overlay: fresh, ...rebuild(get().seed, fresh) })
    },

    exportBackup: () => tripRepo.exportBackup(),

    importBackup: (json) => {
      const overlay = tripRepo.importBackup(json)
      set({ overlay, ...rebuild(get().seed, overlay) })
    },
  }
})
