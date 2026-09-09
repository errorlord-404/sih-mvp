import { apiRequest, queryString, REFERENCE_API_URL } from './client.js';

const request = (path, options = {}) => apiRequest(REFERENCE_API_URL, path, options);
export const referenceApi = {
  getBackendHealth: () => request('/health'),
  listCrops: () => request('/crops'), marketSummary: (filters) => request(`/market-prices/summary${queryString(filters)}`),
  marketHistory: (filters) => request(`/market-prices/history${queryString(filters)}`), marketTrend: (filters) => request(`/market-prices/trend${queryString(filters)}`),
  compareMandis: (crop, assumptions) => request(`/market-prices/compare/${encodeURIComponent(crop)}${queryString(assumptions)}`),
  compareMspWithMarket: (crop) => request(`/msp/compare-market${queryString({ crop })}`),
  listSchemes: () => request('/gov-schemes'),
  listSchemesByState: (state) => request(`/gov-schemes/by-state/${encodeURIComponent(state)}`),
  listMachineryRentals: (filters) => request(`/machinery-rentals${queryString(filters)}`),
  nearbyMachineryRentals: (filters) => request(`/machinery-rentals/nearby${queryString(filters)}`),
  marketplaceStatus: () => request('/marketplace/status'),
  searchMarketplace: (filters) => request(`/marketplace/listings${queryString(filters)}`),
  nearbyMarketplace: (filters) => request(`/marketplace/nearby${queryString(filters)}`),
};
