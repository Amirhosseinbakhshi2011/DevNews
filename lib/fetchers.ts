import { NewsItem } from "./types";

// Hacker News
async function fetchHackerNews(limit = 15): Promise<NewsItem[]> {
  try {
    const idsRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 300 } }
    );
    const ids: number[] = await idsRes.json();
    const topIds = ids.slice(0, limit);

    const items = await Promise.all(
      topIds.map(async (id) => {
        const res = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          { next: { revalidate: 300 } }
        );
        return res.json();
      })
    );

    return items
      .filter((item) => item && item.title && item.url)
      .map((item) => ({
        id: `hn-${item.id}`,
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        source: "hackernews" as const,
        author: item.by,
        points: item.score,
        comments: item.descendants,
        publishedAt: new Date(item.time * 1000).toISOString(),
      }));
  } catch (e) {
    console.error("HN fetch error", e);
    return [];
  }
}

// Dev.to
async function fetchDevTo(limit = 15): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://dev.to/api/articles?per_page=${limit}&top=7`,
      { next: { revalidate: 300 } }
    );
    const articles = await res.json();

    return articles.map((a: any) => ({
      id: `devto-${a.id}`,
      title: a.title,
      url: a.url,
      source: "devto" as const,
      author: a.user?.name || a.user?.username,
      points: a.public_reactions_count,
      comments: a.comments_count,
      publishedAt: a.published_at || a.created_at,
      tags: a.tag_list || [],
    }));
  } catch (e) {
    console.error("Dev.to fetch error", e);
    return [];
  }
}

// Reddit (r/programming + r/webdev)
async function fetchReddit(limit = 12): Promise<NewsItem[]> {
  try {
    const [progRes, webRes] = await Promise.all([
      fetch("https://www.reddit.com/r/programming/hot.json?limit=10", {
        headers: { "User-Agent": "DevNews/1.0" },
        next: { revalidate: 300 },
      }),
      fetch("https://www.reddit.com/r/webdev/hot.json?limit=8", {
        headers: { "User-Agent": "DevNews/1.0" },
        next: { revalidate: 300 },
      }),
    ]);

    const progData = await progRes.json();
    const webData = await webRes.json();

    const posts = [
      ...(progData?.data?.children || []),
      ...(webData?.data?.children || []),
    ];

    return posts
      .filter((p: any) => p.data && !p.data.stickied)
      .slice(0, limit)
      .map((p: any) => {
        const d = p.data;
        return {
          id: `reddit-${d.id}`,
          title: d.title,
          url: d.url.startsWith("http") ? d.url : `https://reddit.com${d.permalink}`,
          source: "reddit" as const,
          author: d.author,
          points: d.ups,
          comments: d.num_comments,
          publishedAt: new Date(d.created_utc * 1000).toISOString(),
        };
      });
  } catch (e) {
    console.error("Reddit fetch error", e);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const [hn, devto, reddit] = await Promise.all([
    fetchHackerNews(15),
    fetchDevTo(15),
    fetchReddit(12),
  ]);

  const all = [...hn, ...devto, ...reddit];

  // Sort by publishedAt descending
  all.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return all;
}