import Foundation
import Lynx
import CoreLocation

/// 定位模块
@objc(LocationModule)
class LocationModule: NSObject, LynxModule {

    static func moduleName() -> String {
        return "Location"
    }

    private var locationManager: CLLocationManager?
    private var currentCallback: LynxCallback?

    override init() {
        super.init()
        setupLocationManager()
    }

    private func setupLocationManager() {
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
    }

    // MARK: - 权限

    @objc
    func checkPermission(_ callback: LynxCallback) {
        let status = CLLocationManager.authorizationStatus()

        switch status {
        case .authorizedWhenInUse, .authorizedAlways:
            callback.success(["granted": true, "status": "authorized"])
        case .notDetermined:
            callback.success(["granted": false, "status": "notDetermined"])
        case .denied:
            callback.success(["granted": false, "status": "denied"])
        case .restricted:
            callback.success(["granted": false, "status": "restricted"])
        @unknown default:
            callback.success(["granted": false, "status": "unknown"])
        }
    }

    @objc
    func requestPermission(_ callback: @escaping LynxCallback) {
        let status = CLLocationManager.authorizationStatus()

        if status == .notDetermined {
            currentCallback = callback
            locationManager?.requestWhenInUseAuthorization()
        } else {
            checkPermission(callback)
        }
    }

    // MARK: - 获取位置

    @objc
    func getCurrentLocation(_ callback: @escaping LynxCallback) {
        guard let manager = locationManager else {
            callback.error("Location manager not initialized")
            return
        }

        let status = CLLocationManager.authorizationStatus()
        guard status == .authorizedWhenInUse || status == .authorizedAlways else {
            callback.error("Location permission not granted")
            return
        }

        currentCallback = callback
        manager.requestLocation()
    }

    @objc
    func startWatchingLocation(_ callback: @escaping LynxCallback) {
        guard let manager = locationManager else {
            callback.error("Location manager not initialized")
            return
        }

        currentCallback = callback
        manager.startUpdatingLocation()
    }

    @objc
    func stopWatchingLocation(_ callback: LynxCallback) {
        locationManager?.stopUpdatingLocation()
        currentCallback = nil
        callback.success(nil)
    }
}

// MARK: - CLLocationManagerDelegate

extension LocationModule: CLLocationManagerDelegate {

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }

        let locationData: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "altitude": location.altitude,
            "accuracy": location.horizontalAccuracy,
            "speed": location.speed,
            "heading": location.course,
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000
        ]

        currentCallback?.success(locationData)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        currentCallback?.error(error.localizedDescription)
        currentCallback = nil
    }

    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        guard let callback = currentCallback else { return }

        switch status {
        case .authorizedWhenInUse, .authorizedAlways:
            callback.success(["granted": true, "status": "authorized"])
        case .denied:
            callback.success(["granted": false, "status": "denied"])
        case .restricted:
            callback.success(["granted": false, "status": "restricted"])
        default:
            break
        }

        currentCallback = nil
    }
}
