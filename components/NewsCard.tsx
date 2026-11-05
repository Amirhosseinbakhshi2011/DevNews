import { NewsItem } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

const sourceConfig = {
  hackernews: {
    label: "Hacker News",
    color: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
  },
  devto: {
    label: "Dev.to",
    color: "bg-black dark:bg-white",
    text: "text-gray-800 dark:text-gray-200",
  },
  reddit: {
    label: "Reddit",
    color: "bg-orange-600",
    text: "text-orange-700 dark:text-orange-300",
  },
};

export default function NewsCard({ item }: { item: NewsItem }) {
  const config = sourceConfig[item.source];
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
    locale: faIR,
  });

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}
        >
          {config.label}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {timeAgo}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-3">
        {item.title}
      </h2>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {item.author && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {item.author}
          </span>
        )}
        {typeof item.points === "number" && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {item.points}
          </span>
        )}
        {typeof item.comments === "number" && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {item.comments}
          </span>
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}