import { Model, Sequelize } from 'sequelize';
export interface ApplicationAttributes {
    id: number;
    userId: string;
    activityId: string;
    status: 'pending' | 'approved' | 'rejected';
    message: string | null;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Application extends Model<ApplicationAttributes> implements ApplicationAttributes {
    id: number;
    userId: string;
    activityId: string;
    status: 'pending' | 'approved' | 'rejected';
    message: string | null;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): typeof Application;
    static associate(): void;
}
export default Application;
//# sourceMappingURL=Application.d.ts.map