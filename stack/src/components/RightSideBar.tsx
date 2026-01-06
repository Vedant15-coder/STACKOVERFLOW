import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import FriendSearchWidget from "./FriendSearchWidget";

const RightSideBar = () => {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <aside className="w-72 lg:w-80 p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="space-y-4 lg:space-y-6">
        {/* Friend Search Widget */}
        <FriendSearchWidget />

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 lg:p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("rightSidebar.overflowBlog") : "The Overflow Blog"}
          </h3>
          <ul className="space-y-2 text-xs lg:text-sm">
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">✏️</span>
              <span className="text-gray-700">
                {hasMounted ? t("rightSidebar.blog1") : "A new era of Stack Overflow"}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">✏️</span>
              <span className="text-gray-700">
                {hasMounted ? t("rightSidebar.blog2") : "How your favorite movie is changing language learning technology"}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3 lg:p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("rightSidebar.featuredOnMeta") : "Featured on Meta"}
          </h3>
          <ul className="space-y-2 text-xs lg:text-sm">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">💬</span>
              <span className="text-gray-700">
                {hasMounted ? t("rightSidebar.meta1") : "Results of the June 2025 Community Asks Sprint"}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">💬</span>
              <span className="text-gray-700">
                {hasMounted ? t("rightSidebar.meta2") : "Will you help build our new visual identity?"}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">📋</span>
              <span className="text-gray-700">
                {hasMounted ? t("rightSidebar.meta3") : "Policy: Generative AI (e.g., ChatGPT) is banned"}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("rightSidebar.customFilters") : "Custom Filters"}
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent text-xs lg:text-sm"
          >
            {hasMounted ? t("rightSidebar.createCustomFilter") : "Create a custom filter"}
          </Button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("rightSidebar.watchedTags") : "Watched Tags"}
          </h3>
          <div className="flex items-center justify-center py-6 lg:py-8">
            <div className="text-center">
              <Eye className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs lg:text-sm text-gray-500 mb-3">
                {hasMounted ? t("rightSidebar.watchTagsDescription") : "Watch tags to curate your list of questions."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent text-xs lg:text-sm"
              >
                👁️ {hasMounted ? t("rightSidebar.watchATag") : "Watch a tag"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
