import {
  Bot,
  Bug,
  CloudSun,
  Coins,
  Droplets,
  Landmark,
  LayoutDashboard,
  Map,
  Mic,
  Settings,
  Sprout,
  Store,
  TestTube2,
  Wheat,
} from 'lucide-react';

export const navigation = [
  { label: 'Dashboard', key: 'dashboard', to: '/', icon: LayoutDashboard },
  { label: 'My Fields', key: 'fields', to: '/fields', icon: Wheat },
  { label: 'Farm Map', key: 'farmMap', to: '/map', icon: Map },
  { label: 'Crop Guide', key: 'cropGuide', to: '/crop-guide', icon: Sprout },
  { label: 'Soil Health', key: 'soil', to: '/soil', icon: TestTube2 },
  { label: 'Weather', key: 'weather', to: '/weather', icon: CloudSun },
  { label: 'Irrigation', key: 'irrigation', to: '/irrigation', icon: Droplets },
  { label: 'Pest & Disease', key: 'pest', to: '/pest', icon: Bug },
  { label: 'Market Prices', key: 'market', to: '/market', icon: Store },
  { label: 'Govt Schemes', key: 'schemes', to: '/schemes', icon: Landmark },
  { label: 'Farm Finance', key: 'finance', to: '/finance', icon: Coins },
  { label: 'AI Advisor', key: 'ai', to: '/ai', icon: Bot },
  { label: 'Voice Assistant', key: 'voice', to: '/voice', icon: Mic },
  { label: 'Settings', key: 'settings', to: '/settings', icon: Settings },
];

export const mobileNavigation = [
  { label: 'Home', key: 'home', to: '/', icon: LayoutDashboard },
  { label: 'Fields', key: 'fields', to: '/fields', icon: Wheat },
  { label: 'Voice', key: 'voice', to: '/voice', icon: Mic },
  { label: 'Market', key: 'marketShort', to: '/market', icon: Store },
  { label: 'Profile', key: 'profile', to: '/settings', icon: Settings },
];

