import { Model, Sequelize, ForeignKey } from 'sequelize';
import { User } from './User';
export interface UserPhotoAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    photoUrl: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UserPhoto extends Model<UserPhotoAttributes> implements UserPhotoAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    photoUrl: string;
    sortOrder: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): typeof UserPhoto;
    static associate(): void;
}
export default UserPhoto;
//# sourceMappingURL=UserPhoto.d.ts.map