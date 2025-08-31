export const runtime = "nodejs";

export async function GET() {
  try {
    const {
      GROQ_API_KEY,
      MORALIS_API_KEY,
      CRYPTOPANIC_API_KEY,
      COINGECKO_API_KEY
    } = process.env;

    return Response.json({
      groq: !!GROQ_API_KEY,
      moralis: !!MORALIS_API_KEY,
      cryptopanic: !!CRYPTOPANIC_API_KEY,
      coingecko: !!COINGECKO_API_KEY
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to check environment variables" },
      { status: 500 }
    );
  }
}
