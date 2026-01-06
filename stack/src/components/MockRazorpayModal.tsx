/**
 * Mock Razorpay Frontend Component
 * 
 * Simulates Razorpay payment modal for demonstration
 * NO REAL RAZORPAY SCRIPT NEEDED
 * 
 * Perfect for student/internship projects
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MockRazorpayProps {
    isOpen: boolean;
    onClose: () => void;
    orderData: {
        order_id: string;
        amount: number;
        currency: string;
        plan: string;
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

export const MockRazorpayModal: React.FC<MockRazorpayProps> = ({
    isOpen,
    onClose,
    orderData,
    userInfo,
    onSuccess,
}) => {
    const [processing, setProcessing] = useState(false);

    const handleMockPayment = async () => {
        setProcessing(true);

        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate mock payment response
        // In a real scenario, this would come from Razorpay
        const mockPaymentId = `pay_mock_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        // Generate mock signature (matches backend mock signature generation)
        const mockSignature = await generateMockSignature(
            orderData.order_id,
            mockPaymentId
        );

        // Call success handler
        onSuccess({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature,
        });

        setProcessing(false);
        onClose();
    };

    const generateMockSignature = async (
        orderId: string,
        paymentId: string
    ): Promise<string> => {
        // This should match the backend signature generation
        const message = `${orderId}|${paymentId}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">🎭</span>
                        Mock Razorpay Payment
                    </DialogTitle>
                    <DialogDescription>
                        This is a MOCK payment gateway for demonstration purposes
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Details */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">Order Details</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plan:</span>
                                <span className="font-semibold">{orderData.plan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-semibold text-lg">
                                    ₹{orderData.amount / 100}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="text-xs font-mono">
                                    {orderData.order_id.substring(0, 20)}...
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2">
                        <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={userInfo.name} disabled className="text-sm" />
                        </div>
                        <div>
                            <Label className="text-xs">Email</Label>
                            <Input value={userInfo.email} disabled className="text-sm" />
                        </div>
                    </div>

                    {/* Mock Card Details */}
                    <div className="space-y-2">
                        <div>
                            <Label className="text-xs">Card Number (Mock)</Label>
                            <Input
                                value="4111 1111 1111 1111"
                                disabled
                                className="text-sm font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Expiry</Label>
                                <Input value="12/25" disabled className="text-sm" />
                            </div>
                            <div>
                                <Label className="text-xs">CVV</Label>
                                <Input value="123" disabled className="text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs">
                        <p className="font-semibold text-yellow-800 mb-1">
                            ℹ️ Mock Payment Mode
                        </p>
                        <p className="text-yellow-700">
                            This is a simulated payment. No real money will be charged. Click
                            "Pay Now" to complete the mock transaction.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMockPayment}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {processing ? "Processing..." : "Pay Now (Mock)"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
