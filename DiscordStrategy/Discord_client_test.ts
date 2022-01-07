import { assert } from 'https://deno.land/std@0.119.0/testing/asserts.ts';
import { DiscordClient } from './Discord_client.ts';
import { DiscordStrategy } from './Discord_Auth.ts'

Deno.test("DiscordClient.code is created", () => {
  const client = new DiscordClient({
    clientId: "",
    clientSecret: "",
    redirect: "",
    tokenUri: "",
    scope: ""
  });
  assert(client.code instanceof DiscordStrategy);
});