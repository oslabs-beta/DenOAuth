import { SpotifyClient } from './spotify_client.ts';
// import { SpotifyStrategy } from './spotify_Auth.ts';
import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts"

Deno.test("Spotify's createLink method should return the correct url", () => {
  const client = new SpotifyClient({
    clientId: '688zz8dnnxjo4t',
    clientSecret: 'YHhQQW3BaNQCFilB',
    redirect: 'http://localhost:3000/auth/spotify/callback',
    tokenUri: 'https://api.spotify.com/v1/me',
    scope: 'user-read-email'
  });

  const dummy = client.code.createLink()
  const dummyState = dummy.slice((dummy.indexOf('&state') + 7));

  assertEquals(
      dummy, 
      `https://accounts.spotify.com/authorize?client_id=688zz8dnnxjo4t&scope=user-read-email&response_type=code&redirect_uri=http://localhost:3000/auth/spotify/callback&state=${dummyState}`
    );
});

Deno.test("parsedCode should parse the URL correctly", () => {

  const randomizedCode = Math.random().toString(36).substring(2,13);

  const fakeStringPathName = (`?code=${randomizedCode}&state=246276495`)
  const code:string = JSON.stringify(fakeStringPathName);
  const parsedCodeTest = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));
  
  assertEquals(
    randomizedCode,
    parsedCodeTest
  )
});