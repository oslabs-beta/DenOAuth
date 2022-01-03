import { GitHubClient } from './GitHub_client.ts';

export abstract class GitHubGrant {
	constructor(
	protected readonly client: GitHubClient
) {}
}

export class GitHubStrategy extends GitHubGrant {
  constructor(
    client: GitHubClient
  ) {
    super(client);
  }

  
  // part 1
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink = () => {
    const state: Number = Math.floor(Math.random() * 1000000000)
    const encodeLink: any = encodeURIComponent(this.client.config.redirect)
    const encodeScope: any = encodeURIComponent(this.client.config.scope)
    let SampleLink: String = `https://github.com/login/oauth/authorize?response_type=code&client_id=${this.client.config.cliendId}&redirect_uri=${encodeLink}&state=${state}&scope=${encodeScope}`
    return SampleLink
  }


   // part 2
  async processAuth(stringPathName:string) {
   /**
   * Parses the authorization response request tokens from the authorization server.
   */
    const code:string = JSON.stringify(stringPathName.search);
    const parsedCode:string = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));
    const userResponse:any = [];
    
   /** Exchange the authorization code for an access token */
   await fetch('https://github.com/login/oauth/access_token',{
    method: 'POST',
      headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: this.client.config.clientId,
      client_secret: this.client.config.clientKey,
      code: parsedCode,
      redirect_uri: "http://localhost:3000/auth/github/callback"
  })
})
.then((response: any) => {
  // console.log(response)
  return response.text()
})
.then( async (paramsString: any) => {
  let params = new URLSearchParams(paramsString)
  // console.log(params)
  let tokenKey = [];
  for (const [key, value] of params.entries()){
  // for (const key in params){
    
    tokenKey.push(key, value)
  }
  console.log(tokenKey[0])
  let obj: any = tokenKey[0]
  let values = Object.values(obj)
  // console.log(values)
  const tokenArr = []
  let i = 17;
  while (values[i] !== '"') {
    tokenArr.push(values[i])
    i++
  }
  const bearerToken = tokenArr.join('')

          /** Use the access token to make an authenticated API request */
          await fetch("https://api.github.com/user", {
            headers: {
            Authorization: `Bearer ${bearerToken}`,
                },
            })
              .then(response => response.json())
              .then(data => {
                console.log(data)
                userResponse.push(data)
              })
              .catch(console.error)
        }) 
        return userResponse[0];
    } 
}
