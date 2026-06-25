export interface Casualties {
  deaths: number;
  injured: number;
  missing: number;
}

export interface NaturalDisaster {
  _id: string;
  disasterType: string;
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
  };
  severity: string;
  magnitude: number | null;
  affectedArea: string;
  casualties: Casualties;
  status: string;
  startDate: string;
  endDate: string | null;
  source: string;
  imageUrl: string;
  createdAt: string;
}

export interface DisasterStats {
  byType: Array<{
    _id: string;
    count: number;
    totalDeaths: number;
    totalInjured: number;
  }>;
  activeCount: number;
  totalCount: number;
}

const API_BASE_URL = 'https://eco-platform-backend.onrender.com/api/disasters';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export async function getActiveDisasters(limit: number = 50): Promise<NaturalDisaster[]> {
  const response = await fetch(`${API_BASE_URL}/active/list?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch active disasters');
  }

  const result = await response.json();
  return result.data;
}

export async function getDisasterStats(days: number = 30): Promise<DisasterStats> {
  const response = await fetch(`${API_BASE_URL}/stats/overview?days=${days}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch disaster statistics');
  }

  const result = await response.json();
  return result.data;
}

export async function getAllDisasters(filters?: {
  limit?: number;
  disasterType?: string;
  status?: string;
  city?: string;
}): Promise<NaturalDisaster[]> {
  const params = new URLSearchParams();
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.disasterType) params.append('disasterType', filters.disasterType);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.city) params.append('city', filters.city);

  const response = await fetch(`${API_BASE_URL}/all?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch disasters');
  }

  const result = await response.json();
  return result.data;
}

export async function getDisasterById(id: string): Promise<NaturalDisaster> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch disaster');
  }

  const result = await response.json();
  return result.data;
}

export async function createDisaster(data: Partial<NaturalDisaster>): Promise<NaturalDisaster> {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create disaster');
  }

  const result = await response.json();
  return result.data;
}

export async function updateDisaster(id: string, data: Partial<NaturalDisaster>): Promise<NaturalDisaster> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update disaster');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteDisaster(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete disaster');
  }
}
