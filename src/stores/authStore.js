import { create } from 'zustand'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,

  login: async (credentials) => {
    set({ loading: true })
    try {
      const response = await authAPI.login(credentials)
      const { token, ...user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ user, token, loading: false })
      toast.success('Logged in successfully')
      return true
    } catch (error) {
      set({ loading: false })
      return false
    }
  },

  register: async (data) => {
    set({ loading: true })
    try {
      const response = await authAPI.register(data)
      const { token, ...user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ user, token, loading: false })
      toast.success('Registered successfully')
      return true
    } catch (error) {
      set({ loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
    toast.success('Logged out successfully')
  },

  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const response = await authAPI.updateProfile(data)
      const { token, ...user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      set({ user, token, loading: false })
      toast.success('Profile updated successfully')
      return true
    } catch (error) {
      set({ loading: false })
      return false
    }
  }
}))
