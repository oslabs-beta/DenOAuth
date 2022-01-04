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

// SampleLink: String = 'https://github.com/login/oauth/authorize?response_type=code&client_id=${your_clientId}&redirect_uri=${your_encoded_redirect_Link}&state=${foobar}&scope=${your_encoded_scope}'

  // part 1
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink = () => {
    const state: number = Math.floor(Math.random() * 1000000000)
    const encodeLink: string = encodeURIComponent(this.client.config.redirect)
    const encodeScope: string = encodeURIComponent(this.client.config.scope)
    const SampleLink = `https://github.com/login/oauth/authorize?response_type=code&client_id=${this.client.config.clientId}&redirect_uri=${encodeLink}&state=${state}&scope=${encodeScope}`
    return SampleLink
  }


  // part 2
  async processAuth(stringPathName:string) {
    /** Parses the authorization response request tokens from the authorization server. */
    const code:string = JSON.stringify(stringPathName.search);
    const parsedCode:string = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));
    const userResponse:unknown[] = [];
    
  /** Exchange the authorization code for an access token */
  await fetch('https://github.com/login/oauth/access_token',{
    method: 'POST',
      headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: this.client.config.clientId, //provided by GitHub
      client_secret: this.client.config.clientSecret, //provided by GitHub
      code: parsedCode,
      redirect_uri: this.client.config.redirect //provided by GitHub
      })
    })
    .then((response) => {
      return response.text()
    })
    .then( async (paramsString: any) => {
      const params = new URLSearchParams(paramsString)
      const tokenKey: unknown[] = [];
      for (const [key, value] of params.entries()){
        tokenKey.push(key, value)
        }
      const obj: any = tokenKey[0]
      const values: unknown[] = Object.values(obj)
      const tokenArr = []
      let i = 17;
        while (values[i] !== '"') {
          tokenArr.push(values[i])
          i++
        }
      const bearerToken: string = tokenArr.join('')

          /** Use the access token to make an authenticated API request */
          await fetch("https://api.github.com/user", {
            headers: {
            Authorization: `Bearer ${bearerToken}`,
                },
            })
              .then(response => response.json())
              .then(data => {
                // Returning Google Response Data in console for Client
                console.log(`GitHub Response Data: ${data}`)
                userResponse.push(data)
              })
              .catch(console.error)
      }) 
  
  return userResponse[0];
  } 
}
