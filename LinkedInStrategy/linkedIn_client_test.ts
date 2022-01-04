import { assert } from 'https://deno.land/std@0.119.0/testing/asserts.ts';
import { LinkedInClient } from './linkedIn_client.ts';
import { LinkedInStrategy } from './linkedIn_Auth.ts'

Deno.test("LinkedInClient.code is created", () => {
  const client = new LinkedInClient({
    clientId: "",
    clientSecret: "",
    redirect: "",
    tokenUri: "",
    scope: ""
  });
  assert(client.code instanceof LinkedInStrategy);
});

// const LinkedInObject = new LinkedInClient({
//   clientId: clientId,
//   clientSecret: clientKey,
//   redirect: redirect,
//   tokenUri: 'https://api.linkedin.com/v2/me',
//   scope: scope
// });