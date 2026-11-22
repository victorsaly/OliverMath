import Capacitor
import Foundation
import StoreKit

/// The one purchase the app has: unlocking the full game.
///
/// StoreKit 2, straight from the App Store, with no third-party SDK in
/// between: a children's app should not hand purchase data to anyone else.
/// There are no accounts. The App Store remembers the purchase against the
/// family's Apple ID, so "Restore" brings it back on another device.
@objc(DevicePurchasesPlugin)
public class DevicePurchasesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DevicePurchasesPlugin"
    public let jsName = "DevicePurchases"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "product", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    private var updates: Task<Void, Never>?

    /// Purchases can complete outside the app: approved later by a parent
    /// ("Ask to Buy"), or made on another device. The game is told when one
    /// arrives so it can unlock without being restarted.
    override public func load() {
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                guard case .verified(let transaction) = result else { continue }
                await transaction.finish()
                self?.notifyListeners("purchaseUpdated", data: [
                    "productId": transaction.productID,
                    "unlocked": transaction.revocationDate == nil
                ])
            }
        }
    }

    deinit {
        updates?.cancel()
    }

    /// What the store says about the product: `{ available, price, title }`.
    /// The price comes back already formatted for the family's country.
    @objc func product(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.resolve(["available": false])
                    return
                }
                call.resolve([
                    "available": true,
                    "price": product.displayPrice,
                    "title": product.displayName
                ])
            } catch {
                call.resolve(["available": false, "reason": error.localizedDescription])
            }
        }
    }

    /// Whether the full game is owned on this Apple ID: `{ unlocked }`.
    @objc func status(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            call.resolve(["unlocked": await Self.owns(productId)])
        }
    }

    /// Start the purchase. Resolves `{ unlocked, cancelled, pending }`.
    /// `pending` means a parent has been asked and has not answered yet.
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.reject("The full game is not available to buy right now.")
                    return
                }
                switch try await product.purchase() {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else {
                        call.reject("The purchase could not be verified.")
                        return
                    }
                    await transaction.finish()
                    call.resolve(["unlocked": true, "cancelled": false, "pending": false])
                case .userCancelled:
                    call.resolve(["unlocked": false, "cancelled": true, "pending": false])
                case .pending:
                    call.resolve(["unlocked": false, "cancelled": false, "pending": true])
                @unknown default:
                    call.resolve(["unlocked": false, "cancelled": false, "pending": false])
                }
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    /// Ask the App Store again what this Apple ID owns. Resolves `{ unlocked }`.
    @objc func restore(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                try await AppStore.sync()
            } catch {
                // Cancelled sign-in, or no connection. What is already known
                // on the device is still reported below.
            }
            call.resolve(["unlocked": await Self.owns(productId)])
        }
    }

    private static func owns(_ productId: String) async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == productId,
               transaction.revocationDate == nil {
                return true
            }
        }
        return false
    }
}
