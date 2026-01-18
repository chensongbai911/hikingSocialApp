import { Request, Response } from 'express';
export declare class DestinationController {
    getDestinations(req: Request, res: Response): Promise<void>;
    getDestinationById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getPopularDestinations(req: Request, res: Response): Promise<void>;
    getNearbyDestinations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    recordSearch(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSearchHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    toggleFavorite(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getFavorites(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: DestinationController;
export default _default;
//# sourceMappingURL=DestinationController.d.ts.map