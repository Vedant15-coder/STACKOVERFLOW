import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";
import { MockRazorpayModal } from "@/components/MockRazorpayModal";

interface SubscriptionPlan {
    name: string;
    price: number;
    questionLimit: string;
    features: string[];
    popular?: boolean;
}

const PLANS: SubscriptionPlan[] = [
    {
        name: "FREE",
        price: 0,
        questionLimit: "1",
        features: [
            "1 question per day",
            "Basic community access",
            "View all answers",
            "Vote on posts",
        ],
    },
    {
        name: "BRONZE",
        price: 100,
        questionLimit: "5",
        features: [
            "5 questions per day",
            "Priority support",
            "All FREE features",
            "Email notifications",
        ],
    },
    {
        name: "SILVER",
        price: 300,
        questionLimit: "10",
        popular: true,
        features: [
            "10 questions per day",
            "Priority support",
            "All BRONZE features",
            "Advanced analytics",
        ],
    },
    {
        name: "GOLD",
        price: 1000,
        questionLimit: "Unlimited",
        features: [
            "Unlimited questions",
            "Premium support",
            "All SILVER features",
            "Early access to features",
        ],
    },
];

const SubscriptionPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
    const [isPaymentWindowOpen, setIsPaymentWindowOpen] = useState(false);
    const [timeUntilWindow, setTimeUntilWindow] = useState("");
    const [showMockPayment, setShowMockPayment] = useState(false);
    const [currentOrderData, setCurrentOrderData] = useState<any>(null);

    // Check if user is logged in
    useEffect(() => {
        if (!user) {
            router.push("/auth");
        } else {
            fetchSubscriptionStatus();
        }
    }, [user]);

    // Check payment time window (10-11 AM IST)
    useEffect(() => {
        const checkPaymentWindow = () => {
            const now = new Date();
            const istTime = new Date(
                now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            );
            const hour = istTime.getHours();

            const isOpen = hour >= 10 && hour < 11;
            setIsPaymentWindowOpen(isOpen);

            // Calculate time until window opens/closes
            if (!isOpen) {
                if (hour < 10) {
                    const minutesUntil = (10 - hour) * 60 - istTime.getMinutes();
                    setTimeUntilWindow(
                        `Payment window opens in ${Math.floor(minutesUntil / 60)}h ${minutesUntil % 60
                        }m`
                    );
                } else {
                    setTimeUntilWindow(`Payment window opens tomorrow at 10:00 AM IST`);
                }
            } else {
                const minutesRemaining = 60 - istTime.getMinutes();
                setTimeUntilWindow(`Payment window closes in ${minutesRemaining} minutes`);
            }
        };

        checkPaymentWindow();
        const interval = setInterval(checkPaymentWindow, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:5000/api/subscription/status",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSubscriptionStatus(data.subscription);
            }
        } catch (error) {
            console.error("Error fetching subscription status:", error);
        }
    };

    // Handle subscription upgrade (Mock Razorpay)
    const handleUpgrade = async (plan: string) => {
        if (!isPaymentWindowOpen) {
            toast.error("Payments are only allowed between 10:00 AM - 11:00 AM IST");
            return;
        }

        if (plan === "FREE") {
            toast.info("You are already on the FREE plan");
            return;
        }

        setLoading(true);

        try {
            // Create payment order
            const token = localStorage.getItem("token");
            const orderResponse = await fetch(
                "http://localhost:5000/api/subscription/create-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ plan }),
                }
            );

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                toast.error(orderData.message || "Failed to create payment order");
                setLoading(false);
                return;
            }

            console.log("🎭 Mock order created:", orderData);

            // Open Mock Razorpay Modal
            setCurrentOrderData({
                ...orderData.order,
                plan: plan,
            });
            setShowMockPayment(true);
            setLoading(false);
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Failed to process payment. Please try again.");
            setLoading(false);
        }
    };

    // Handle mock payment success
    const handleMockPaymentSuccess = async (paymentData: any) => {
        try {
            const token = localStorage.getItem("token");
            const verifyResponse = await fetch(
                "http://localhost:5000/api/subscription/verify-payment",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(paymentData),
                }
            );

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
                toast.success(verifyData.message);
                fetchSubscriptionStatus(); // Refresh subscription status
                setTimeout(() => router.push("/"), 2000);
            } else {
                toast.error(verifyData.message || "Payment verification failed");
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Failed to verify payment. Please contact support.");
        }
    };

    if (!user) {
        return null; // Will redirect to auth
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mock Razorpay Payment Modal */}
            {showMockPayment && currentOrderData && (
                <MockRazorpayModal
                    isOpen={showMockPayment}
                    onClose={() => setShowMockPayment(false)}
                    orderData={currentOrderData}
                    userInfo={{
                        name: user.name || "",
                        email: user.email || "",
                    }}
                    onSuccess={handleMockPaymentSuccess}
                />
            )}

            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                            <div className="w-8 h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
                                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                                    <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-gray-800">
                                stack<span className="font-normal">overflow</span>
                            </span>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="text-sm"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Choose Your Plan
                    </h1>
                    <p className="text-gray-600">
                        Upgrade your account to post more questions per day
                    </p>
                </div>

                {/* Payment Window Alert */}
                {!isPaymentWindowOpen && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-yellow-600 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <p className="font-semibold text-yellow-800">
                                    Payment Window Closed
                                </p>
                                <p className="text-sm text-yellow-700">{timeUntilWindow}</p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    Payments are only allowed between 10:00 AM - 11:00 AM IST
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isPaymentWindowOpen && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-green-600 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <p className="font-semibold text-green-800">
                                    Payment Window Open
                                </p>
                                <p className="text-sm text-green-700">{timeUntilWindow}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Subscription Status */}
                {subscriptionStatus && (
                    <Card className="mb-8 bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Current Subscription Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Current Plan</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {subscriptionStatus.plan}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Questions Today</p>
                                    <p className="text-xl font-bold">
                                        {subscriptionStatus.questionsToday} /{" "}
                                        {subscriptionStatus.questionLimit === null
                                            ? "∞"
                                            : subscriptionStatus.questionLimit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Remaining Today</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {subscriptionStatus.remainingQuestions === "unlimited"
                                            ? "∞"
                                            : subscriptionStatus.remainingQuestions}
                                    </p>
                                </div>
                            </div>
                            {subscriptionStatus.expiresAt && (
                                <p className="text-sm text-gray-600 mt-4">
                                    Expires on:{" "}
                                    {new Date(subscriptionStatus.expiresAt).toLocaleDateString(
                                        "en-IN",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative ${plan.popular
                                ? "border-blue-500 border-2 shadow-lg"
                                : "border-gray-200"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        POPULAR
                                    </span>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold text-gray-900">
                                            ₹{plan.price}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-gray-600">/month</span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-blue-600">
                                        {plan.questionLimit} questions/day
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-sm">
                                            <svg
                                                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full ${plan.popular
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-800 hover:bg-gray-900"
                                        }`}
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={
                                        loading ||
                                        !isPaymentWindowOpen ||
                                        plan.name === "FREE" ||
                                        subscriptionStatus?.plan === plan.name
                                    }
                                >
                                    {loading
                                        ? "Processing..."
                                        : subscriptionStatus?.plan === plan.name
                                            ? "Current Plan"
                                            : plan.name === "FREE"
                                                ? "Free Plan"
                                                : `Upgrade to ${plan.name}`}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    When can I make payments?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Payments are only allowed between 10:00 AM - 11:00 AM IST.
                                    This is a strict requirement enforced by our system.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    How long does my subscription last?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    All paid subscriptions (BRONZE, SILVER, GOLD) last for 30
                                    days from the date of purchase. The FREE plan never expires.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    What happens when my subscription expires?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    When your subscription expires, you'll automatically be
                                    downgraded to the FREE plan (1 question per day).
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Can I upgrade anytime during the payment window?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Yes! You can upgrade to any plan during the 10-11 AM IST
                                    payment window. Your new limits will be active immediately.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
