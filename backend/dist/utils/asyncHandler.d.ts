import { Request, Response, NextFunction } from 'express';
/**
 * Wraps async route handlers to catch errors and pass to next()
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
export default asyncHandler;
//# sourceMappingURL=asyncHandler.d.ts.map