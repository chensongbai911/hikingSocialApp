/**
 * 轨迹控制器
 * 创建日期: 2026-01-19
 */
import { Request, Response } from 'express';
/**
 * 创建轨迹
 */
export declare const createTrack: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 批量上传轨迹点
 */
export declare const uploadTrackPoints: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 完成轨迹
 */
export declare const completeTrack: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取轨迹列表
 */
export declare const getTrackList: (req: Request, res: Response) => Promise<void>;
/**
 * 获取轨迹详情
 */
export declare const getTrackDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 删除轨迹
 */
export declare const deleteTrack: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=track.controller.d.ts.map