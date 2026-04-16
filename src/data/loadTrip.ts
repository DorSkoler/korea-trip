import { Trip } from './trip.schema'
import seed from './trip.seed.json'

export function loadSeedTrip(): Trip {
  const parsed = Trip.safeParse(seed)
  if (!parsed.success) {
    console.error('[trip.seed.json] schema validation failed:')
    console.error(parsed.error.format())
    throw new Error('Invalid trip seed data — see console for details')
  }
  return parsed.data
}
