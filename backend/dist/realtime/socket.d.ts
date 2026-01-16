import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
export declare function initSocket(server: HttpServer): void;
export declare function emitToUser(userId: string, event: string, data: any): void;
export declare function getIO(): Server | null;
//# sourceMappingURL=socket.d.ts.map