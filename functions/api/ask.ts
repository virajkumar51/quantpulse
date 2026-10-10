interface Env { GEMINI_API_KEY?: string; }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GEMINI_API_KEY) return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 503 });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON request." }, { status: 400 }); }
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 1200) : "";
  if (!question) return Response.json({ error: "Enter a question." }, { status: 400 });
  const stock = body?.stock && typeof body.stock === "object" ? body.stock : {};
  const context = {
    symbol: String(stock.symbol || "unknown").slice(0, 24),
    name: String(stock.name || "Unknown company").slice(0, 120),
    sector: String(stock.sector || "Unknown").slice(0, 100),
    displayedPrice: stock.price ?? null,
    currency: String(stock.currency || "unknown").slice(0, 8),
    pe: stock.pe ?? null,
    revenueGrowth: stock.revenueGrowth ?? null,
    netMargin: stock.netMargin ?? null,
    debtEquity: stock.debtEquity ?? null,
    description: String(stock.description || "").slice(0, 700)
  };
  const prompt = `You are QuantPulse, an educational stock research assistant. The user is asking about a company. Treat all numbers in the supplied context as DEMO/illustrative values unless the context explicitly includes a verified source and timestamp (it does not). Never describe these as current real-world facts. Do not invent data, live news, prices, or filings. Explain uncertainty, define metrics simply, discuss risks and what to verify. Do not promise returns or provide personalized buy/sell instructions. If the user asks for missing real-world facts, say they must be retrieved from a reliable source. Keep the answer clear and concise.\\n\\nCompany context (unverified demo values): ${JSON.stringify(context)}\\n\\nUser question: ${question}`;
  const model = "gemini-3.8-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY!)}`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 650 } })
  });
  const data: any = await resp.json().catch(() => ({}));
  if (!resp.ok) return Response.json({ error: data?.error?.message || "AI provider request failed. Check model availability, key, and free-tier quota." }, { status: resp.status === 429 ? 429 : 502 });
  const answer = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("").trim();
  if (!answer) return Response.json({ error: "AI returned no answer." }, { status: 502 });
  return Response.json({ answer }, { headers: { "Cache-Control": "no-store" } });
};
