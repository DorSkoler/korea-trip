import { z } from 'zod'

export const Weekday = z.enum([
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
])
export type Weekday = z.infer<typeof Weekday>

const HoursString = z
  .string()
  .regex(
    /^((closed)|(\d{2}:\d{2}-\d{2}:\d{2}(,\d{2}:\d{2}-\d{2}:\d{2})*)|(24h))$/,
    'Must be "closed", "24h", or "HH:MM-HH:MM" (optionally multiple ranges comma-separated)',
  )

export const OpeningHours = z.object({
  mon: HoursString.optional(),
  tue: HoursString.optional(),
  wed: HoursString.optional(),
  thu: HoursString.optional(),
  fri: HoursString.optional(),
  sat: HoursString.optional(),
  sun: HoursString.optional(),
  notes: z.string().optional(),
})
export type OpeningHours = z.infer<typeof OpeningHours>

export const TimeOfDay = z.enum(['morning', 'afternoon', 'evening', 'night'])
export type TimeOfDay = z.infer<typeof TimeOfDay>

export const PlaceCategory = z.enum([
  'palace',
  'market',
  'cafe',
  'bakery',
  'restaurant',
  'shopping',
  'nightlife',
  'park',
  'viewpoint',
  'temple',
  'beach',
  'hanok',
  'museum',
  'street',
  'hotel',
  'transport-hub',
])
export type PlaceCategory = z.infer<typeof PlaceCategory>

export const FoodLevel = z.enum(['none', 'light', 'medium', 'heavy'])
export type FoodLevel = z.infer<typeof FoodLevel>

export const TransportMode = z.enum([
  'walk',
  'subway',
  'taxi',
  'ktx',
  'bus',
  'car',
])
export type TransportMode = z.infer<typeof TransportMode>

export const PlaceItem = z.object({
  kind: z.literal('place'),
  id: z.string(),
  timeOfDay: TimeOfDay,
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  durationMin: z.number().int().positive().optional(),
  name: z.string(),
  nameHe: z.string().optional(),
  category: PlaceCategory,
  foodLevel: FoodLevel.optional(),
  address: z.string(),
  naverMapsUrl: z.string().url().optional(),
  googleMapsUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  googlePlaceId: z.string().optional(),
  openingHours: OpeningHours.optional(),
  mustDo: z.boolean().optional(),
  notesHe: z.string().optional(),
  notesEn: z.string().optional(),
})
export type PlaceItem = z.infer<typeof PlaceItem>

export const TransportItem = z.object({
  kind: z.literal('transport'),
  id: z.string(),
  mode: TransportMode,
  durationMin: z.number().int().positive().optional(),
  fromTo: z.string().optional(),
  notesHe: z.string().optional(),
  notesEn: z.string().optional(),
})
export type TransportItem = z.infer<typeof TransportItem>

export const NoteItem = z.object({
  kind: z.literal('note'),
  id: z.string(),
  emoji: z.string().optional(),
  textHe: z.string().optional(),
  textEn: z.string().optional(),
})
export type NoteItem = z.infer<typeof NoteItem>

export const Item = z.discriminatedUnion('kind', [
  PlaceItem,
  TransportItem,
  NoteItem,
])
export type Item = z.infer<typeof Item>

export const Day = z.object({
  dayNumber: z.number().int().min(1).max(15),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  region: z.string(),
  titleHe: z.string().optional(),
  heroImage: z.string().optional(),
  summaryHe: z.string().optional(),
  summaryEn: z.string().optional(),
  items: z.array(Item),
})
export type Day = z.infer<typeof Day>

export const Trip = z.object({
  version: z.literal(1),
  startDate: z.string(),
  endDate: z.string(),
  city: z.string(),
  days: z.array(Day).length(15),
})
export type Trip = z.infer<typeof Trip>
