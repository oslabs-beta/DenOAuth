import { Application } from "https://deno.land/x/oak/mod.ts"
import { renderFileToString } from "https://deno.land/x/dejs@0.10.2/mod.ts";
import { GitHubClient, LinkedInClient, GoogleClient } from 'https://deno.land/x/denoauth@v1.0.0/mod.ts'
import { Router } from "https://deno.land/x/oak/mod.ts"


const GitHubObject = new GitHubClient({
    clientId: '<your_cliendId>',
    clientSecret: "<your_cliendSecret>",
    tokenUri: 'https://github.com/login/oauth/access_token',
    redirect: "http://localhost:3000/auth/github/callback",
    scope: "read:user"
});

const LinkedInObject = new LinkedInClient({
    clientId: '<your_cliendId>',
    clientSecret: '<your_cliendSecret>',
    tokenUri: 'https://api.linkedin.com/v2/me',
    redirect: 'http://localhost:3000/auth/linkedin/callback',
    scope: 'r_liteprofile'
});

const GoogleObject = new GoogleClient({
    clientId: '<your_cliendId>',
    clientSecret: '<your_cliendSecret>',
    tokenUri: 'https://accounts.google.com/o/oauth2/token',
    redirect: 'http://localhost:3000/auth/google/callback',
    scope: 'https://mail.google.com&access_type=offline&include_granted_scopes=true'
});

const router = new Router();

const port: String|any = 3000
const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

router.get('/login', async (ctx) => {
    ctx.response.body = await renderFileToString(
        `${Deno.cwd()}/views/login.html`,
        {},
      );
})

router.get('/gitHub', (ctx) => {
    ctx.response.body = {
        message: 'success',
        data: ctx.response.redirect(GitHubObject.code.createLink())
    };
})
router.get('/linkedin', (ctx) => {
    ctx.response.body = {
        message: 'success',
        data: ctx.response.redirect(LinkedInObject.code.createLink())
    };
})
router.get('/google', (ctx) => {
    ctx.response.body = {
        message: 'success',
        data: ctx.response.redirect(GoogleObject.code.createLink())
    };
})

router.get('/auth/github/callback', async (ctx) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GitHubObject.code.processAuth(ctx.request.url);
    // userProfile is an object of information given by GitHub. You can destructure the object to grab specific information
    const { name } = userProfile;
    
    ctx.response.body = `Hello, ${name}!`;
})

router.get('/auth/linkedin/callback', async (ctx) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await LinkedInObject.code.processAuth(ctx.request.url);
    // userProfile is an object of information given by LinkedIn. You can destructure the object to grab specific information
    const {localizedFirstName} = userProfile;

    ctx.response.body = `Hello ${localizedFirstName}`;
})


router.get('/auth/google/callback', async (ctx) => {
    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile: any = await GoogleObject.code.processAuth(ctx.request.url);
    // userProfile is an object of information given by Google. 
    //You can destructure the object to grab specific information once the app has been verified
    ctx.response.body = `Hello, this is where your secret page lives`;
})




console.log(`Server running on port ${port}`)

await app.listen({port: +port})
