import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadSingle: (fieldName?: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMultiple: (fieldName?: string, maxFiles?: number) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getFileUrl: (filename: string, type?: string) => string;
export default upload;
//# sourceMappingURL=uploadHandler.d.ts.map