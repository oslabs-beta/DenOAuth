import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { renderFile } from "https://deno.land/x/dejs@0.10.2/mod.ts";
import { GitHubClient, LinkedInClient, GoogleClient, SpotifyClient, DiscordClient } from 'https://deno.land/x/denoauth@v1.0.4/mod.ts'


const app = new Application();


const GitHubObject = new GitHubClient({
    clientId: '<your_clientId>',
    clientSecret: '<your_clientSecret>',
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


app.static("/views", "./views/login.html");


app.renderer = {
    render<T>(name: string, data: T): Promise<Deno.Reader> {
      return renderFile(name, data);
    },
  };

app.get('/login', async (c) => {
    await c.render('./login.html');
})
.start({ port: 3000 });


app.get('/gitHub', (c) => {
    c.redirect(GitHubObject.code.createLink());
})

app.get('/linkedin', (c) => {
    c.redirect(LinkedInObject.code.createLink());
})
  
app.get('/google', (c) => {
    c.redirect(GoogleObject.code.createLink());
})

app.get('/spotify', (c) => {
    c.redirect(SpotifyObject.code.createLink());
})

app.get('/discord', (c) => {
    c.redirect(DiscordObject.code.createLink());
})

app.get('/auth/github/callback', async (c) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GitHubObject.code.processAuth(c.url);
    // userProfile is an object of information given by GitHub. You can destructure the object to grab specific information
    const { name } = userProfile;
    
    return (`Hello, ${name}!`);
})

app.get('/auth/linkedin/callback', async (c) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await LinkedInObject.code.processAuth(c.url);
    // userProfile is an object of information given by LinkedIn. You can destructure the object to grab specific information
    const {localizedFirstName} = userProfile;

    return (`Hello ${localizedFirstName}`);
})


app.get('/auth/google/callback', async (c) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GoogleObject.code.processAuth(c.url);
    // userProfile is an object of information given by Google. 
    //You can destructure the object to grab specific information once the app has been verified
    return (`Hello, this is where your secret page lives`);
})

app.get('/auth/spotify/callback', async (c) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await SpotifyObject.code.processAuth(c.url);
    // userProfile is an object of information given by Spotify. You can destructure the object to grab specific information
    const { display_name } = userProfile;
    
    return (`Hello ${ display_name }`);
})

app.get('/auth/discord/callback', async (c) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await DiscordObject.code.processAuth(c.url);
    // userProfile is an object of information given by Discord. You can destructure the object to grab specific information
    const { username } = userProfile;

    console.log(`Hello ${ username }`);
})

console.log("http://localhost:3000/");