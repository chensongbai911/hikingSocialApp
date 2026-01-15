import { Model, Sequelize, ForeignKey } from 'sequelize';
import { User } from './User';
export interface FriendshipAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    friendId: ForeignKey<User['id']>;
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    initiatedBy: ForeignKey<User['id']>;
    message: string | null;
    acceptedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Friendship extends Model<FriendshipAttributes> implements FriendshipAttributes {
    id: number;
    userId: ForeignKey<User['id']>;
    friendId: ForeignKey<User['id']>;
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    initiatedBy: ForeignKey<User['id']>;
    message: string | null;
    acceptedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): typeof Friendship;
    static associate(): void;
}
export default Friendship;
//# sourceMappingURL=Friendship.d.ts.map