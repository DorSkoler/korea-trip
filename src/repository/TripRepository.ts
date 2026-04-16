import type { Item, PlaceItem, Trip } from '../data/trip.schema'

export type PlacePatch = Partial<
  Pick<
    PlaceItem,
    | 'name'
    | 'nameHe'
    | 'startTime'
    | 'durationMin'
    | 'address'
    | 'category'
    | 'foodLevel'
    | 'mustDo'
    | 'notesHe'
    | 'notesEn'
    | 'timeOfDay'
  >
>

export type UserOverlay = {
  version: 2
  updatedAt: string
  done: Record<string, true>
  placePatches: Record<string, PlacePatch>
  deletedIds: Record<string, true>
  dayOrder: Record<string, string[]>
  customItems: Record<string, Item>
  customByDay: Record<string, string[]>
}

export type BackupBundle = {
  kind: 'korea-trip-backup'
  version: 2
  exportedAt: string
  overlay: UserOverlay
}

export interface TripRepository {
  getTrip(): Trip
  loadOverlay(): UserOverlay
  saveOverlay(overlay: UserOverlay): void
  resetOverlay(): UserOverlay
  exportBackup(): string
  importBackup(json: string): UserOverlay
}

export function emptyOverlay(): UserOverlay {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    done: {},
    placePatches: {},
    deletedIds: {},
    dayOrder: {},
    customItems: {},
    customByDay: {},
  }
}

export function migrateOverlay(raw: unknown): UserOverlay {
  if (typeof raw !== 'object' || raw === null) return emptyOverlay()
  const o = raw as Record<string, unknown>
  const fresh = emptyOverlay()
  return {
    ...fresh,
    done: (o.done as Record<string, true>) ?? {},
    placePatches: (o.placePatches as Record<string, PlacePatch>) ?? {},
    deletedIds: (o.deletedIds as Record<string, true>) ?? {},
    dayOrder: (o.dayOrder as Record<string, string[]>) ?? {},
    customItems: (o.customItems as Record<string, Item>) ?? {},
    customByDay: (o.customByDay as Record<string, string[]>) ?? {},
  }
}
