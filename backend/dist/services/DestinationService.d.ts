export interface Destination {
    id: number;
    name: string;
    description?: string;
    area: string;
    district?: string;
    latitude: number;
    longitude: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    distance?: number;
    elevation_gain?: number;
    cover_image?: string;
    photos?: string[];
    popularity_score: number;
    visit_count: number;
    activity_count: number;
    rating: number;
    tags?: string;
    facilities?: string;
    opening_hours?: string;
    ticket_price?: number;
    contact_phone?: string;
    address?: string;
    transportation?: string;
    tips?: string;
    best_season?: string;
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
    user_distance?: number;
    is_favorited?: boolean;
}
export interface DestinationFilters {
    keyword?: string;
    area?: string;
    difficulty?: string;
    minDistance?: number;
    maxDistance?: number;
    sortBy?: 'distance' | 'popularity' | 'rating' | 'activity_count';
    latitude?: number;
    longitude?: number;
    limit?: number;
    offset?: number;
}
export declare class DestinationService {
    private calculateDistance;
    private toRad;
    getDestinations(filters?: DestinationFilters, userId?: string): Promise<{
        destinations: Destination[];
        total: number;
    }>;
    getDestinationById(id: number, userId?: string): Promise<Destination | null>;
    getPopularDestinations(limit?: number, userId?: string): Promise<Destination[]>;
    getNearbyDestinations(latitude: number, longitude: number, radius?: number, limit?: number, userId?: string): Promise<Destination[]>;
    addSearchHistory(userId: number, keyword?: string, destinationId?: number): Promise<void>;
    getSearchHistory(userId: number, limit?: number): Promise<string[]>;
    toggleFavorite(userId: number, destinationId: number): Promise<boolean>;
    getFavoriteDestinations(userId: number): Promise<Destination[]>;
}
declare const _default: DestinationService;
export default _default;
//# sourceMappingURL=DestinationService.d.ts.map