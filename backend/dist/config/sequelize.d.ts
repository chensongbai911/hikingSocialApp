import { Sequelize } from 'sequelize';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { Application } from '../models/Application';
import { Friendship } from '../models/Friendship';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { UserPreference } from '../models/UserPreference';
import { UserPhoto } from '../models/UserPhoto';
import { ActivityPhoto } from '../models/ActivityPhoto';
import { Participation } from '../models/Participation';
export declare const sequelize: Sequelize;
export declare function initializeModels(): void;
export declare function testSequelizeConnection(): Promise<boolean>;
export { User, Activity, Application, Friendship, Conversation, Message, UserPreference, UserPhoto, ActivityPhoto, Participation, };
//# sourceMappingURL=sequelize.d.ts.map