/* eslint-disable */
import React, { useState, useEffect } from "react";
import { X, CreditCard, Plus, CheckCircle2 } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import {
  getPaymentInfo,
  purchasePoints,
  purchasePointsWithPendingCapture,
} from "../../services/api";
import StripePaymentForm from "../payment/PayJPPaymentForm";
import CardRegistrationForm from "../payment/CardRegistrationForm";
import Spinner from "../ui/Spinner";

interface InsufficientPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPoints: number;
  onPointsPurchased: () => void;
}

const InsufficientPointsModal: React.FC<InsufficientPointsModalProps> = ({
  isOpen,
  onClose,
  requiredPoints,
  onPointsPurchased,
}) => {
  const { user, refreshUser } = useUser();
  const [hasRegisteredCard, setHasRegisteredCard] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showCardRegistration, setShowCardRegistration] = useState(false);
  const [showPointPurchase, setShowPointPurchase] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate required amount in yen (1 point = 1.2 yen)
  const YEN_PER_POINT = 1.2;
  const requiredYen = Math.max(100, Math.ceil(requiredPoints * YEN_PER_POINT)); // Minimum 100 yen for Stripe

  useEffect(() => {
    if (isOpen && user?.id) {
      checkRegisteredCards();
    }
  }, [isOpen, user?.id]);

  const checkRegisteredCards = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const paymentInfo = await getPaymentInfo("guest", user.id);
      setHasRegisteredCard(!!paymentInfo?.card_count);
    } catch (error: any) {
      console.error("Failed to check registered cards:", error);
      setHasRegisteredCard(false);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail;
      setError(backendError || "カード情報の確認に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleStripeAuthentication = async (
    clientSecret: string,
    paymentIntentId: string
  ): Promise<boolean> => {
    try {
      // Load Stripe.js if not already loaded
      if (!(window as any).Stripe) {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "";
      const stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);

      // Retrieve the payment intent to check its status
      const { error: retrieveError, paymentIntent } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (retrieveError) {
        console.error("Payment intent retrieval error:", retrieveError);
        setError(retrieveError.message || "支払い情報の取得に失敗しました。");
        return false;
      }

      // Check if payment requires action (redirect-based authentication)
      if (paymentIntent.status === "requires_action") {
        const nextAction = paymentIntent.next_action;

        if (nextAction && nextAction.type === "redirect_to_url") {
          // Store payment context in sessionStorage for return handling
          const paymentContext = {
            payment_intent_id: paymentIntentId,
            client_secret: clientSecret,
            required_points: requiredPoints,
            returnUrl: window.location.pathname + window.location.search,
            modalContext: {
              source: "insufficient_points_modal",
              shouldShowSuccess: true,
            },
          };

          sessionStorage.setItem("payment_intent_id", paymentIntentId);
          sessionStorage.setItem(
            "payment_context",
            JSON.stringify(paymentContext)
          );

          // Redirect to the bank's authentication page
          window.location.href = nextAction.redirect_to_url.url;
          return false; // Will return after redirect
        }
      }

      // Try to confirm the payment intent (for modal-based authentication)
      // If it requires redirect, the above will handle it
      const { error: confirmError, paymentIntent: confirmedIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          return_url: `${window.location.origin}/payment/return`,
        });

      if (confirmError) {
        // Check if error indicates redirect is needed
        if (
          confirmError.type === "card_error" &&
          confirmError.code === "authentication_required"
        ) {
          // Retrieve again to get redirect URL
          const { paymentIntent: retryIntent } =
            await stripe.retrievePaymentIntent(clientSecret);
          if (
            retryIntent &&
            retryIntent.next_action &&
            retryIntent.next_action.type === "redirect_to_url"
          ) {
            // Store payment context
            const paymentContext = {
              payment_intent_id: paymentIntentId,
              client_secret: clientSecret,
              required_points: requiredPoints,
              returnUrl: window.location.pathname + window.location.search,
              modalContext: {
                source: "insufficient_points_modal",
                shouldShowSuccess: true,
              },
            };

            sessionStorage.setItem("payment_intent_id", paymentIntentId);
            sessionStorage.setItem(
              "payment_context",
              JSON.stringify(paymentContext)
            );

            // Redirect to authentication page
            window.location.href = retryIntent.next_action.redirect_to_url.url;
            return false;
          }
        }

        console.error("Stripe authentication error:", confirmError);
        setError(confirmError.message || "認証処理中にエラーが発生しました。");
        return false;
      }

      // Check payment intent status
      if (
        confirmedIntent &&
        (confirmedIntent.status === "requires_capture" ||
          confirmedIntent.status === "succeeded" ||
          confirmedIntent.status === "processing")
      ) {
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Stripe authentication failed:", error);
      setError(error.message || "認証処理中にエラーが発生しました。");
      return false;
    }
  };

  const handleAutomaticPayment = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate yen amount (1 point = 1.2 yen)
      const YEN_PER_POINT = 1.2;
      const yenAmount = Math.max(
        100,
        Math.ceil(requiredPoints * YEN_PER_POINT)
      ); // Minimum 100 yen for Stripe

      // Use the new pending capture API for insufficient points scenario
      const result = await purchasePointsWithPendingCapture(
        user.id,
        "guest",
        yenAmount,
        requiredPoints,
        `ポイント不足時の自動支払い - ${requiredPoints}ポイント`
      );

      if (result.success) {
        // Check if authentication is required
        if (
          result.requires_authentication &&
          result.client_secret &&
          result.payment_intent_id
        ) {
          // Handle redirect-based authentication
          const authSuccess = await handleStripeAuthentication(
            result.client_secret,
            result.payment_intent_id
          );

          if (authSuccess) {
            // Authentication successful (modal-based), proceed with success flow
            setPurchaseSuccess(true);
            await refreshUser();
            setTimeout(() => {
              onPointsPurchased();
              onClose();
            }, 2000);
          } else {
            // If redirect happened, the function returns false but redirects the user
            // The PaymentReturnPage will handle the rest
            // The redirect will happen automatically, so we don't need to do anything here
            // If it's an actual error, it will be set in handleStripeAuthentication
            // In either case, the redirect or error handling will take care of it
            setLoading(false);
            // Don't close modal - user will be redirected or error will be shown
            return;
          }
        } else {
          // No authentication required, proceed normally
          setPurchaseSuccess(true);
          await refreshUser();
          setTimeout(() => {
            onPointsPurchased();
            onClose();
          }, 2000);
        }
      } else {
        if (
          result.error?.includes("カード情報が必要") ||
          result.requires_card_registration
        ) {
          setShowCardRegistration(true);
        } else {
          setError(result.error || "ポイント購入に失敗しました。");
        }
      }
    } catch (error: any) {
      console.error("Point purchase failed:", error);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail;
      setError(backendError || "ポイント購入中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCardRegistered = () => {
    setShowCardRegistration(false);
    setHasRegisteredCard(true);
    // Automatically try automatic payment after card registration
    setTimeout(() => {
      handleAutomaticPayment();
    }, 500);
  };

  const handlePointPurchaseSuccess = () => {
    setShowPointPurchase(false);
    setPurchaseSuccess(true);
    refreshUser();
    setTimeout(() => {
      onPointsPurchased();
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setShowCardRegistration(false);
    setShowPointPurchase(false);
    setPurchaseSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-primary via-primary to-secondary rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-xl border border-secondary">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-3 right-3 text-white/80 hover:text-white text-2xl disabled:opacity-50"
          aria-label="閉じる"
        >
          ×
        </button>

        {purchaseSuccess ? (
          <div className="text-center py-8">
            <CheckCircle2 className="text-green-400 w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">
              ポイント追加完了！
            </h3>
            <p className="text-gray-300 mb-2">
              {requiredPoints.toLocaleString()}ポイントが追加されました
            </p>
            <p className="text-yellow-300 text-sm">
              2日後に自動的に支払いが完了します
            </p>
          </div>
        ) : showCardRegistration ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              カード情報を登録
            </h2>
            <CardRegistrationForm
              onSuccess={handleCardRegistered}
              onCancel={() => setShowCardRegistration(false)}
              userType="guest"
              userId={user?.id}
            />
          </div>
        ) : showPointPurchase ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              ポイント購入
            </h2>
            <StripePaymentForm
              amount={requiredPoints}
              onSuccess={handlePointPurchaseSuccess}
              onCancel={() => setShowPointPurchase(false)}
              onError={(error) => setError(error)}
              userType="guest"
              userId={user?.id}
            />
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">
                ポイントが不足しています
              </h2>
              <p className="text-gray-300 text-sm">
                予約に必要なポイント:{" "}
                <span className="text-yellow-400 font-bold">
                  {requiredPoints.toLocaleString()}P
                </span>
              </p>
              <p className="text-gray-300 text-sm">
                現在のポイント:{" "}
                <span className="text-red-400 font-bold">
                  {user?.points?.toLocaleString() || 0}P
                </span>
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Spinner />
                <p className="text-white mt-4">確認中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="text-red-400 text-sm font-medium mb-2">
                    エラーが発生しました
                  </div>
                  <p className="text-red-300 text-sm break-words">{error}</p>
                </div>
                <button
                  onClick={checkRegisteredCards}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  再試行
                </button>
              </div>
            ) : hasRegisteredCard ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    登録済みカードで購入
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    登録済みのカードから{requiredYen.toLocaleString()}
                    円の支払いを予約し、{requiredPoints.toLocaleString()}
                    ポイントを追加します。
                    <br />
                    <span className="text-yellow-300">
                      2日後に自動的に支払いが完了します。
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleAutomaticPayment}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span className="ml-2">処理中...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      自動でポイント購入
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPointPurchase(true)}
                  className="w-full py-3 border border-gray-400 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  他の方法で購入
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    カード情報を登録して購入
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    まずカード情報を登録してから、
                    {requiredPoints.toLocaleString()}ポイントを購入します。
                  </p>
                </div>
                <button
                  onClick={() => setShowCardRegistration(true)}
                  className="w-full py-3 bg-secondary text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  カードを登録して購入
                </button>
                <button
                  onClick={() => setShowPointPurchase(true)}
                  className="w-full py-3 border border-gray-400 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  他の方法で購入
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsufficientPointsModal;
