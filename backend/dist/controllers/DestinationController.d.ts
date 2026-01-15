import { Request, Response } from 'express';
export declare class DestinationController {
    getDestinations(req: Request, res: Response): Promise<void>;
    getDestinationById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPopularDestinations(req: Request, res: Response): Promise<void>;
    getNearbyDestinations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    recordSearch(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSearchHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleFavorite(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getFavorites(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: DestinationController;
export default _default;
//# sourceMappingURL=DestinationController.d.ts.map