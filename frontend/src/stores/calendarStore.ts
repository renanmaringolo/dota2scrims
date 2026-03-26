import { create } from 'zustand'
import { startOfWeek, addWeeks, subWeeks } from 'date-fns'

type ViewMode = 'week' | 'day'

interface CalendarState {
  selectedDate: Date
  viewMode: ViewMode
  setDate: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
  nextWeek: () => void
  prevWeek: () => void
  today: () => void
}

export const useCalendarStore = create<CalendarState>()((set) => ({
  selectedDate: new Date(),
  viewMode: 'week',

  setDate: (date) => set({ selectedDate: date }),

  setViewMode: (mode) => set({ viewMode: mode }),

  nextWeek: () =>
    set((state) => ({
      selectedDate: startOfWeek(addWeeks(state.selectedDate, 1), { weekStartsOn: 1 }),
    })),

  prevWeek: () =>
    set((state) => ({
      selectedDate: startOfWeek(subWeeks(state.selectedDate, 1), { weekStartsOn: 1 }),
    })),

  today: () => set({ selectedDate: new Date() }),
}))
