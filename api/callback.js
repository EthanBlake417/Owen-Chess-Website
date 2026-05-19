export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const status = data.error ? 'error' : 'success';
  const payload = data.error
    ? { error: data.error }
    : { token: data.access_token, provider: 'github' };
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html><body><script>
(function() {
  var msg = ${JSON.stringify(message)};
  function receiveMessage(e) { window.opener.postMessage(msg, e.origin); }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script></body></html>`);
}
