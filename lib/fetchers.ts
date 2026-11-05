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
      .filter((item) => item && item.title && (item.url || item.text))
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
          url: d.url?.startsWith("http") ? d.url : `https://reddit.com${d.permalink}`,
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

// Lobsters
async function fetchLobsters(limit = 12): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://lobste.rs/hottest.json", {
      next: { revalidate: 300 },
    });
    const posts = await res.json();

    return posts.slice(0, limit).map((p: any) => ({
      id: `lobsters-${p.short_id}`,
      title: p.title,
      url: p.url || `https://lobste.rs/s/${p.short_id}`,
      source: "lobsters" as const,
      author: p.submitter_user?.username,
      points: p.score,
      comments: p.comment_count,
      publishedAt: p.created_at,
      tags: p.tags || [],
    }));
  } catch (e) {
    console.error("Lobsters fetch error", e);
    return [];
  }
}

// Hashnode (GraphQL)
async function fetchHashnode(limit = 12): Promise<NewsItem[]> {
  try {
    const query = `
      query {
        feed(first: ${limit}) {
          edges {
            node {
              id
              title
              url
              author {
                name
                username
              }
              reactionCount
              responseCount
              publishedAt
              tags {
                name
              }
            }
          }
        }
      }
    `;

    const res = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 300 },
    });

    const json = await res.json();
    const edges = json?.data?.feed?.edges || [];

    return edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: `hashnode-${node.id}`,
        title: node.title,
        url: node.url,
        source: "hashnode" as const,
        author: node.author?.name || node.author?.username,
        points: node.reactionCount,
        comments: node.responseCount,
        publishedAt: node.publishedAt,
        tags: (node.tags || []).map((t: any) => t.name),
      };
    });
  } catch (e) {
    console.error("Hashnode fetch error", e);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const [hn, devto, reddit, lobsters, hashnode] = await Promise.all([
    fetchHackerNews(12),
    fetchDevTo(12),
    fetchReddit(10),
    fetchLobsters(10),
    fetchHashnode(10),
  ]);

  const all = [...hn, ...devto, ...reddit, ...lobsters, ...hashnode];

  // Sort by publishedAt descending
  all.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return all;
}