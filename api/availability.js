const browserHeaders = {
  Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,az;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};

const allowedHosts = new Set(["www.airbnb.com", "airbnb.com", "ical.booking.com"]);

async function fetchAvailabilityFeed(feedUrl) {
  const referer = feedUrl.hostname.includes("booking.com")
    ? "https://www.booking.com/"
    : "https://www.airbnb.com/";

  const primary = await fetch(feedUrl.toString(), {
    headers: {
      ...browserHeaders,
      Referer: referer,
      Origin: referer,
    },
  });

  if (primary.ok) {
    return primary;
  }

  return fetch(feedUrl.toString(), {
    headers: {
      ...browserHeaders,
      Referer: referer,
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method not allowed");
    return;
  }

  const rawUrl = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;

  if (!rawUrl) {
    res.status(400).send("Missing url parameter");
    return;
  }

  try {
    const upstream = new URL(rawUrl);
    if (upstream.protocol !== "https:" || !allowedHosts.has(upstream.hostname)) {
      throw new Error("Unsupported feed host");
    }

    const response = await fetchAvailabilityFeed(upstream);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(text);
  } catch (error) {
    res
      .status(502)
      .send(error instanceof Error ? error.message : "Failed to proxy calendar feed");
  }
}
