import { useLocation } from "react-router-dom"

function NoMatch({authenticated}) {

  let location = useLocation();

  // Do nothing if we don't know the authentication status.
  if (authenticated === null) {
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
