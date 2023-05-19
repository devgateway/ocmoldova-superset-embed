import { useEffect } from "react"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import "./App.css"


async function fetchAccessToken() {
  try {
    const body = {
      username: "",
      password: "",
      provider: "db",
      refresh: true,
    }

    const response = await fetch(
      "http://localhost:8088/api/v1/security/login",
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
    const payload = {
      "user": {
        "username": "guest",
        "first_name": "Guest",
        "last_name": "User"
      },
      "resources": [{
        "type": "dashboard",
        "id": "7"
      }],
      "rls": []
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(
      "http://localhost:8088/api/v1/security/guest_token",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: headers
      }
    )
    const jsonResponse = await response.json()
    return jsonResponse?.token
  } catch (error) {
    console.error(error)
  }
}


function App() {
  const getToken = async () => {
    const token = await fetchGuestToken();
    return token;
  }

  useEffect(() => {
    const embed = async () => {
      await embedDashboard({
        id: "f167fcca-0312-484c-8364-2a7a377c75d3", // given by the Superset embedding UI
        supersetDomain: "http://localhost:8088",
        mountPoint: document.getElementById("dashboard"), // html element in which iframe render
        fetchGuestToken: () => "",
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