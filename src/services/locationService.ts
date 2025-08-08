const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface Location {
    id: number;
    name: string;
    prefecture: string;
    is_active: boolean;
    sort_order: number;
}

export const locationService = {
    async getActiveLocations(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/locations/active`);
        if (!response.ok) {
            throw new Error('Failed to fetch locations');
        }
        return await response.json();
    },

    async getAllLocations(): Promise<Location[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/locations`);
            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }
            const data = await response.json();
            return data.locations || [];
        } catch (error) {
            console.error('Error fetching all locations:', error);
            return [];
        }
    }
}; 