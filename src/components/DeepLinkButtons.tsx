import type { PlaceItem } from '../data/trip.schema'

type Props = {
  place: PlaceItem
}

type Link = { href: string; label: string; emoji: string }

function getLinks(place: PlaceItem): Link[] {
  const links: Link[] = []
  if (place.naverMapsUrl)
    links.push({ href: place.naverMapsUrl, label: 'Naver', emoji: '🗺' })
  if (place.googleMapsUrl)
    links.push({ href: place.googleMapsUrl, label: 'Google', emoji: '🌍' })
  if (place.websiteUrl)
    links.push({ href: place.websiteUrl, label: 'Website', emoji: '🌐' })
  return links
}

export function DeepLinkButtons({ place }: Props) {
  const links = getLinks(place)
  if (!links.length) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium glass hover:scale-[1.03] active:scale-95 transition-transform"
          dir="ltr"
        >
          <span aria-hidden>{l.emoji}</span>
          <span>{l.label}</span>
        </a>
      ))}
    </div>
  )
}
