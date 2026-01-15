/**
 * Real Razorpay Payment Integration
 * 
 * Uses official Razorpay Checkout for live payments
 * Supports both Test and Live modes
 */

import React, { useEffect } from "react";

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
    };
    theme: {
        color: string;
    };
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
    modal: {
        ondismiss: () => void;
    };
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderData: {
        order_id: string;
        amount: number;
        currency: string;
        plan: string;
        keyId: string; // Razorpay Key ID from backend
    };
    userInfo: {
        name: string;
        email: string;
    };
    onSuccess: (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
    isOpen,
    onClose,
    orderData,
    userInfo,
    onSuccess,
}) => {
    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (isOpen && window.Razorpay) {
            openRazorpayCheckout();
        }
    }, [isOpen]);

    const openRazorpayCheckout = () => {
        const options: RazorpayOptions = {
            key: orderData.keyId, // Razorpay Key ID from backend
            amount: orderData.amount,
            currency: orderData.currency,
            name: "DevQuery",
            description: `${orderData.plan} Subscription`,
            order_id: orderData.order_id,
            prefill: {
                name: userInfo.name,
                email: userInfo.email,
            },
            theme: {
                color: "#3B82F6", // Blue color
            },
            handler: function (response) {
                // Payment successful
                onSuccess({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });
                onClose();
            },
            modal: {
                ondismiss: function () {
                    // User closed the modal
                    onClose();
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    // This component doesn't render anything visible
    // Razorpay handles the modal UI
    return null;
};

// Export as MockRazorpayModal for backward compatibility
export { RazorpayModal as MockRazorpayModal };
