export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    scope: 'repo',
    redirect_uri: `https://owen-chess-website.vercel.app/api/callback`,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
