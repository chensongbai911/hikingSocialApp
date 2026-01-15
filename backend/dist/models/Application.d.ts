import { Model, Sequelize, ForeignKey } from 'sequelize';
import { User } from './User';
import { Activity } from './Activity';
export interface ApplicationAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    activityId: ForeignKey<Activity['id']>;
    status: 'pending' | 'approved' | 'rejected';
    message: string | null;
    reviewedAt: Date | null;
    reviewedBy: ForeignKey<User['id']> | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Application extends Model<ApplicationAttributes> implements ApplicationAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    activityId: ForeignKey<Activity['id']>;
    status: 'pending' | 'approved' | 'rejected';
    message: string | null;
    reviewedAt: Date | null;
    reviewedBy: ForeignKey<User['id']> | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): typeof Application;
    static associate(): void;
}
export default Application;
//# sourceMappingURL=Application.d.ts.map