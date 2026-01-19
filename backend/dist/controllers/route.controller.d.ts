/**
 * 路线控制器
 * 创建日期: 2026-01-19
 */
import { Request, Response } from 'express';
/**
 * 获取路线列表
 */
export declare const getRouteList: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取路线详情
 */
export declare const getRouteDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 创建路线
 */
export declare const createRoute: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 更新路线
 */
export declare const updateRoute: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 删除路线
 */
export declare const deleteRoute: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=route.controller.d.ts.map