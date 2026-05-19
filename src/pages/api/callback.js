export const prerender = false;

export async function GET({ request }) {
  const code = new URL(request.url).searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.OAUTH_CLIENT_ID,
      client_secret: import.meta.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  const status = data.error ? 'error' : 'success';
  const payload = data.error
    ? { error: data.error }
    : { token: data.access_token, provider: 'github' };

  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;

  return new Response(
    `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  var msg = ${JSON.stringify(message)};
  function receiveMessage(e) {
    window.opener.postMessage(msg, e.origin);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
