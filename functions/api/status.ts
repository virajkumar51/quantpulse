interface Env {
  ALPHA_VANTAGE_API_KEY?: string;
  GEMINI_API_KEY?: string;
}
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({
    marketData: Boolean(env.ALPHA_VANTAGE_API_KEY),
    ai: Boolean(env.GEMINI_API_KEY),
    mode: "API configuration status only; data availability depends on provider limits."
  }, { headers: { "Cache-Control": "no-store" } });
};
