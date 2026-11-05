export type NewsSource = "hackernews" | "devto" | "reddit" | "lobsters" | "hashnode";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: NewsSource;
  author?: string;
  points?: number;
  comments?: number;
  publishedAt: string; // ISO
  tags?: string[];
}