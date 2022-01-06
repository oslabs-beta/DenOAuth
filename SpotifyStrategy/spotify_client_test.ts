import { assert } from 'https://deno.land/std@0.119.0/testing/asserts.ts';
import { SpotifyClient } from './spotify_client.ts';
import { SpotifyStrategy } from './spotify_Auth.ts'

Deno.test("SpotifyClient.code is created", () => {
  const client = new SpotifyClient({
    clientId: "",
    clientSecret: "",
    redirect: "",
    tokenUri: "",
    scope: ""
  });
  assert(client.code instanceof SpotifyStrategy);
});