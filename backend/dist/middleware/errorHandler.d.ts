import { Request, Response, NextFunction } from 'express';
/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误并返回统一格式的错误响应
 */
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map