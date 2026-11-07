import { create } from 'zustand'

interface InventoryState {
  /** Item id → count. */
  items: Record<string, number>
  add: (id: string, count?: number) => void
  /** Returns false if there weren't enough. */
  remove: (id: string, count?: number) => boolean
  hydrate: (items: Record<string, number>) => void
}

/** The player's bag (plan §5.6). Saved by game/systems/save.ts. */
export const useInventory = create<InventoryState>()((set, get) => ({
  items: {},
  add: (id, count = 1) => set((s) => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + count } })),
  remove: (id, count = 1) => {
    const have = get().items[id] ?? 0
    if (have < count) return false
    set((s) => {
      const items = { ...s.items }
      if (have - count > 0) items[id] = have - count
      else delete items[id]
      return { items }
    })
    return true
  },
  hydrate: (items) => set({ items: { ...items } }),
}))
