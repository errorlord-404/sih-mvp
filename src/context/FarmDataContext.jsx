import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/client.js';
import { farmStateApi } from '../api/farmStateApi.js';

const FarmDataContext = createContext(null);

export function FarmDataProvider({ children }) {
  const [profile, setProfile] = useState(null); const [fields, setFields] = useState([]); const [mapFields, setMapFields] = useState([]); const [alerts, setAlerts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    const results = await Promise.allSettled([farmStateApi.getProfile(), farmStateApi.listFields(), farmStateApi.listMapFields(), farmStateApi.listAlerts('open')]);
    const [profileResult, fieldsResult, mapResult, alertsResult] = results;
    if (profileResult.status === 'fulfilled') setProfile(profileResult.value); else if (!(profileResult.reason instanceof ApiError && profileResult.reason.status === 404)) setError(profileResult.reason);
    if (fieldsResult.status === 'fulfilled') setFields(fieldsResult.value); else setError(fieldsResult.reason);
    if (mapResult.status === 'fulfilled') setMapFields(mapResult.value); if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value);
    setLoading(false);
  }, []);
  // The initial load synchronizes this provider with the backend API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, [refresh]);
  const value = useMemo(() => ({ profile, fields, mapFields, alerts, loading, error, refresh, refreshFields: refresh, refreshAlerts: refresh,
    saveProfile: async (body) => { const saved = await farmStateApi.updateProfile(body); setProfile(saved); return saved; },
    createField: async (body) => { const created = await farmStateApi.createField(body); await refresh(); return created; },
    acknowledgeAlert: async (id, status = 'read') => { await farmStateApi.updateAlert(id, status); await refresh(); },
  }), [profile, fields, mapFields, alerts, loading, error, refresh]);
  return <FarmDataContext.Provider value={value}>{children}</FarmDataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFarmData() { const value = useContext(FarmDataContext); if (!value) throw new Error('useFarmData must be used inside FarmDataProvider'); return value; }
