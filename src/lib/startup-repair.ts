// Startup data validator — runs BEFORE React mounts
// Repairs corrupted localStorage to prevent crashes

const MAX_EPISODES_PER_ITEM = 200
const MAX_ITEMS = 300
const MAX_RATING = 5

function safeParse(raw: string | null): any {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function repairDataOnStartup(): boolean {
  let repaired = false

  try {
    // Repair items
    const itemsRaw = localStorage.getItem('treehole_items')
    let items = safeParse(itemsRaw)
    if (Array.isArray(items)) {
      const cleaned = items
        .filter((item: any) => item && typeof item === 'object' && item.id && item.title)
        .map((item: any) => {
          let changed = false
          const copy = { ...item }

          // Fix rating: clamp to 0-5, ensure number
          if (typeof copy.rating !== 'number' || isNaN(copy.rating) || copy.rating < 0) {
            copy.rating = 0; changed = true
          } else if (copy.rating > MAX_RATING) {
            copy.rating = Math.round(copy.rating / 2); changed = true // TMDB 10-scale → 5-scale
          }

          // Limit episodes per item
          if (copy.playUrls && Array.isArray(copy.playUrls)) {
            copy.playUrls = copy.playUrls.map((src: any) => {
              if (src.episodes && src.episodes.length > MAX_EPISODES_PER_ITEM) {
                changed = true
                return { ...src, episodes: src.episodes.slice(0, MAX_EPISODES_PER_ITEM) }
              }
              return src
            })
          }

          return changed ? copy : item
        })
        .slice(0, MAX_ITEMS)

      if (cleaned.length !== items.length || cleaned.some((c, i) => c !== items[i])) {
        repaired = true
        items = cleaned
      }
    } else {
      repaired = true
      items = []
    }

    if (repaired) {
      localStorage.setItem('treehole_items', JSON.stringify(items))
      console.log('🛠️ Data repaired on startup, items:', items.length)
    }

    // Repair reviews
    const reviewsRaw = localStorage.getItem('treehole_reviews')
    let reviews = safeParse(reviewsRaw)
    if (!Array.isArray(reviews)) {
      reviews = []
      localStorage.setItem('treehole_reviews', JSON.stringify(reviews))
    }
  } catch (e) {
    console.error('Startup repair failed, clearing data:', e)
    try { localStorage.removeItem('treehole_items') } catch {}
    try { localStorage.removeItem('treehole_reviews') } catch {}
    repaired = true
  }

  return repaired
}
