import { useEffect } from "react"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import "./App.css"



const supersetUrl=process.env.REACT_APP_SUPERSET_URL;


async function fetchAccessToken() {
  try {
    const body = {
      username: "tokencreator", //this user only creates guest tokens, has no other access. Therefore we can use it in the frontend
      password: "tokencreator",
      provider: "db",
      refresh: true,
    }

    const response = await fetch(supersetUrl+'/api/v1/security/login',
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const jsonResponse = await response.json()
    return jsonResponse?.access_token
  } catch (e) {
    console.error(e)
  }
}

async function fetchGuestToken() {
  const accessToken = await fetchAccessToken();
  try {
      var data = {
        "user": {
          "username": "guest",
          "first_name": "Guest",
          "last_name": "Guest"
        },
        "resources": [{
          "type": "dashboard",
          "id": "14"
        }],
        "rls": []
      };

    const response = await fetch(supersetUrl+'/api/v1/security/guest_token/', 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });

    const jsonResponse = await response.json()
    return jsonResponse?.token
  } catch (error) {
    console.error(error)
  }
};


function App() {
 

  useEffect(() => {
    const embed = async () => {
      var guestToken = await fetchGuestToken();
      await embedDashboard({
        id: "d025df9e-7e8b-4c9a-a8f4-8ec781c075fe", // given by the Superset embedding UI
        supersetDomain: supersetUrl,
        mountPoint: document.getElementById("dashboard"), // html element in which iframe render
        fetchGuestToken: () => guestToken,
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: true,
          hideTab: true,
        },
      })
    }
    if (document.getElementById("dashboard")) {
      embed()
    }
  }, [])

  return (
    <div className="App">
      <h1>How to Embed Superset Dashboard into React</h1>
      <div id="dashboard" />
      <h1>How to Embed Superset Dashboard into React</h1>
    </div>
  )
}

export default App