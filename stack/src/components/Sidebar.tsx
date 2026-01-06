import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Home,
  Image,
  MessageSquare,
  MessageSquareIcon,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "./ui/badge";

const Sidebar = ({ isopen }: any) => {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div>
      <aside
        className={cn(
          " top-[53px]  w-48 lg:w-64 min-h-screen bg-white shadow-sm border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          isopen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2 lg:p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Home className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('nav.home') : 'Home'}
              </Link>
            </li>
            <li>
              <Link
                href="/questions"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('nav.questions') : 'Questions'}
              </Link>
            </li>
            <li>
              <Link
                href="/public"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Image className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('nav.publicSpace') : 'Public Space'}
              </Link>
            </li>
            <li>
              <Link
                href="/ai-assist"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('nav.aiAssist') : 'AI Assist'}
                <Badge variant="secondary" className="ml-auto text-xs">
                  {hasMounted ? t('sidebar.labs') : 'Labs'}
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('nav.tags') : 'Tags'}
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('nav.users') : 'Users'}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('sidebar.saves') : 'Saves'}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Trophy className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('sidebar.challenges') : 'Challenges'}
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-orange-100 text-orange-800"
                >
                  {hasMounted ? t('sidebar.new') : 'NEW'}
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('sidebar.chat') : 'Chat'}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('sidebar.articles') : 'Articles'}
              </Link>
            </li>

            <li>
              <Link
                href="#"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Building className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t('sidebar.companies') : 'Companies'}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
