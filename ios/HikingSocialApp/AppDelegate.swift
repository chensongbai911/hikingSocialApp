import UIKit
import Lynx

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // 初始化 Lynx
        setupLynx()

        // 创建主窗口
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.backgroundColor = .white

        // 创建 Lynx 视图控制器
        let lynxViewController = createLynxViewController()
        window?.rootViewController = lynxViewController
        window?.makeKeyAndVisible()

        return true
    }

    // MARK: - Lynx 设置

    private func setupLynx() {
        // Lynx 配置
        let config = LynxConfig.shared

        #if DEBUG
        // 开发环境：启用 DevTools
        config.enableDevtools = true
        config.debugMode = true
        #endif

        // 设置日志级别
        config.logLevel = .verbose

        // 注册自定义模块
        registerLynxModules()
    }

    private func createLynxViewController() -> UIViewController {
        // 创建 Lynx Runtime
        let runtime = LynxRuntime()

        // 加载 JavaScript Bundle
        let bundleURL = getBundleURL()

        // 创建 Lynx View
        let lynxView = LynxView(frame: UIScreen.main.bounds)
        lynxView.runtime = runtime

        // 加载页面
        lynxView.loadURL(bundleURL)

        // 创建视图控制器
        let viewController = UIViewController()
        viewController.view = lynxView

        return viewController
    }

    private func getBundleURL() -> URL {
        #if DEBUG
        // 开发环境：从本地服务器加载
        if let url = URL(string: "http://localhost:5173") {
            return url
        }
        #endif

        // 生产环境：从应用 Bundle 加载
        let bundlePath = Bundle.main.path(forResource: "main", ofType: "jsbundle")
        return URL(fileURLWithPath: bundlePath ?? "")
    }

    private func registerLynxModules() {
        // 注册高德地图模块
        LynxModuleRegistry.shared.register(AMapModule.self, forName: "AMap")

        // 注册相机模块
        LynxModuleRegistry.shared.register(CameraModule.self, forName: "Camera")

        // 注册位置模块
        LynxModuleRegistry.shared.register(LocationModule.self, forName: "Location")

        // 注册存储模块
        LynxModuleRegistry.shared.register(StorageModule.self, forName: "Storage")

        // 注册网络模块
        LynxModuleRegistry.shared.register(NetworkModule.self, forName: "Network")
    }

    // MARK: - UISceneSession Lifecycle (iOS 13+)

    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    @available(iOS 13.0, *)
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
    }

}
