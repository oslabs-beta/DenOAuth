import { GoogleClient } from './Google_client.ts';
import { GoogleStrategy } from './Google_Auth.ts';
import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts"

Deno.test("Google's createLink method should return the correct url", () => {
  const client = new GoogleClient({
    clientId: '688zz8dnnxjo4t',
    clientSecret: 'YHhQQW3BaNQCFilB',
    redirect: 'http://localhost:3000/auth/google/callback',
    tokenUri: 'https://accounts.google.com/o/oauth2/token',
    scope: 'https://mail.google.com&access_type=offline&include_granted_scopes=true'
  });

  const dummy = client.code.createLink()
  const dummyEncode = encodeURIComponent('http://localhost:3000/auth/google/callback')
  const dummyState = dummy.slice((dummy.indexOf('&state') + 7), dummy.indexOf('&redirect_uri'));

  assertEquals(
    dummy,
    `https://accounts.google.com/o/oauth2/v2/auth?scope=https://mail.google.com&access_type=offline&include_granted_scopes=true&response_type=code&state=${dummyState}&redirect_uri=${dummyEncode}&client_id=688zz8dnnxjo4t`
    );
});