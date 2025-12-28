export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,media_type,permalink,thumbnail_url,media_url&access_token=${token}`;

    const res = await fetch(url);
    const data = await res.json();

    // Only keep reels
    const reels = data.data.filter(item => item.media_type === "VIDEO");

    return Response.json({ reels });
  } catch (e) {
    return Response.json({ error: true, message: e.message });
  }
}
