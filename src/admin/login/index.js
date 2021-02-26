import Page from "../../layout/page";

const { Button, TextField } = require("@material-ui/core");

function Login({baseUrl}) {
  return (
  <Page>
  <h1>Login</h1>
  <form method="post" action={`${baseUrl}/admin/login`}>

    <div style={{marginBottom: '10px'}}>
      <TextField fullWidth label="Email address" placeholder="Enter your email address e.g. you@example.com" type="email" name="email" required={true} />
    </div>

    <div style={{marginBottom: '10px'}}>
      <TextField fullWidth label="password" placeholder="Enter your password" type="password" name="password" required={true} />
    </div>

    <div>
      <Button type='submit' variant='contained' size='large' color='primary' style={{marginRight: '5px'}}>
        Log in
      </Button>
      <Button href={`${baseUrl}/admin/recover`} variant='contained' size='large'>
        Forgot password?
      </Button>
    </div>
  </form>
  </Page>
  )
}

export default Login
