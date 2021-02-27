import { useLocation } from "react-router-dom"
import { KUDZU_AUTH_PENDING } from "../KudzuAdmin";

function NoMatch({authStatus}) {

  let location = useLocation();

  // Do nothing if we don't know the authentication status.
  if (authStatus === KUDZU_AUTH_PENDING) {
    return null;
  }

  return (
    <>
    <h1>Not Found (404)</h1>
    <h3>
      No page found for {location.pathname}
    </h3>
    </>
  )
}

export default NoMatch;
