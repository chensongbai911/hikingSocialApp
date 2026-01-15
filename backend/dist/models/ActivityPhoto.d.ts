import { Model, Sequelize, ForeignKey } from 'sequelize';
import { Activity } from './Activity';
export interface ActivityPhotoAttributes {
    id: string;
    activityId: ForeignKey<Activity['id']>;
    photoUrl: string;
    isCover: boolean;
    sortOrder: number;
    createdAt: Date;
}
export declare class ActivityPhoto extends Model<ActivityPhotoAttributes> implements ActivityPhotoAttributes {
    id: string;
    activityId: ForeignKey<Activity['id']>;
    photoUrl: string;
    isCover: boolean;
    sortOrder: number;
    readonly createdAt: Date;
    static initialize(sequelize: Sequelize): typeof ActivityPhoto;
}
//# sourceMappingURL=ActivityPhoto.d.ts.map