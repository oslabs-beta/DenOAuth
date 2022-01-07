import { DiscordClient } from './Discord_client.ts';
// import { LinkedInStrategy } from './linkedIn_Auth.ts';
import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts"

Deno.test("Discord's createLink method should return the correct url", () => {
  const client = new DiscordClient({
    clientId: '688zz8dnnxjo4t',
    clientSecret: 'YHhQQW3BaNQCFilB',
    redirect: 'http://localhost:3000/auth/discord/callback',
    tokenUri: 'https://discord.com/api/oauth2/token',
    scope: 'identify'
  });

  const dummy = client.code.createLink()
  const dummyEncode = encodeURIComponent('http://localhost:3000/auth/discord/callback')
  const dummyEncodeScope = encodeURIComponent('identify')
  const dummyState = dummy.slice(dummy.indexOf('&state') + 7);

  assertEquals(
    dummy,
    `https://discord.com/api/oauth2/authorize?response_type=code&client_id=688zz8dnnxjo4t&scope=${dummyEncodeScope}&state=${dummyState}&redirect_uri=${dummyEncode}`
    );
});

Deno.test("parsedCode should parse the URL correctly", () => {

  const randomizedCode = Math.random().toString(36).substring(2,13);

  const fakeStringPathName = (`?code=${randomizedCode}&state=777578398`)
  const code:string = JSON.stringify(fakeStringPathName);
  const parsedCodeTest = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));
  
  assertEquals(
    randomizedCode,
    parsedCodeTest
  )
});

