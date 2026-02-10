import Foundation
import Lynx

/// 本地存储模块
@objc(StorageModule)
class StorageModule: NSObject, LynxModule {

    static func moduleName() -> String {
        return "Storage"
    }

    private let userDefaults = UserDefaults.standard
    private let fileManager = FileManager.default

    // MARK: - UserDefaults 操作

    @objc
    func setItem(_ key: String, value: String, callback: LynxCallback) {
        userDefaults.set(value, forKey: key)
        userDefaults.synchronize()
        callback.success(nil)
    }

    @objc
    func getItem(_ key: String, callback: LynxCallback) {
        if let value = userDefaults.string(forKey: key) {
            callback.success(["value": value])
        } else {
            callback.success(["value": NSNull()])
        }
    }

    @objc
    func removeItem(_ key: String, callback: LynxCallback) {
        userDefaults.removeObject(forKey: key)
        userDefaults.synchronize()
        callback.success(nil)
    }

    @objc
    func clear(_ callback: LynxCallback) {
        if let bundleID = Bundle.main.bundleIdentifier {
            userDefaults.removePersistentDomain(forName: bundleID)
            userDefaults.synchronize()
        }
        callback.success(nil)
    }

    @objc
    func getAllKeys(_ callback: LynxCallback) {
        let dict = userDefaults.dictionaryRepresentation()
        let keys = Array(dict.keys)
        callback.success(["keys": keys])
    }

    // MARK: - 文件操作

    @objc
    func writeFile(_ path: String, content: String, callback: LynxCallback) {
        guard let documentsPath = getDocumentsPath() else {
            callback.error("Documents directory not found")
            return
        }

        let filePath = documentsPath.appendingPathComponent(path)

        do {
            // 创建目录
            let directory = filePath.deletingLastPathComponent()
            try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)

            // 写入文件
            try content.write(to: filePath, atomically: true, encoding: .utf8)
            callback.success(["path": filePath.path])
        } catch {
            callback.error(error.localizedDescription)
        }
    }

    @objc
    func readFile(_ path: String, callback: LynxCallback) {
        guard let documentsPath = getDocumentsPath() else {
            callback.error("Documents directory not found")
            return
        }

        let filePath = documentsPath.appendingPathComponent(path)

        do {
            let content = try String(contentsOf: filePath, encoding: .utf8)
            callback.success(["content": content])
        } catch {
            callback.error(error.localizedDescription)
        }
    }

    @objc
    func deleteFile(_ path: String, callback: LynxCallback) {
        guard let documentsPath = getDocumentsPath() else {
            callback.error("Documents directory not found")
            return
        }

        let filePath = documentsPath.appendingPathComponent(path)

        do {
            try fileManager.removeItem(at: filePath)
            callback.success(nil)
        } catch {
            callback.error(error.localizedDescription)
        }
    }

    @objc
    func fileExists(_ path: String, callback: LynxCallback) {
        guard let documentsPath = getDocumentsPath() else {
            callback.error("Documents directory not found")
            return
        }

        let filePath = documentsPath.appendingPathComponent(path)
        let exists = fileManager.fileExists(atPath: filePath.path)
        callback.success(["exists": exists])
    }

    @objc
    func listFiles(_ path: String, callback: LynxCallback) {
        guard let documentsPath = getDocumentsPath() else {
            callback.error("Documents directory not found")
            return
        }

        let directoryPath = documentsPath.appendingPathComponent(path)

        do {
            let files = try fileManager.contentsOfDirectory(atPath: directoryPath.path)
            callback.success(["files": files])
        } catch {
            callback.error(error.localizedDescription)
        }
    }

    // MARK: - 辅助方法

    private func getDocumentsPath() -> URL? {
        return fileManager.urls(for: .documentDirectory, in: .userDomainMask).first
    }
}
