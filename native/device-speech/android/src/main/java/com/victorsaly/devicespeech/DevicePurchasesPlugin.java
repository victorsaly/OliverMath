package com.victorsaly.devicespeech;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;

/**
 * The one purchase the app has: unlocking the full game.
 *
 * Google Play Billing directly, with no third-party SDK in between. There are
 * no accounts: Play remembers the purchase against the family's Google
 * account, so "Restore" brings it back on another device.
 */
@CapacitorPlugin(name = "DevicePurchases")
public class DevicePurchasesPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient billing;
    private PluginCall purchaseCall;
    private String purchaseProductId;

    @Override
    public void load() {
        billing = BillingClient
            .newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build();
    }

    private interface Ready {
        void run(boolean connected);
    }

    private void whenConnected(Ready then) {
        if (billing.isReady()) {
            then.run(true);
            return;
        }
        billing.startConnection(
            new BillingClientStateListener() {
                @Override
                public void onBillingSetupFinished(BillingResult result) {
                    then.run(result.getResponseCode() == BillingClient.BillingResponseCode.OK);
                }

                @Override
                public void onBillingServiceDisconnected() {
                    // The next call connects again.
                }
            }
        );
    }

    private interface Details {
        void found(ProductDetails details);
    }

    private void queryProduct(String productId, Details then) {
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product
            .newBuilder()
            .setProductId(productId)
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        QueryProductDetailsParams params = QueryProductDetailsParams
            .newBuilder()
            .setProductList(Collections.singletonList(product))
            .build();
        billing.queryProductDetailsAsync(
            params,
            (result, list) -> then.found(
                result.getResponseCode() == BillingClient.BillingResponseCode.OK && list != null && !list.isEmpty() ? list.get(0) : null
            )
        );
    }

    private interface Owned {
        void answer(boolean owned);
    }

    /** Does this Google account own the product? Also acknowledges it if Play is still waiting for that. */
    private void queryOwned(String productId, Owned then) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build();
        billing.queryPurchasesAsync(
            params,
            (result, purchases) -> {
                boolean owned = false;
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                    for (Purchase purchase : purchases) {
                        if (purchase.getProducts().contains(productId) && purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                            owned = true;
                            acknowledge(purchase);
                        }
                    }
                }
                then.answer(owned);
            }
        );
    }

    /** Play refunds a purchase that is not acknowledged within three days. */
    private void acknowledge(Purchase purchase) {
        if (purchase.isAcknowledged()) return;
        billing.acknowledgePurchase(
            AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchase.getPurchaseToken()).build(),
            result -> {}
        );
    }

    private static JSObject unlocked(boolean unlocked, boolean cancelled, boolean pending) {
        JSObject result = new JSObject();
        result.put("unlocked", unlocked);
        result.put("cancelled", cancelled);
        result.put("pending", pending);
        return result;
    }

    /** What the store says about the product: { available, price, title }. */
    @PluginMethod
    public void product(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) {
            call.reject("productId is required");
            return;
        }
        whenConnected(connected -> {
            JSObject result = new JSObject();
            if (!connected) {
                result.put("available", false);
                call.resolve(result);
                return;
            }
            queryProduct(productId, details -> {
                ProductDetails.OneTimePurchaseOfferDetails offer = details == null ? null : details.getOneTimePurchaseOfferDetails();
                result.put("available", offer != null);
                if (offer != null) {
                    result.put("price", offer.getFormattedPrice());
                    result.put("title", details.getName());
                }
                call.resolve(result);
            });
        });
    }

    /** Whether the full game is owned on this Google account: { unlocked }. */
    @PluginMethod
    public void status(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) {
            call.reject("productId is required");
            return;
        }
        whenConnected(connected -> {
            if (!connected) {
                call.resolve(unlocked(false, false, false));
                return;
            }
            queryOwned(productId, owned -> call.resolve(unlocked(owned, false, false)));
        });
    }

    /** Play keeps purchases itself, so restoring is asking it again. */
    @PluginMethod
    public void restore(PluginCall call) {
        status(call);
    }

    /** Start the purchase. Resolves { unlocked, cancelled, pending }. */
    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) {
            call.reject("productId is required");
            return;
        }
        whenConnected(connected -> {
            if (!connected) {
                call.reject("The store could not be reached.");
                return;
            }
            queryProduct(productId, details -> {
                if (details == null) {
                    call.reject("The full game is not available to buy right now.");
                    return;
                }
                purchaseCall = call;
                purchaseProductId = productId;
                BillingFlowParams.ProductDetailsParams item = BillingFlowParams.ProductDetailsParams
                    .newBuilder()
                    .setProductDetails(details)
                    .build();
                BillingFlowParams flow = BillingFlowParams.newBuilder().setProductDetailsParamsList(Collections.singletonList(item)).build();
                getActivity().runOnUiThread(() -> {
                    BillingResult started = billing.launchBillingFlow(getActivity(), flow);
                    if (started.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        purchaseCall = null;
                        call.reject("The purchase could not be started.");
                    }
                });
            });
        });
    }

    /** The result of a purchase started above, or one completed outside the app. */
    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = purchaseCall;
        purchaseCall = null;
        int code = result.getResponseCode();

        boolean owned = false;
        boolean pending = false;
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                if (purchaseProductId != null && !purchase.getProducts().contains(purchaseProductId)) continue;
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    owned = true;
                    acknowledge(purchase);
                } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                    pending = true;
                }
            }
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            owned = true;
        }

        if (call != null) {
            if (code == BillingClient.BillingResponseCode.OK || code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                call.resolve(unlocked(owned, false, pending));
            } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
                call.resolve(unlocked(false, true, false));
            } else {
                call.reject("The purchase did not go through.");
            }
        } else if (owned) {
            JSObject event = new JSObject();
            event.put("productId", purchaseProductId);
            event.put("unlocked", true);
            notifyListeners("purchaseUpdated", event);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (billing != null) billing.endConnection();
        super.handleOnDestroy();
    }
}
