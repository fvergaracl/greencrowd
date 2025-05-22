import { create } from "zustand"

interface OpenTaskStore {
  openTask: any
  gameId: string | null
  points: number | null
  setData: (data: { openTask: any; gameId: string; points: number }) => void
  reset: () => void
}

export const useOpenTaskStore = create<OpenTaskStore>(set => ({
  openTask: null,
  gameId: null,
  points: null,
  setData: ({ openTask, gameId, points }) => set({ openTask, gameId, points }),
  reset: () => set({ openTask: null, gameId: null, points: null })
}))
