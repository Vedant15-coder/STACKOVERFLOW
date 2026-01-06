import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const [question, setquestion] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchquestion = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        setquestion(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchquestion();
  }, []);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuestion.trim()) {
      router.push(`/ai-assist?q=${encodeURIComponent(aiQuestion)}`);
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        {/* AI Assistant Section */}
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-black p-2 rounded">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">
                {t('home.aiAssist.greeting', { name: user?.name || t('home.aiAssist.defaultName') })}
              </h2>
              <p className="text-sm text-gray-600">
                {t('home.aiAssist.description')}
              </p>
            </div>
          </div>

          <form onSubmit={handleAiSubmit} className="relative">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={t('home.aiAssist.placeholder')}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!aiQuestion.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-3">
            By using AI Assist, you agree to Stack Overflow's{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            . Powered with the help of OpenAI.
          </p>
        </div>

        {/* Questions Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold">{t('home.title')}</h1>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            {t('home.askQuestion')}
          </button>
        </div>

        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 text-sm gap-2 sm:gap-4">
            <span className="text-gray-600">
              {question?.length || 0} {t('home.questionsCount', { count: question?.length || 0 })}
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs sm:text-sm">
                {t('home.filter.newest')}
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm">
                {t('home.filter.active')}
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded flex items-center text-xs sm:text-sm">
                {t('home.filter.bountied')}
                <Badge variant="secondary" className="ml-1 text-xs">
                  25
                </Badge>
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm">
                {t('home.filter.unanswered')}
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm">
                {t('home.filter.more')} ▼
              </button>
              <button className="px-2 sm:px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded ml-auto text-xs sm:text-sm">
                🔍 {t('home.filter.filter')}
              </button>
            </div>
          </div>

          {!question || question.length === 0 ? (
            <div className="text-center text-gray-500 mt-8 p-8 border border-gray-200 rounded-lg">
              {t('home.noQuestions')}
            </div>
          ) : (
            <div className="space-y-4">
              {question.map((q: any) => (
                <div key={q._id} className="border-b border-gray-200 pb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex sm:flex-col items-center sm:items-center text-sm text-gray-600 sm:w-16 lg:w-20 gap-4 sm:gap-2">
                      <div className="text-center">
                        <div className="font-medium">{q.upvote.length}</div>
                        <div className="text-xs">{t('questions.votes')}</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-medium ${q.answer.length > 0
                            ? "text-green-600 bg-green-100 px-2 py-1 rounded"
                            : ""
                            }`}
                        >
                          {q.noofanswer}
                        </div>
                        <div className="text-xs">
                          {q.noofanswer === 1 ? t('questions.answer') : t('questions.answers')}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/questions/${q._id}`}
                        className="text-blue-600 hover:text-blue-800 text-base lg:text-lg font-medium mb-2 block"
                      >
                        {q.questiontitle}
                      </Link>
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                        {q.questionbody}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {q.questiontags.map((tag: any) => (
                            <div key={tag}>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                              >
                                {tag}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                          <Link
                            href={`/users/${q.userid}`}
                            className="flex items-center"
                          >
                            <Avatar className="w-4 h-4 mr-1">
                              <AvatarFallback className="text-xs">
                                {q.userposted[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-blue-600 hover:text-blue-800 mr-1">
                              {q.userposted}
                            </span>
                          </Link>

                          <span>
                            {t('questions.asked')} {new Date(q.askedon).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </Mainlayout>
  );
}
