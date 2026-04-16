import type {
  FoodLevel,
  PlaceCategory,
  TimeOfDay,
  TransportMode,
} from '../data/trip.schema'

export const CATEGORY_ICON: Record<PlaceCategory, string> = {
  palace: '🏯',
  market: '🛒',
  cafe: '☕',
  bakery: '🥐',
  restaurant: '🍜',
  shopping: '🛍️',
  nightlife: '🍻',
  park: '🌳',
  viewpoint: '🔭',
  temple: '⛩️',
  beach: '🏖️',
  hanok: '🏘️',
  museum: '🏛️',
  street: '🛣️',
  hotel: '🏨',
  'transport-hub': '🚉',
}

export const FOOD_EMOJI: Record<Exclude<FoodLevel, 'none'>, string> = {
  light: '🍢',
  medium: '🍜',
  heavy: '🍲',
}

export const TIME_OF_DAY_EMOJI: Record<TimeOfDay, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
}

export const TIME_OF_DAY_ORDER: TimeOfDay[] = [
  'morning',
  'afternoon',
  'evening',
  'night',
]

export const TRANSPORT_ICON: Record<TransportMode, string> = {
  walk: '🚶',
  subway: '🚇',
  taxi: '🚕',
  ktx: '🚄',
  bus: '🚌',
  car: '🚗',
}
