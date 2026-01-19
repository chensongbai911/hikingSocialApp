import { Model, Sequelize, ForeignKey } from 'sequelize';
import { User } from './User';
export interface ActivityAttributes {
    id: string;
    creatorId: ForeignKey<User['id']>;
    title: string;
    description: string;
    coverImageUrl?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    startTime: Date;
    endTime: Date;
    distance?: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    type?: string;
    status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled';
    routeDescription?: string;
    equipmentRequired?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare class Activity extends Model<ActivityAttributes> implements ActivityAttributes {
    id: string;
    creatorId: ForeignKey<User['id']>;
    title: string;
    description: string;
    coverImageUrl: string | undefined;
    location: string;
    latitude: number | undefined;
    longitude: number | undefined;
    startTime: Date;
    endTime: Date;
    distance: number | undefined;
    difficulty: 'easy' | 'moderate' | 'hard';
    type: string | undefined;
    status: 'pending' | 'approved' | 'ongoing' | 'completed' | 'cancelled';
    routeDescription: string | undefined;
    equipmentRequired: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | undefined;
    static initialize(sequelize: Sequelize): typeof Activity;
    static associate(): void;
}
export default Activity;
//# sourceMappingURL=Activity.d.ts.map