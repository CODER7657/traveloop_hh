import { create } from 'zustand'

export const useTripStore = create((set) => ({
  trips: [],
  currentTrip: null,
  stops: [],
  isLoading: false,

  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setStops: (stops) => set({ stops }),
  setLoading: (isLoading) => set({ isLoading }),
}))
