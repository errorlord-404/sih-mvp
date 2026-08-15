import { Bot, Bug, CloudSun, Droplets, LayoutDashboard, Map, Sprout, Store, TestTube2, Wheat, Mic, Settings } from 'lucide-react'

export const navigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/', icon: LayoutDashboard },
  { label: 'My Fields', key: 'fields', to: '/fields', icon: Map },
  { label: 'Soil Health', key: 'soil', to: '/soil', icon: TestTube2 },
  { label: 'Weather', key: 'weather', to: '/weather', icon: CloudSun },
  { label: 'Crop Guide', key: 'cropGuide', to: '/crop-guide', icon: Sprout },
  { label: 'Irrigation', key: 'irrigation', to: '/irrigation', icon: Droplets },
  { label: 'Pest & Disease', key: 'pest', to: '/pest', icon: Bug },
  { label: 'Market Prices', key: 'market', to: '/market', icon: Store },
  { label: 'AI Advisor', key: 'ai', to: '/ai', icon: Bot },
  { label: 'Voice Assistant', to: '/voice', icon: Mic },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export const mobileNavigation = [
  { label: 'Home', key: 'home', to: '/', icon: LayoutDashboard },
  { label: 'Fields', key: 'fields', to: '/fields', icon: Wheat },
  { label: 'Voice', key: 'voice', to: '/voice', icon: Mic },
  { label: 'Market', key: 'marketShort', to: '/market', icon: Store },
  { label: 'Profile', key: 'profile', to: '/settings', icon: Settings },
]
