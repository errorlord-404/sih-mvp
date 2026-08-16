import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import AIAssistant from '../pages/AIAssistant.jsx';
import MyFields from '../pages/MyFields.jsx';
import FieldDetail from '../pages/FieldDetail.jsx';
import {
  Irrigation,
  MarketPrices,
  Reports,
  SoilHealth,
  Weather,
} from '../pages/CorePages.jsx';
import { CropGuide, FarmMap, PestDisease } from '../pages/FieldTools.jsx';
import GovtSchemes from '../pages/GovtSchemes.jsx';
import FarmFinance from '../pages/FarmFinance.jsx';
import VoiceAssistant from '../pages/VoiceAssistant.jsx';
import Settings from '../pages/Settings.jsx';

export const router = createBrowserRouter([
  {
    // Main App Layout Shell wrapper route
    element: <AppShell />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/fields', element: <MyFields /> },
      { path: '/fields/:fieldId', element: <FieldDetail /> },
      { path: '/map', element: <FarmMap /> },
      { path: '/crop-guide', element: <CropGuide /> },
      { path: '/soil', element: <SoilHealth /> },
      { path: '/weather', element: <Weather /> },
      { path: '/irrigation', element: <Irrigation /> },
      { path: '/pest', element: <PestDisease /> },
      { path: '/market', element: <MarketPrices /> },
      { path: '/schemes', element: <GovtSchemes /> },
      { path: '/finance', element: <FarmFinance /> },
      { path: '/ai', element: <AIAssistant /> },
      { path: '/voice', element: <VoiceAssistant /> },
      { path: '/reports', element: <Reports /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);