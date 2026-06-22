import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const memoryStorage = new Map<string, string>()
let nativeStorageAvailable = Platform.OS === 'web' ? false : true

function getWebStorage(): Storage | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  try {
    const probeKey = '__hexamind_storage_probe__'
    localStorage.setItem(probeKey, '1')
    localStorage.removeItem(probeKey)
    return localStorage
  } catch {
    return null
  }
}

const webStorage = getWebStorage()

export const safeStorage = {
  async getItem(key: string) {
    if (webStorage) {
      try {
        const value = webStorage.getItem(key)
        if (value !== null) {
          memoryStorage.set(key, value)
        }
        return value
      } catch {
        return memoryStorage.get(key) ?? null
      }
    }

    if (!nativeStorageAvailable) {
      return memoryStorage.get(key) ?? null
    }

    try {
      const value = await AsyncStorage.getItem(key)
      if (value !== null) {
        memoryStorage.set(key, value)
      }
      return value
    } catch {
      nativeStorageAvailable = false
      return memoryStorage.get(key) ?? null
    }
  },

  async setItem(key: string, value: string) {
    memoryStorage.set(key, value)

    if (webStorage) {
      try {
        webStorage.setItem(key, value)
      } catch {
        // ignore and fall back to memory
      }
      return
    }

    if (!nativeStorageAvailable) {
      return
    }

    try {
      await AsyncStorage.setItem(key, value)
    } catch {
      nativeStorageAvailable = false
    }
  },

  async removeItem(key: string) {
    memoryStorage.delete(key)

    if (webStorage) {
      try {
        webStorage.removeItem(key)
      } catch {
        // ignore and fall back to memory
      }
      return
    }

    if (!nativeStorageAvailable) {
      return
    }

    try {
      await AsyncStorage.removeItem(key)
    } catch {
      nativeStorageAvailable = false
    }
  },
}
