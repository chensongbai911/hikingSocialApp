import Foundation
import Lynx
import AMapFoundationKit
import MAMapKit
import AMapSearchKit

/// 高德地图模块
@objc(AMapModule)
class AMapModule: NSObject, LynxModule {

    static func moduleName() -> String {
        return "AMap"
    }

    private var mapView: MAMapView?
    private var searchAPI: AMapSearchAPI?

    // MARK: - 初始化

    @objc
    func initialize(_ apiKey: String) {
        AMapServices.shared().apiKey = apiKey
        AMapServices.shared().enableHTTPS = true
    }

    // MARK: - 地图操作

    @objc
    func createMap(_ options: [String: Any], callback: LynxCallback) {
        DispatchQueue.main.async { [weak self] in
            let mapView = MAMapView()

            // 设置地图类型
            if let mapType = options["mapType"] as? String {
                switch mapType {
                case "satellite":
                    mapView.mapType = .satellite
                case "night":
                    mapView.mapType = .standardNight
                default:
                    mapView.mapType = .standard
                }
            }

            // 设置中心点
            if let latitude = options["latitude"] as? Double,
               let longitude = options["longitude"] as? Double {
                let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
                mapView.setCenter(center, animated: false)
            }

            // 设置缩放级别
            if let zoom = options["zoom"] as? CGFloat {
                mapView.zoomLevel = zoom
            }

            self?.mapView = mapView

            callback.success(["mapId": "main_map"])
        }
    }

    @objc
    func addMarker(_ options: [String: Any], callback: LynxCallback) {
        guard let mapView = mapView else {
            callback.error("Map not initialized")
            return
        }

        DispatchQueue.main.async {
            guard let latitude = options["latitude"] as? Double,
                  let longitude = options["longitude"] as? Double else {
                callback.error("Invalid coordinates")
                return
            }

            let annotation = MAPointAnnotation()
            annotation.coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
            annotation.title = options["title"] as? String
            annotation.subtitle = options["subtitle"] as? String

            mapView.addAnnotation(annotation)

            callback.success(["markerId": annotation.hash])
        }
    }

    @objc
    func moveCamera(_ options: [String: Any], callback: LynxCallback) {
        guard let mapView = mapView else {
            callback.error("Map not initialized")
            return
        }

        DispatchQueue.main.async {
            guard let latitude = options["latitude"] as? Double,
                  let longitude = options["longitude"] as? Double else {
                callback.error("Invalid coordinates")
                return
            }

            let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
            let animated = options["animated"] as? Bool ?? true

            if let zoom = options["zoom"] as? CGFloat {
                mapView.setZoomLevel(zoom, animated: animated)
            }

            mapView.setCenter(center, animated: animated)

            callback.success(nil)
        }
    }

    // MARK: - 搜索功能

    @objc
    func searchPOI(_ keyword: String, city: String?, callback: @escaping LynxCallback) {
        if searchAPI == nil {
            searchAPI = AMapSearchAPI()
        }

        let request = AMapPOIKeywordsSearchRequest()
        request.keywords = keyword
        request.city = city
        request.requireExtension = true

        searchAPI?.aMapPOIKeywordsSearch(request)

        // 这里需要实现搜索结果的回调处理
        // 简化示例，实际需要实现 AMapSearchDelegate
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            callback.success([
                "pois": []
            ])
        }
    }

    @objc
    func geocode(_ address: String, callback: @escaping LynxCallback) {
        if searchAPI == nil {
            searchAPI = AMapSearchAPI()
        }

        let request = AMapGeocodeSearchRequest()
        request.address = address

        searchAPI?.aMapGeocodeSearch(request)

        // 简化示例
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            callback.success([
                "latitude": 0.0,
                "longitude": 0.0
            ])
        }
    }

    @objc
    func reverseGeocode(_ latitude: Double, longitude: Double, callback: @escaping LynxCallback) {
        if searchAPI == nil {
            searchAPI = AMapSearchAPI()
        }

        let request = AMapReGeocodeSearchRequest()
        request.location = AMapGeoPoint.location(withLatitude: CGFloat(latitude), longitude: CGFloat(longitude))
        request.requireExtension = true

        searchAPI?.aMapReGoecodeSearch(request)

        // 简化示例
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            callback.success([
                "address": "Unknown Location"
            ])
        }
    }
}
