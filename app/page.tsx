import { fetchAllNews } from "@/lib/fetchers";
import NewsCard from "@/components/NewsCard";
import { NewsSource } from "@/lib/types";
import Link from "next/link";

export const revalidate = 300; // 5 minutes

const sources: { key: NewsSource | "all"; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "hackernews", label: "Hacker News" },
  { key: "devto", label: "Dev.to" },
  { key: "reddit", label: "Reddit" },
  { key: "lobsters", label: "Lobsters" },
  { key: "hashnode", label: "Hashnode" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: { source?: string };
}) {
  const allNews = await fetchAllNews();
  const activeSource = (searchParams.source as NewsSource | "all") || "all";

  const news =
    activeSource === "all"
      ? allNews
      : allNews.filter((item) => item.source === activeSource);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-3xl">📡</span>
              DevNews
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              اخبار و مقالات برنامه‌نویسی از بهترین منابع
            </p>
          </div>
          <div className="text-xs text-slate-400">
            آپدیت هر ۵ دقیقه • {news.length} خبر
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Real source filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sources.map((s) => {
            const isActive = activeSource === s.key;
            return (
              <Link
                key={s.key}
                href={s.key === "all" ? "/" : `/?source=${s.key}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {news.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">خبری از این منبع پیدا نشد 😢</p>
            <p className="text-sm mt-2">منبع دیگری را امتحان کن</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          ساخته شده با ❤️ و Next.js • منابع: HN + Dev.to + Reddit + Lobsters + Hashnode
        </p>
        <p className="mt-1 text-xs">
          داده‌ها هر ۵ دقیقه به‌روز می‌شوند
        </p>
      </footer>
    </div>
  );
}