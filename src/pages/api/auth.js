export const prerender = false;

export async function GET({ request, redirect }) {
  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    client_id: import.meta.env.OAUTH_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: `${origin}/api/callback`,
  });
  return redirect(`https://github.com/login/oauth/authorize?${params}`);
}
