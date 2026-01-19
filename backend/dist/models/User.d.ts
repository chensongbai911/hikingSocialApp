import { Model, Sequelize } from 'sequelize';
export interface UserAttributes {
    id: string;
    email: string;
    passwordHash: string;
    nickname: string;
    avatarUrl?: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    bio?: string;
    hikingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
export declare class User extends Model<UserAttributes> implements UserAttributes {
    id: string;
    email: string;
    passwordHash: string;
    nickname: string;
    avatarUrl: string | undefined;
    gender: 'male' | 'female' | 'other' | undefined;
    age: number | undefined;
    bio: string | undefined;
    hikingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | undefined;
    isActive: boolean;
    isVerified: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    deletedAt: Date | undefined;
    static initialize(sequelize: Sequelize): typeof User;
}
export default User;
//# sourceMappingURL=User.d.ts.map