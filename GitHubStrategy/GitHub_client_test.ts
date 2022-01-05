import { assert } from 'https://deno.land/std@0.119.0/testing/asserts.ts';
import { GitHubClient } from './GitHub_client.ts';
import { GitHubStrategy } from './GitHub_Auth.ts'

Deno.test("GitHubClient.code is created", () => {
  const client = new GitHubClient({
    clientId: "",
    clientSecret: "",
    redirect: "",
    tokenUri: "",
    scope: ""
  });
  assert(client.code instanceof GitHubStrategy);
});