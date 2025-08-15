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
        const locations = await response.json();
        
        // Remove duplicates to prevent React key warnings
        return Array.from(new Set(locations));
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
    },

    async getSublocationsByPrefecture(): Promise<Record<string, string[]>> {
        try {
            // Prefer a public endpoint if available; fallback to admin list
            const all = await this.getAllLocations();
            const grouped: Record<string, string[]> = {};
            for (const loc of all) {
                if (!loc.is_active) continue;
                const prefecture = loc.prefecture || loc.name; // fallback
                if (!grouped[prefecture]) grouped[prefecture] = [];
                // Use name as sublocation when prefecture differs
                if (loc.name && loc.name !== prefecture) {
                    grouped[prefecture].push(loc.name);
                }
            }
            // Remove duplicates and sort
            Object.keys(grouped).forEach(key => {
                grouped[key] = Array.from(new Set(grouped[key])).sort();
            });
            return grouped;
        } catch (e) {
            console.error('Error fetching sublocations by prefecture:', e);
            return {};
        }
    },

    async getPrefecturesByLocation(): Promise<Record<string, string[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/locations/prefectures`);
            if (!response.ok) {
                throw new Error('Failed to fetch prefectures by location');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching prefectures by location:', error);
            return {};
        }
    }
}; 