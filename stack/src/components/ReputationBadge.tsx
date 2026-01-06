import React from "react";
import PointsDisplay from "./PointsDisplay";

interface ReputationBadgeProps {
    userId?: string;
    className?: string;
}

/**
 * Compact reputation badge for navbar/inline display
 * Shows user's points in a minimal, Stack Overflow-style badge
 */
const ReputationBadge: React.FC<ReputationBadgeProps> = ({
    userId,
    className = "",
}) => {
    return <PointsDisplay userId={userId} showBadge={true} className={className} />;
};

export default ReputationBadge;
