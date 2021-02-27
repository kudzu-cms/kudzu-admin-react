import { useLocation } from "react-router-dom"

function NoMatch() {
  let location = useLocation();
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
