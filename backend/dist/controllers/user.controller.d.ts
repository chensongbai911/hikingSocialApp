/**
 * 用户控制器
 * 创建日期: 2026-01-19
 */
import { Request, Response } from 'express';
/**
 * 用户注册
 */
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 用户登录
 */
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取当前用户信息
 */
export declare const getCurrentUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 获取用户信息（公开）
 */
export declare const getUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 更新用户信息
 */
export declare const updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * 上传头像
 */
export declare const uploadAvatar: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=user.controller.d.ts.map