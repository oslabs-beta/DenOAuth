const createLink: Function = (cliendId:String, redirect:any, scope:any) => {
    const state: Number = Math.floor(Math.random() * 1000000000)
    const encodeLink: any = encodeURIComponent(redirect)
    const encodeScope: any = encodeURIComponent(scope)
    let SampleLink: String = `https://github.com/login/oauth/authorize?response_type=code&client_id=${cliendId}&redirect_uri=${encodeLink}&state=${state}&scope=${encodeScope}`
    return SampleLink
  }
  
  console.log(createLink('8d769a8e565111f853fb', "http://localhost:3000/auth/github/callback", "read:user"))
  
  // creates OAuth connection
const OauthOne = async (ctx:any, next:any) => {
    let sessionId: Number = Math.floor(Math.random() * 1000000000);
    await client.connect()
    await client.queryObject("INSERT INTO session(session_id) VALUES($1)", sessionId)
    ctx.response.body = {
        message: 'success',
        // data: ctx.response.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=8693ww7e9p6u3t&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fstore&state=foobar&scope=r_liteprofile`)
        
    };

    ctx.cookies.set('test', sessionId, {httpOnly: true})

}    
//github old example
const router = new Router();
router.get("/login", (ctx) => {
  ctx.response.redirect(
    oauth2Client.code.getAuthorizationUri(),
  );
});

// check if loggin in or out | example for consumers
const sessionCheck = async (ctx:any, next:any) => {
  const jwt = await ctx.cookies.get("jwt") || '' ;
  if(jwt) {
    await next()
  } else {
  const test = await ctx.cookies.get("test") || '';
  console.log(test)
  if (!test) {
    ctx.response.body = 401;
    ctx.response.body = {
        message: 'unauthenticated',
        data: ctx.response.redirect('./login')
    };
    return 
}
  // add query to DB
  const token = await client.queryObject(`SELECT * FROM session WHERE session_id = '${ test }'`)
  if (!token){
      ctx.response.body = 401;
      ctx.response.body = {
          message: 'unauthenticated',
          data: ctx.response.redirect('./login')
      } 
  } 
  await next();
  return;
}
};  

export { }