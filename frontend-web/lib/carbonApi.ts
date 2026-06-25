export interface CarbonData {
  _id: string;
  userId: string;
  electricityKwh: number;
  carKm: number;
  publicTransportKm: number;
  dietType: 'heavy-meat' | 'balanced' | 'vegetarian';
  totalCarbonFootprint: number;
  breakdown: {
    electricity: number;
    car: number;
    publicTransport: number;
    diet: number;
  };
  createdAt: string;
}

export interface CarbonCalculationInput {
  electricityKwh: number;
  carKm: number;
  publicTransportKm: number;
  dietType: 'heavy-meat' | 'balanced' | 'vegetarian';
}

export interface CarbonStats {
  avgTotalFootprint: number;
  avgElectricity: number;
  avgCar: number;
  avgPublicTransport: number;
  avgDiet: number;
  maxFootprint: number;
  minFootprint: number;
  count: number;
}

const API_BASE_URL = 'https://eco-platform-backend.onrender.com/api/carbon';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export async function calculateCarbonFootprint(data: CarbonCalculationInput): Promise<CarbonData> {
  const response = await fetch(`${API_BASE_URL}/calculate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to calculate carbon footprint');
  }

  const result = await response.json();
  return result.data;
}

export async function getCarbonHistory(limit: number = 10): Promise<CarbonData[]> {
  const response = await fetch(`${API_BASE_URL}/history?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch carbon history');
  }

  const result = await response.json();
  return result.data;
}

export async function getLatestCarbon(): Promise<CarbonData> {
  const response = await fetch(`${API_BASE_URL}/latest`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch latest carbon data');
  }

  const result = await response.json();
  return result.data;
}

export async function getCarbonStats(days: number = 30): Promise<CarbonStats> {
  const response = await fetch(`${API_BASE_URL}/stats?days=${days}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch carbon statistics');
  }

  return await response.json();
}
