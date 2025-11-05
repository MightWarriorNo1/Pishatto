/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Get payment intent ID from URL query params (Stripe redirect) or sessionStorage
        const piFromUrl = searchParams.get("payment_intent");
        const piClientSecret = searchParams.get("payment_intent_client_secret");
        const piFromStorage = sessionStorage.getItem("payment_intent_id");

        // Prefer URL params (from Stripe redirect) over sessionStorage
        const paymentIntentId = piFromUrl || piFromStorage;
        const clientSecretFromUrl = piClientSecret;

        if (!paymentIntentId) {
          setStatus("error");
          setErrorMessage("支払い情報が見つかりませんでした。");
          return;
        }

        setPaymentIntentId(paymentIntentId);

        // Get payment context from sessionStorage (may not exist if directly accessed)
        const paymentContext = sessionStorage.getItem("payment_context");
        let context: any = {};
        let returnUrl = "/dashboard";
        let requiredPoints = 0;

        // Prefer client_secret from URL (from Stripe redirect) over sessionStorage
        let client_secret = clientSecretFromUrl;

        if (paymentContext) {
          try {
            context = JSON.parse(paymentContext);
            returnUrl = context.returnUrl || "/dashboard";
            requiredPoints = context.required_points || 0;
            // Only use client_secret from context if not provided in URL
            if (!client_secret) {
              client_secret = context.client_secret;
            }
          } catch (e) {
            console.error("Failed to parse payment context:", e);
          }
        }

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

        // Use client_secret from URL (preferred), context, or try to get from backend
        // Stripe requires client_secret for retrievePaymentIntent, not payment_intent_id
        if (!client_secret) {
          setStatus("error");
          setErrorMessage("支払い情報が不完全です。もう一度お試しください。");
          return;
        }

        // Retrieve the payment intent to check its status using client_secret
        const { error, paymentIntent } = await stripe.retrievePaymentIntent(
          client_secret
        );

        if (error) {
          console.error("Payment intent retrieval error:", error);
          setStatus("error");
          setErrorMessage(error.message || "支払い情報の取得に失敗しました。");
          return;
        }

        // Check payment intent status
        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing"
        ) {
          // Payment successful
          setStatus("success");

          // Refresh user data to get updated points
          await refreshUser();

          // Store success flag for parent components to handle
          const successData = {
            success: true,
            requiredPoints: requiredPoints,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(
            "payment_success",
            JSON.stringify(successData)
          );

          // Clear payment context but keep success flag
          sessionStorage.removeItem("payment_intent_id");
          sessionStorage.removeItem("payment_context");

          // Redirect back to return URL or dashboard with success flag
          setTimeout(() => {
            if (returnUrl) {
              // Add success flag to URL params
              const url = new URL(returnUrl, window.location.origin);
              url.searchParams.set("payment_success", "true");
              url.searchParams.set("points", requiredPoints.toString());
              navigate(url.pathname + url.search);
            } else {
              navigate(
                `/dashboard?payment_success=true&points=${requiredPoints}`
              );
            }
          }, 2000);
        } else if (paymentIntent.status === "requires_action") {
          // Still requires action - this shouldn't happen after redirect, but handle it
          setStatus("error");
          setErrorMessage("認証が完了していません。もう一度お試しください。");
        } else if (
          paymentIntent.status === "canceled" ||
          paymentIntent.status === "requires_payment_method"
        ) {
          // Payment failed or was canceled
          setStatus("error");
          setErrorMessage("支払いがキャンセルされたか、失敗しました。");
        } else {
          // Unknown status
          setStatus("error");
          setErrorMessage(`予期しない支払い状態: ${paymentIntent.status}`);
        }
      } catch (error: any) {
        console.error("Payment return handling failed:", error);
        setStatus("error");
        setErrorMessage(
          error.message || "支払い処理中にエラーが発生しました。"
        );
      }
    };

    handlePaymentReturn();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              支払いを確認中...
            </h2>
            <p className="text-gray-600">少々お待ちください</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              支払いが完了しました！
            </h2>
            <p className="text-gray-600 mb-4">ポイントが追加されました</p>
            <p className="text-sm text-gray-500">画面を移動します...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ダッシュボードに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
