import type { Day, Item, PlaceItem, Trip } from '../data/trip.schema'
import type { UserOverlay } from '../repository/TripRepository'

function applyPlacePatch(
  place: PlaceItem,
  overlay: UserOverlay,
): PlaceItem {
  const patch = overlay.placePatches[place.id]
  if (!patch) return place
  return { ...place, ...patch }
}

export function computeEffectiveTrip(seed: Trip, overlay: UserOverlay): Trip {
  const days: Day[] = seed.days.map((day) => {
    const baseItems: Item[] = day.items
      .filter((i) => !overlay.deletedIds[i.id])
      .map((item) =>
        item.kind === 'place' ? applyPlacePatch(item, overlay) : item,
      )

    const customIds = overlay.customByDay[String(day.dayNumber)] ?? []
    const customItems: Item[] = customIds
      .map((id) => overlay.customItems[id])
      .filter((i): i is Item => Boolean(i))
      .filter((i) => !overlay.deletedIds[i.id])
      .map((item) =>
        item.kind === 'place' ? applyPlacePatch(item, overlay) : item,
      )

    const allItems = [...baseItems, ...customItems]
    const savedOrder = overlay.dayOrder[String(day.dayNumber)]
    let items: Item[]
    if (savedOrder && savedOrder.length) {
      const index = new Map(allItems.map((i) => [i.id, i]))
      const ordered = savedOrder
        .map((id) => index.get(id))
        .filter((i): i is Item => Boolean(i))
      const leftovers = allItems.filter((i) => !savedOrder.includes(i.id))
      items = [...ordered, ...leftovers]
    } else {
      items = allItems
    }

    return { ...day, items }
  })

  return { ...seed, days }
}
