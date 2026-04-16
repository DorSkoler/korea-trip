import type { Trip } from '../data/trip.schema'
import { loadSeedTrip } from '../data/loadTrip'
import {
  emptyOverlay,
  migrateOverlay,
  type BackupBundle,
  type TripRepository,
  type UserOverlay,
} from './TripRepository'

const OVERLAY_KEY = 'korea:overlay:v2'
const LEGACY_KEY = 'korea:overlay:v1'

function readLegacy(): unknown | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export class LocalStorageTripRepo implements TripRepository {
  getTrip(): Trip {
    return loadSeedTrip()
  }

  loadOverlay(): UserOverlay {
    try {
      const raw = localStorage.getItem(OVERLAY_KEY)
      if (!raw) {
        const legacy = readLegacy()
        if (legacy) {
          const migrated = migrateOverlay(legacy)
          this.saveOverlay(migrated)
          localStorage.removeItem(LEGACY_KEY)
          return migrated
        }
        return emptyOverlay()
      }
      return migrateOverlay(JSON.parse(raw))
    } catch (err) {
      console.warn('[overlay] failed to parse, resetting', err)
      return emptyOverlay()
    }
  }

  saveOverlay(overlay: UserOverlay): void {
    const withStamp: UserOverlay = {
      ...overlay,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(withStamp))
  }

  resetOverlay(): UserOverlay {
    const fresh = emptyOverlay()
    this.saveOverlay(fresh)
    return fresh
  }

  exportBackup(): string {
    const bundle: BackupBundle = {
      kind: 'korea-trip-backup',
      version: 2,
      exportedAt: new Date().toISOString(),
      overlay: this.loadOverlay(),
    }
    return JSON.stringify(bundle, null, 2)
  }

  importBackup(json: string): UserOverlay {
    const parsed = JSON.parse(json) as unknown
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as { kind?: unknown }).kind !== 'korea-trip-backup'
    ) {
      throw new Error('Not a Korea Trip backup file')
    }
    const bundle = parsed as BackupBundle
    const overlay = migrateOverlay(bundle.overlay)
    this.saveOverlay(overlay)
    return overlay
  }
}

export const tripRepo: TripRepository = new LocalStorageTripRepo()
