import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_CONFIG, LOCALE_CONFIG } from '@/config/api';

interface AppSettings {
  // UI Settings
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Table Settings
  defaultPageSize: number;
  compactTables: boolean;
  
  // Notification Settings
  enableNotifications: boolean;
  enableSoundAlerts: boolean;
  autoRefreshInterval: number; // in seconds, 0 = disabled
  
  // Display Settings
  currency: string;
  distanceUnit: 'km' | 'miles';
  fuelUnit: 'liters' | 'gallons';
  temperatureUnit: 'celsius' | 'fahrenheit';
}

interface AppSettingsStore extends AppSettings {
  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  toggleSidebar: () => void;
  setTheme: (theme: AppSettings['theme']) => void;
  setLanguage: (language: string) => void;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  sidebarCollapsed: false,
  language: LOCALE_CONFIG.DEFAULT_LOCALE,
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  defaultPageSize: 20,
  compactTables: false,
  enableNotifications: true,
  enableSoundAlerts: false,
  autoRefreshInterval: 0,
  currency: 'USD',
  distanceUnit: 'miles',
  fuelUnit: 'gallons',
  temperatureUnit: 'fahrenheit',
};

export const useAppSettingsStore = create<AppSettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (settings) =>
        set((state) => ({
          ...state,
          ...settings,
        })),
      
      resetSettings: () => set(defaultSettings),
      
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
      
      setTheme: (theme) =>
        set({ theme }),
      
      setLanguage: (language) =>
        set({ language }),
    }),
    {
      name: `${APP_CONFIG.NAME}-settings`,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Only persist these specific fields
        const { 
          updateSettings, 
          resetSettings, 
          toggleSidebar, 
          setTheme, 
          setLanguage, 
          ...persistableState 
        } = state;
        return persistableState;
      },
    }
  )
);