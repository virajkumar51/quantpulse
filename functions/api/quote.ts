interface Env { ALPHA_VANTAGE_API_KEY?: string; }
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const symbol = (new URL(request.url).searchParams.get("symbol") || "").trim().toUpperCase();
  if (!/^[A-Z0-9._-]{1,20}$/.test(symbol)) return Response.json({ error: "Please provide a valid ticker symbol." }, { status: 400 });
  if (!env.ALPHA_VANTAGE_API_KEY) return Response.json({ error: "ALPHA_VANTAGE_API_KEY is not configured." }, { status: 503 });
  const upstream = new URL("https://www.alphavantage.co/query");
  upstream.searchParams.set("function", "GLOBAL_QUOTE");
  upstream.searchParams.set("symbol", symbol);
  upstream.searchParams.set("apikey", env.ALPHA_VANTAGE_API_KEY);
  const resp = await fetch(upstream.toString(), { headers: { "Accept": "application/json" } });
  if (!resp.ok) return Response.json({ error: "Market data provider request failed." }, { status: 502 });
  const data: any = await resp.json();
  if (data.Note || data.Information) return Response.json({ error: data.Note || data.Information }, { status: 429 });
  const q = data["Global Quote"];
  if (!q || !q["05. price"]) return Response.json({ error: "No quote returned. The symbol may be unsupported, unavailable on your plan, or the provider quota may be exhausted." }, { status: 404 });
  const price = Number(q["05. price"]);
  const change = Number(q["09. change"] || 0);
  const changePct = Number(String(q["10. change percent"] || "0").replace("%",""));
  return Response.json({
    symbol: q["01. symbol"] || symbol,
    price,
    change,
    changePct,
    currency: "USD",
    quoteDate: q["07. latest trading day"] || null,
    source: "Alpha Vantage Global Quote",
    note: "Currency is not guaranteed by this endpoint. Verify exchange and quote currency before comparing."
  }, { headers: { "Cache-Control": "public, max-age=60" } });
};
