import Foundation
import Lynx

/// 网络请求模块
@objc(NetworkModule)
class NetworkModule: NSObject, LynxModule {

    static func moduleName() -> String {
        return "Network"
    }

    private let session: URLSession

    override init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
        super.init()
    }

    // MARK: - HTTP 请求

    @objc
    func request(_ options: [String: Any], callback: @escaping LynxCallback) {
        guard let urlString = options["url"] as? String,
              let url = URL(string: urlString) else {
            callback.error("Invalid URL")
            return
        }

        var request = URLRequest(url: url)

        // 设置请求方法
        if let method = options["method"] as? String {
            request.httpMethod = method.uppercased()
        } else {
            request.httpMethod = "GET"
        }

        // 设置请求头
        if let headers = options["headers"] as? [String: String] {
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }

        // 设置请求体
        if let body = options["body"] {
            if let bodyString = body as? String {
                request.httpBody = bodyString.data(using: .utf8)
            } else if let bodyDict = body as? [String: Any] {
                do {
                    request.httpBody = try JSONSerialization.data(withJSONObject: bodyDict)
                    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                } catch {
                    callback.error("Failed to serialize body: \(error.localizedDescription)")
                    return
                }
            }
        }

        // 发送请求
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                callback.error(error.localizedDescription)
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                callback.error("Invalid response")
                return
            }

            var responseData: Any = NSNull()
            if let data = data {
                if let jsonObject = try? JSONSerialization.jsonObject(with: data) {
                    responseData = jsonObject
                } else if let text = String(data: data, encoding: .utf8) {
                    responseData = text
                }
            }

            let result: [String: Any] = [
                "status": httpResponse.statusCode,
                "data": responseData,
                "headers": httpResponse.allHeaderFields
            ]

            callback.success(result)
        }

        task.resume()
    }

    @objc
    func get(_ url: String, callback: @escaping LynxCallback) {
        request(["url": url, "method": "GET"], callback: callback)
    }

    @objc
    func post(_ url: String, body: [String: Any], callback: @escaping LynxCallback) {
        request(["url": url, "method": "POST", "body": body], callback: callback)
    }

    @objc
    func put(_ url: String, body: [String: Any], callback: @escaping LynxCallback) {
        request(["url": url, "method": "PUT", "body": body], callback: callback)
    }

    @objc
    func delete(_ url: String, callback: @escaping LynxCallback) {
        request(["url": url, "method": "DELETE"], callback: callback)
    }

    // MARK: - 文件上传

    @objc
    func uploadFile(_ options: [String: Any], callback: @escaping LynxCallback) {
        guard let urlString = options["url"] as? String,
              let url = URL(string: urlString),
              let fileData = options["fileData"] as? String else {
            callback.error("Invalid upload parameters")
            return
        }

        guard let data = Data(base64Encoded: fileData) else {
            callback.error("Invalid file data")
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // 添加文件
        body.append("--\(boundary)\r\n".data(using: .utf8)!)

        let filename = options["filename"] as? String ?? "file"
        let fieldName = options["fieldName"] as? String ?? "file"
        let mimeType = options["mimeType"] as? String ?? "application/octet-stream"

        body.append("Content-Disposition: form-data; name=\"\(fieldName)\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)

        // 添加其他字段
        if let fields = options["fields"] as? [String: String] {
            for (key, value) in fields {
                body.append("--\(boundary)\r\n".data(using: .utf8)!)
                body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
                body.append("\(value)\r\n".data(using: .utf8)!)
            }
        }

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                callback.error(error.localizedDescription)
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                callback.error("Invalid response")
                return
            }

            var responseData: Any = NSNull()
            if let data = data,
               let jsonObject = try? JSONSerialization.jsonObject(with: data) {
                responseData = jsonObject
            }

            callback.success([
                "status": httpResponse.statusCode,
                "data": responseData
            ])
        }

        task.resume()
    }

    // MARK: - 文件下载

    @objc
    func downloadFile(_ url: String, callback: @escaping LynxCallback) {
        guard let downloadURL = URL(string: url) else {
            callback.error("Invalid URL")
            return
        }

        let task = session.downloadTask(with: downloadURL) { localURL, response, error in
            if let error = error {
                callback.error(error.localizedDescription)
                return
            }

            guard let localURL = localURL else {
                callback.error("No file downloaded")
                return
            }

            do {
                let data = try Data(contentsOf: localURL)
                let base64String = data.base64EncodedString()

                callback.success([
                    "data": base64String,
                    "size": data.count
                ])
            } catch {
                callback.error(error.localizedDescription)
            }
        }

        task.resume()
    }
}
