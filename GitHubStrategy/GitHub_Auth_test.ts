import { GitHubClient } from './GitHub_client.ts';
// import { GitHubStrategy } from './GitHub_Auth.ts';
import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts"

Deno.test("GitHub's createLink method should return the correct url", () => {
  const client = new GitHubClient({
    clientId: '688zz8dnnxjo4t',
    clientSecret: 'YHhQQW3BaNQCFilB',
    redirect: 'http://localhost:3000/auth/github/callback',
    tokenUri: 'https://github.com/login/oauth/access_token',
    scope: 'read:user'
  });

  const dummy = client.code.createLink()
  const dummyEncode = encodeURIComponent('http://localhost:3000/auth/github/callback')
  const dummyScope = encodeURIComponent('read:user')
  const dummyState = dummy.slice((dummy.indexOf('&state') + 7), dummy.indexOf('&scope'));

  assertEquals(
    dummy,
    `https://github.com/login/oauth/authorize?response_type=code&client_id=688zz8dnnxjo4t&redirect_uri=${dummyEncode}&state=${dummyState}&scope=${dummyScope}`
    );
});

Deno.test("parsedCode should parse the URL correctly", () => {

  const randomizedCode = Math.random().toString(36).substring(2,13);

  const fakeStringPathName = (`?code=${randomizedCode}&state=962380336`)
  const code:string = JSON.stringify(fakeStringPathName);
  const parsedCodeTest = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));
  
  assertEquals(
    randomizedCode,
    parsedCodeTest
  )
});