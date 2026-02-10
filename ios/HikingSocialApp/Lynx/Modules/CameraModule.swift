import Foundation
import Lynx
import UIKit
import Photos

/// 相机和相册模块
@objc(CameraModule)
class CameraModule: NSObject, LynxModule {

    static func moduleName() -> String {
        return "Camera"
    }

    private weak var currentViewController: UIViewController?
    private var currentCallback: LynxCallback?

    // MARK: - 权限检查

    @objc
    func checkCameraPermission(_ callback: LynxCallback) {
        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .authorized:
            callback.success(["granted": true])
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                callback.success(["granted": granted])
            }
        case .denied, .restricted:
            callback.success(["granted": false])
        @unknown default:
            callback.success(["granted": false])
        }
    }

    @objc
    func checkPhotoLibraryPermission(_ callback: LynxCallback) {
        let status = PHPhotoLibrary.authorizationStatus()

        switch status {
        case .authorized, .limited:
            callback.success(["granted": true])
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization { newStatus in
                callback.success(["granted": newStatus == .authorized || newStatus == .limited])
            }
        case .denied, .restricted:
            callback.success(["granted": false])
        @unknown default:
            callback.success(["granted": false])
        }
    }

    // MARK: - 拍照

    @objc
    func takePhoto(_ options: [String: Any], callback: @escaping LynxCallback) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            let picker = UIImagePickerController()
            picker.sourceType = .camera
            picker.delegate = self
            picker.allowsEditing = options["allowsEditing"] as? Bool ?? false

            self.currentCallback = callback

            if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
                self.currentViewController = rootVC
                rootVC.present(picker, animated: true)
            } else {
                callback.error("No root view controller")
            }
        }
    }

    // MARK: - 选择照片

    @objc
    func pickImage(_ options: [String: Any], callback: @escaping LynxCallback) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            let picker = UIImagePickerController()
            picker.sourceType = .photoLibrary
            picker.delegate = self
            picker.allowsEditing = options["allowsEditing"] as? Bool ?? false

            self.currentCallback = callback

            if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
                self.currentViewController = rootVC
                rootVC.present(picker, animated: true)
            } else {
                callback.error("No root view controller")
            }
        }
    }

    // MARK: - 保存图片

    @objc
    func saveImage(_ base64String: String, callback: @escaping LynxCallback) {
        guard let imageData = Data(base64Encoded: base64String),
              let image = UIImage(data: imageData) else {
            callback.error("Invalid image data")
            return
        }

        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        }) { success, error in
            if success {
                callback.success(["saved": true])
            } else {
                callback.error(error?.localizedDescription ?? "Save failed")
            }
        }
    }
}

// MARK: - UIImagePickerControllerDelegate

extension CameraModule: UIImagePickerControllerDelegate, UINavigationControllerDelegate {

    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {

        var selectedImage: UIImage?

        if let editedImage = info[.editedImage] as? UIImage {
            selectedImage = editedImage
        } else if let originalImage = info[.originalImage] as? UIImage {
            selectedImage = originalImage
        }

        picker.dismiss(animated: true) { [weak self] in
            guard let self = self, let image = selectedImage else {
                self?.currentCallback?.error("No image selected")
                return
            }

            // 压缩图片
            let maxSize: CGFloat = 1920
            let scaledImage = self.scaleImage(image, maxSize: maxSize)

            // 转换为 base64
            if let imageData = scaledImage.jpegData(compressionQuality: 0.8) {
                let base64String = imageData.base64EncodedString()

                self.currentCallback?.success([
                    "uri": base64String,
                    "width": scaledImage.size.width,
                    "height": scaledImage.size.height,
                    "size": imageData.count
                ])
            } else {
                self.currentCallback?.error("Failed to process image")
            }

            self.currentCallback = nil
        }
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true) { [weak self] in
            self?.currentCallback?.error("User cancelled")
            self?.currentCallback = nil
        }
    }

    // MARK: - 辅助方法

    private func scaleImage(_ image: UIImage, maxSize: CGFloat) -> UIImage {
        let size = image.size
        let maxDimension = max(size.width, size.height)

        if maxDimension <= maxSize {
            return image
        }

        let scale = maxSize / maxDimension
        let newSize = CGSize(width: size.width * scale, height: size.height * scale)

        UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
        image.draw(in: CGRect(origin: .zero, size: newSize))
        let scaledImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()

        return scaledImage ?? image
    }
}
