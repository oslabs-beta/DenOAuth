import { assert } from 'https://deno.land/std@0.119.0/testing/asserts.ts';
import { GoogleClient } from './Google_client.ts';
import { GoogleStrategy } from './Google_Auth.ts'

Deno.test("GoogleClient.code is created", () => {
  const client = new GoogleClient({
    clientId: "",
    clientSecret: "",
    redirect: "",
    tokenUri: "",
    scope: ""
  });
  assert(client.code instanceof GoogleStrategy);
});