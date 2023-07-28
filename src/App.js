import { useEffect } from "react"
import { embedDashboard } from "@superset-ui/embedded-sdk"
import "./App.css"
import { iframeResizer } from 'iframe-resizer';

const supersetUrl = process.env.REACT_APP_SUPERSET_URL ? process.env.REACT_APP_SUPERSET_URL : "http://localhost:8088";

async function fetchCustomFieldsForCurrentPage() {
  try {
    var urlParts = window.location.pathname.split('/');
    var slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2]; // In case of trailing '/'

    const origin = window.location.origin;
    const response = await fetch(`${origin}/wp-json/customRest/v1/page-meta/${slug}`);
    const jsonResponse = await response.json();
    console.log("jsonResponse=", jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAccessToken() {
  try {
    const body = {
      username: "tokencreator", //this user only creates guest tokens, has no other access. Therefore we can use it in the frontend
      password: "tokencreator",
      provider: "db",
      refresh: true,
    }

    const response = await fetch(supersetUrl + '/api/v1/security/login',
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

async function fetchGuestToken(dashboardId) {
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
        "id": `${dashboardId}`
      }],
      "rls": []
    };

    const response = await fetch(supersetUrl + '/api/v1/security/guest_token/',
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

function findIframeAndSetId(ed) {
  const iframe = document.getElementById("dashboard").getElementsByTagName('iframe')[0];
  iframe.id = 'iframe';
  return iframe;
}

function App() {

  useEffect(() => {
    const embed = async () => {
      var customFields = await fetchCustomFieldsForCurrentPage();
      const dashboardId = customFields.dashboardId[0];
      const embedDashboardHash = customFields.embedDashboardHash[0];
      console.log("dashboardId=", dashboardId);
      console.log("embedDashboardHash=", embedDashboardHash);

      var guestToken = await fetchGuestToken(dashboardId);
      var embedDashboardResponse = await embedDashboard({
        id: `${embedDashboardHash}`, // given by the Superset embedding UI
        supersetDomain: supersetUrl,
        mountPoint: document.getElementById("dashboard"), // html element in which iframe render
        fetchGuestToken: () => guestToken,
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: false,
          hideTab: false,
        },
      });

      const iframe = findIframeAndSetId(embedDashboardResponse);
      iframeResizer({ log: false }, '#' + iframe.id);
    }
    if (document.getElementById("dashboard")) {
      embed()
    }
  }, [])

  return (
    <div className="App" id="dashboard">
    </div>
  )
}

export default App