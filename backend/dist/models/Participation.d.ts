import { Model, Sequelize, ForeignKey } from 'sequelize';
import { User } from './User';
import { Activity } from './Activity';
export interface ParticipationAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    activityId: ForeignKey<Activity['id']>;
    status: 'joined' | 'completed' | 'cancelled';
    joinedAt: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    feedback?: string;
    rating?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Participation extends Model<ParticipationAttributes> implements ParticipationAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    activityId: ForeignKey<Activity['id']>;
    status: 'joined' | 'completed' | 'cancelled';
    joinedAt: Date;
    completedAt: Date | undefined;
    cancelledAt: Date | undefined;
    feedback: string | undefined;
    rating: number | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): typeof Participation;
    static associate(): void;
}
export default Participation;
//# sourceMappingURL=Participation.d.ts.map