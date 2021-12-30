import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";

const oauth2Client = new OAuth2Client({
  clientId: "<your client id>",
  clientSecret: "<your client secret>",
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  redirectUri: "http://localhost:8000/oauth2/callback",
  defaults: {
    scope: "read:user",
  },
});
const server = serve({ port: 8000 });

for await (const req of server) {
  const path = req.url.split("?")[0];
  switch (path) {
    case "/login":
      await redirectToAuthEndpoint(req);
      break;
    case "/oauth2/callback":
      handleCallback(req);
      break;
    default:
      req.respond({ status: 404 });
  }
}

async function redirectToAuthEndpoint(req: ServerRequest): Promise<void> {
  await req.respond({
    status: 302,
    headers: new Headers({
      Location: oauth2Client.code.getAuthorizationUri().toString(),
    }),
  });
}

async function handleCallback(req: ServerRequest): Promise<void> {
  // Exchange the authorization code for an access token
  const tokens = await oauth2Client.code.getToken(req.url);

  // Use the access token to make an authenticated API request
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const { name } = await userResponse.json();

  await req.respond({ body: `Hello, ${name}!` });
}