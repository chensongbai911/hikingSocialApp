import Lynx
import Foundation

/// Lynx 模块协议定义
protocol LynxModule {
    static func moduleName() -> String
}

/// Lynx 回调协议定义
protocol LynxCallback {
    func success(_ data: Any?)
    func error(_ message: String)
}

/// 默认回调实现
class DefaultLynxCallback: LynxCallback {
    private let successHandler: ((Any?) -> Void)?
    private let errorHandler: ((String) -> Void)?

    init(success: ((Any?) -> Void)? = nil, error: ((String) -> Void)? = nil) {
        self.successHandler = success
        self.errorHandler = error
    }

    func success(_ data: Any?) {
        DispatchQueue.main.async {
            self.successHandler?(data)
        }
    }

    func error(_ message: String) {
        DispatchQueue.main.async {
            self.errorHandler?(message)
        }
    }
}

/// 模块注册器
class ModuleRegistry {
    static let shared = ModuleRegistry()

    private var modules: [String: LynxModule.Type] = [:]

    private init() {}

    func register(_ moduleType: LynxModule.Type) {
        let name = moduleType.moduleName()
        modules[name] = moduleType
    }

    func getModule(_ name: String) -> LynxModule.Type? {
        return modules[name]
    }

    func getAllModules() -> [String: LynxModule.Type] {
        return modules
    }
}
