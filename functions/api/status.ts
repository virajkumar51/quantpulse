
export default async () => {
  const marketData = Boolean(process.env.ALPHA_VANTAGE_API_KEY);
  const ai = Boolean(process.env.GEMINI_API_KEY);

  return new Response(
    JSON.stringify({
      marketData,
      ai,
      mode: "API configuration status only; data availability depends on provider limits."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
};
