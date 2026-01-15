import { Model, Sequelize, ForeignKey } from 'sequelize';
import { User } from './User';
export interface UserPreferenceAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    preferenceType: 'time' | 'type' | 'special' | 'distance' | 'interest';
    preferenceValue: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserPreference extends Model<UserPreferenceAttributes> implements UserPreferenceAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    preferenceType: 'time' | 'type' | 'special' | 'distance' | 'interest';
    preferenceValue: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): typeof UserPreference;
    static associate(): void;
}
export default UserPreference;
//# sourceMappingURL=UserPreference.d.ts.map