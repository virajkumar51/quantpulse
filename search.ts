interface Env { ALPHA_VANTAGE_API_KEY?: string; }
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  if (q.length < 2) return Response.json({ results: [] });
  if (!env.ALPHA_VANTAGE_API_KEY) return Response.json({ error: "ALPHA_VANTAGE_API_KEY is not configured." }, { status: 503 });
  const upstream = new URL("https://www.alphavantage.co/query");
  upstream.searchParams.set("function", "SYMBOL_SEARCH");
  upstream.searchParams.set("keywords", q);
  upstream.searchParams.set("apikey", env.ALPHA_VANTAGE_API_KEY);
  const resp = await fetch(upstream.toString(), { headers: { "Accept": "application/json" } });
  if (!resp.ok) return Response.json({ error: "Market data provider request failed." }, { status: 502 });
  const data: any = await resp.json();
  if (data.Note || data.Information) return Response.json({ error: data.Note || data.Information }, { status: 429 });
  const matches = Array.isArray(data.bestMatches) ? data.bestMatches : [];
  const results = matches.slice(0, 10).map((x: any) => ({
    symbol: x["1. symbol"],
    name: x["2. name"],
    exchange: x["4. region"] || x["3. type"] || "Exchange varies",
    country: x["4. region"] || "International",
    currency: x["8. currency"] || "USD",
    sector: x["3. type"] || "Equity"
  })).filter((x: any) => x.symbol && x.name);
  return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=300" } });
};