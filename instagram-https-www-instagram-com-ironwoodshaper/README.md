# Iron.Wood.Shaper Website

Static website with a Vercel Function that loads the latest posts through Meta's official Instagram Graph API.

## Local preview

```sh
python3 -m http.server 4173 --directory outputs
```

Opening `outputs/index.html` directly also works. In that mode, the manually registered Instagram fallback remains visible.

## Instagram Graph API

1. Create a Meta app and connect the Instagram professional account.
2. Obtain the Instagram business account ID and a long-lived access token.
3. Copy `.env.example` to `.env.local`.
4. Set these values in Vercel Project Settings as well:

```text
INSTAGRAM_USER_ID
INSTAGRAM_ACCESS_TOKEN
META_GRAPH_API_VERSION
```

`META_GRAPH_API_VERSION` is configurable so the API version can be upgraded without editing code.

The browser requests `/api/instagram`. The function:

- requests image URL, thumbnail, date, caption, media type, and permalink;
- caches successful responses for one hour at Vercel's edge;
- returns `outputs/data/instagram-fallback.json` if credentials are missing or Meta is unavailable.

Do not commit `.env` or `.env.local`.

## Manual fallback

Edit `outputs/data/instagram-fallback.json` and place local images under `outputs/assets/instagram/`.

## Deploy

Import the repository into Vercel and add the environment variables. `vercel.json` serves the static files from `outputs` while keeping `/api/instagram` as a Serverless Function.
