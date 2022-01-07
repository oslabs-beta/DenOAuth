import { GitHubClient, LinkedInClient, GoogleClient, SpotifyClient, DiscordClient } from 'https://deno.land/x/denoauth@v1.0.6/mod.ts'
import pogo from 'https://deno.land/x/pogo/main.ts';

const server = pogo.server({ port : 3000 });


const GitHubObject = new GitHubClient({
    clientId: '<your_clientId>',
    clientSecret: "<your_clientSecret>",
    tokenUri: 'https://github.com/login/oauth/access_token',
    redirect: "http://localhost:3000/auth/github/callback",
    scope: "read:user"
});

const LinkedInObject = new LinkedInClient({
    clientId: '<your_clientId>',
    clientSecret: '<your_clientSecret>',
    tokenUri: 'https://api.linkedin.com/v2/me',
    redirect: 'http://localhost:3000/auth/linkedin/callback',
    scope: 'r_liteprofile'
});

const GoogleObject = new GoogleClient({
    clientId: '<your_clientId>',
    clientSecret: '<your_clientSecret>',
    tokenUri: 'https://accounts.google.com/o/oauth2/token',
    redirect: 'http://localhost:3000/auth/google/callback',
    scope: 'https://mail.google.com&access_type=offline&include_granted_scopes=true'
});

const SpotifyObject = new SpotifyClient({
    clientId: '<your_clientId>',
    clientSecret: '<your_clientSecret>',
    tokenUri: 'https://api.spotify.com/v1/me',
    redirect: 'http://localhost:3000/auth/spotify/callback',
    scope: 'user-read-email'
});

const DiscordObject = new DiscordClient({
    clientId: '<your_clientId>',
    clientSecret: '<your_clientSecret>',
    tokenUri: 'https://discord.com/api/oauth2/token',
    redirect: 'http://localhost:3000/auth/discord/callback',
    scope: 'identify'
});


server.router.get('/login', async (request, h) => {
    const buffer = await Deno.readFile('./login.html');
    return h.response(buffer);
});

server.router.get('/gitHub', (request, h) => {
   return h.redirect(GitHubObject.code.createLink())
})

server.router.get('/linkedin', (request, h) => {
   return h.redirect(LinkedInObject.code.createLink())
})
  
server.router.get('/google', (request, h) => {
   return h.redirect(GoogleObject.code.createLink())
})

server.router.get('/spotify', (request, h) => {
   return h.redirect(SpotifyObject.code.createLink())
})

server.router.get('/discord', (request, h) => {
   return h.redirect(DiscordObject.code.createLink())
})

server.router.get('/auth/github/callback', async (request, h) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GitHubObject.code.processAuth(request.url);
    // userProfile is an object of information given by GitHub. You can destructure the object to grab specific information
    const { name } = userProfile;
    
    return (`Hello, ${name}!`);
})

server.router.get('/auth/linkedin/callback', async (request, h) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await LinkedInObject.code.processAuth(request.url);
    // userProfile is an object of information given by LinkedIn. You can destructure the object to grab specific information
    const {localizedFirstName} = userProfile;

     return (`Hello ${localizedFirstName}`);
})


server.router.get('/auth/google/callback', async (request, h) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GoogleObject.code.processAuth(request.url);
    // userProfile is an object of information given by Google. 
    //You can destructure the object to grab specific information once the app has been verified
    return (`Hello, this is where your secret page lives`);
})

server.router.get('/auth/spotify/callback', async (request, h) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await SpotifyObject.code.processAuth(request.url);
    // userProfile is an object of information given by Spotify. You can destructure the object to grab specific information
    const { display_name } = userProfile;
    
    return (`Hello ${ display_name }`)
})

server.router.get('/auth/discord/callback', async (request, h) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await SpotifyObject.code.processAuth(request.url);
    // userProfile is an object of information given by Discord. You can destructure the object to grab specific information
    const { username } = userProfile;

    console.log(`Hello ${ username }`);
})

server.router.get('/', () => {
    return 'Hello, world!';
});

server.start();

console.log("http://localhost:3000/");
