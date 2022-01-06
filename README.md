# DenOAuth
A library for implementing authentication through third party APIs in Deno applications. 
DenOAuth attempts to create middleware that can be utilized in any type of application without reliance on other third party modules. It is currently available with apps running on Oak, Abc, Pogo and Opine application frameworks.

DenOAuth was inspired by js-client-oauth2

# v1.0.5
Currently DenOAuth supports strategies for LinkedIn, GitHub, Google, and Spotify.

# Three part strategy
DenOAuth has a three part process for authorization through each specific api.
 
 First: Initialize a new object for each client:

  ```
  const GitHubObject = new GitHubClient({
    clientId: '<your client id>',
    clientSecret: "<your client id>",
    tokenUri: 'https://github.com/login/oauth/access_token',
    redirect: "http://localhost:3000/auth/github/callback", // The redirect uri is added in the GitHub OAuth developer settings
    scope: "read:user" 
});
```
  
  Second: Call our createLink function to redirect the user to enter their credentials for authorization.
  

  ```  
  ctx.response.body = {
        message: 'success',
        data: ctx.response.redirect(GitHubObject.code.createLink())
    };
  ```
    
  Third: Call our processAuth function, entering the current url as a parameter. This will extract the current code, exchanging the code
   for a bearer token. The function then exchanges the token for the information about the user provided from the third party API. 
  

  ```
  const userProfile = await GitHubObject.code.processAuth(ctx.request.url);
  ```

# Example with the LinkedIn API using oak

```import { Application } from "https://deno.land/x/oak/mod.ts"
import { renderFileToString } from "https://deno.land/x/dejs@0.10.2/mod.ts";
import { LinkedInClient } from 'https://deno.land/x/denoauth@v1.0.5/mod.ts'
import { Router } from "https://deno.land/x/oak/mod.ts"


const LinkedInObject = new LinkedInClient({
    clientId: '<your client id>',
    clientSecret: '<your client id>',
    tokenUri: 'https://api.linkedin.com/v2/me',
    redirect: 'http://localhost:3000/auth/linkedin/callback', // The redirect uri is added in the LinkedIn OAuth developer settings
    scope: 'r_liteprofile'
});


const router = new Router();

const port: String|any = 3000
const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

//Rendering a login page to add login buttons for each third party api
router.get('/login', async (ctx) => {
    ctx.response.body = await renderFileToString(
        `${Deno.cwd()}/views/login.html`,
        {},
      );
})


//When clicked, the user is redirected to enter credentials and then redirected to the callback uri
router.get('/linkedin', (ctx) => {
    ctx.response.body = {
        message: 'success',
        data: ctx.response.redirect(LinkedInObject.code.createLink())
    };
})


router.get('/auth/linkedin/callback', async (ctx) => {

    // Exchange the authorization code for an access token and exchange token for profile
    const userProfile = await LinkedInObject.code.processAuth(ctx.request.url);
    
    // userProfile is an object of information given by LinkedIn. You can destructure the object to grab specific information
    const {localizedFirstName} = userProfile;

    ctx.response.body = `Hello ${localizedFirstName}`;
})




console.log(`Server running on port ${port}`)

await app.listen({port: +port})
```

# Stretch Features
Above is an example of how someone can impliment our middleware into their application, but we still would like to add refresh tokens, 
and would like to include many more third party apis.

# How To Contribute
We would love to hear your experience and get your feedback on our modules. Feel free to send us any issues, concerns, or suggestions, in our Issues section, or simply contact us through LinkedIn.

# Developers

[*DenOAuth website*]

Nick Echols :: [LinkedIn](https://www.linkedin.com/in/nickechols87/) | [GitHub](https://github.com/Nechols87)

Dan Nguyen :: [LinkedIn](https://www.linkedin.com/in/danlord-nguyen/) | [GitHub](https://github.com/Danlordrises)

Matt Miller :: [LinkedIn](https://www.linkedin.com/in/matthew-miller2020/) | [GitHub](https://github.com/matthewjohnmiller2020)

Max Lee :: [LinkedIn](https://www.linkedin.com/in/max-lee1) | [GitHub](https://github.com/maxolee23/)
