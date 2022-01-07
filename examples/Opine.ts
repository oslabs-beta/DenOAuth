import { opine, serveStatic } from "https://deno.land/x/opine@2.0.2/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.10.2/mod.ts";
import { GitHubClient, LinkedInClient, GoogleClient, SpotifyClient, DiscordClient } from 'https://deno.land/x/denoauth@v1.0.4/mod.ts'


const app = opine();



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

app.engine('.html', renderFileToString);  
app.use(serveStatic("html"));

app.get('/login', (req, res) => {
    res.render('login.html')
})

app.get('/gitHub', (req, res) => {
  res.redirect(GitHubObject.code.createLink())
})
app.get('/linkedin', (req, res) => {
  res.redirect(LinkedInObject.code.createLink())
})

app.get('/google', (req, res) => {
  res.redirect(GoogleObject.code.createLink())
})

app.get('/spotify', (req, res) => {
  res.redirect(SpotifyObject.code.createLink())
})

app.get('/discord', (req, res) => {
  res.redirect(DiscordObject.code.createLink())
})

app.get('/auth/github/callback', async (req, res) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GitHubObject.code.processAuth(req._parsedUrl);
    // userProfile is an object of information given by GitHub. You can destructure the object to grab specific information
    const { name } = userProfile;
    
    res.send(`Hello, ${name}!`);
})

app.get('/auth/linkedin/callback', async (req, res) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await LinkedInObject.code.processAuth(req._parsedUrl);
    // userProfile is an object of information given by LinkedIn. You can destructure the object to grab specific information
    const {localizedFirstName} = userProfile;

    res.send(`Hello ${localizedFirstName}`);
})


app.get('/auth/google/callback', async (req, res) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GoogleObject.code.processAuth(req._parsedUrl);
    // userProfile is an object of information given by Google. 
    //You can destructure the object to grab specific information once the app has been verified
    res.send(`Hello, this is where your secret page lives`);
})

app.get('/auth/spotify/callback', async (req, res) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await SpotifyObject.code.processAuth(req.url);
    // userProfile is an object of information given by Spotify. You can destructure the object to grab specific information
    const { display_name } = userProfile;
    
    return (`Hello ${ display_name }`)
})

app.get('/auth/discord/callback', async (req, res) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await DiscordObject.code.processAuth(req.url);
    // userProfile is an object of information given by Discord. You can destructure the object to grab specific information
    const { username } = userProfile;

    console.log(`Hello ${ username }`);
})

app.listen(
    3000,
    () => console.log("server has started on http://localhost:3000 🚀"),
  );
