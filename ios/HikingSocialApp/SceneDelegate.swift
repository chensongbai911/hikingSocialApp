import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        // 创建窗口
        let window = UIWindow(windowScene: windowScene)

        // 获取根视图控制器（由 AppDelegate 中的 Lynx 创建）
        if let rootVC = (UIApplication.shared.delegate as? AppDelegate)?.rootViewController {
            window.rootViewController = rootVC
        }

        window.makeKeyAndVisible()
        self.window = window
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // 场景断开连接时调用
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // 场景变为活跃状态时调用
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // 场景即将变为非活跃状态时调用
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // 场景即将进入前台时调用
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // 场景已进入后台时调用
    }
}
