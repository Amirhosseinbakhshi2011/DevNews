export type NewsSource = "hackernews" | "devto" | "reddit";

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