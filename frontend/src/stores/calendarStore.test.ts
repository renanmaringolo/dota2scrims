import { useCalendarStore } from './calendarStore'
import { startOfWeek, addWeeks, subWeeks, isEqual, startOfDay } from 'date-fns'

describe('calendarStore', () => {
  beforeEach(() => {
    useCalendarStore.setState({
      selectedDate: new Date(),
      viewMode: 'week',
    })
  })

  describe('initial state', () => {
    it('defaults to today', () => {
      const { selectedDate } = useCalendarStore.getState()
      expect(startOfDay(selectedDate)).toEqual(startOfDay(new Date()))
    })

    it('defaults to week view', () => {
      const { viewMode } = useCalendarStore.getState()
      expect(viewMode).toBe('week')
    })
  })

  describe('setDate', () => {
    it('updates selectedDate', () => {
      const date = new Date(2026, 5, 15)
      useCalendarStore.getState().setDate(date)
      expect(useCalendarStore.getState().selectedDate).toEqual(date)
    })
  })

  describe('setViewMode', () => {
    it('updates viewMode to day', () => {
      useCalendarStore.getState().setViewMode('day')
      expect(useCalendarStore.getState().viewMode).toBe('day')
    })

    it('updates viewMode to week', () => {
      useCalendarStore.getState().setViewMode('day')
      useCalendarStore.getState().setViewMode('week')
      expect(useCalendarStore.getState().viewMode).toBe('week')
    })
  })

  describe('nextWeek', () => {
    it('advances selectedDate by one week', () => {
      const initial = new Date(2026, 2, 16)
      useCalendarStore.setState({ selectedDate: initial })
      useCalendarStore.getState().nextWeek()

      const expected = startOfWeek(addWeeks(initial, 1), { weekStartsOn: 1 })
      expect(isEqual(useCalendarStore.getState().selectedDate, expected)).toBe(true)
    })
  })

  describe('prevWeek', () => {
    it('moves selectedDate back by one week', () => {
      const initial = new Date(2026, 2, 16)
      useCalendarStore.setState({ selectedDate: initial })
      useCalendarStore.getState().prevWeek()

      const expected = startOfWeek(subWeeks(initial, 1), { weekStartsOn: 1 })
      expect(isEqual(useCalendarStore.getState().selectedDate, expected)).toBe(true)
    })
  })

  describe('today', () => {
    it('resets selectedDate to today', () => {
      useCalendarStore.setState({ selectedDate: new Date(2020, 0, 1) })
      useCalendarStore.getState().today()
      expect(startOfDay(useCalendarStore.getState().selectedDate)).toEqual(startOfDay(new Date()))
    })
  })
})
