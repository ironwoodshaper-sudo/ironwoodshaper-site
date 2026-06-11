const fallbackPosts = require("../data/instagram-fallback.json");

const DEFAULT_LIMIT = 8;
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v23.0";
const INSTAGRAM_PROFILE = "https://www.instagram.com/ironwoodshaper/";

function normalizePost(post) {
  const imageUrl = post.media_type === "VIDEO"
    ? post.thumbnail_url || post.media_url
    : post.media_url;

  return {
    id: post.id,
    imageUrl,
    date: post.timestamp || null,
    caption: post.caption || "",
    permalink: post.permalink || INSTAGRAM_PROFILE,
    mediaType: post.media_type || "IMAGE",
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) {
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return response.status(200).json({
      source: "fallback",
      posts: fallbackPosts,
    });
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
  ].join(",");
  const endpoint = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media`);
  endpoint.searchParams.set("fields", fields);
  endpoint.searchParams.set("limit", String(DEFAULT_LIMIT));
  endpoint.searchParams.set("access_token", token);

  try {
    const instagramResponse = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });

    if (!instagramResponse.ok) {
      throw new Error(`Instagram API returned ${instagramResponse.status}`);
    }

    const payload = await instagramResponse.json();
    const posts = (payload.data || [])
      .map(normalizePost)
      .filter((post) => post.imageUrl);

    if (!posts.length) {
      throw new Error("Instagram API returned no displayable posts");
    }

    response.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return response.status(200).json({ source: "instagram", posts });
  } catch (error) {
    console.error("Instagram feed fallback:", error.message);
    response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return response.status(200).json({
      source: "fallback",
      posts: fallbackPosts,
    });
  }
};
