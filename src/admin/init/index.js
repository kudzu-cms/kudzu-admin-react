import { Button, TextField } from "@material-ui/core";
import { KUDZU_BASE_URL } from "../../KudzuAdmin";

function Init() {
  return (
    <>
    <div style={{maxWidth: "960px", margin: "0 auto"}}>
    <h1>Welcome to Kudzu</h1>
    <p>
      This is your first time using the system. You will need to provide some basic information to get started.
    </p>
    </div>
    <form onSubmit={handleSubmit} style={{maxWidth: "960px", margin: "0 auto"}}>
    <h3>Configuration</h3>
    <div style={{marginBottom: '10px'}}>
      <TextField fullWidth label="Site name" placeholder="Enter the name of your site" name="name" required={true} />
    </div>

    <div style={{marginBottom: '50px'}}>
      <TextField fullWidth label="Domain" placeholder="Enter your domain name" name="domain" required={true} />
    </div>
    <h3>Administrative user</h3>
    <div style={{marginBottom: '10px'}}>
      <TextField fullWidth label="Email" placeholder="Enter your email address" type="email" name="email" required={true} />
    </div>
    <div style={{marginBottom: '20px'}}>
      <TextField fullWidth label="Password" placeholder="Choose a password" type="password" name="email" required={true} />
    </div>
    <div>
      <Button type='submit' variant='contained' size='large' color='primary'>
        Start
      </Button>
    </div>
  </form>
  </>
  )
}

function handleSubmit(event) {
  // event.preventDefault();
  // const data = {};
  // axios.post(`${KUDZU_BASE_URL}/admin/login`, qs.stringify(data), {
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  //   },
  //   withCredentials: false,
  // })
  // .then((response) => {
  //   console.log(response);
  // })
  // .catch((error) => {
  //   console.error(error);
  // });
}

export default Init;
