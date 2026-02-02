// app.js – DaVinci widget launcher

// 🔧 CONFIG – update these for your environment
const PINGONE_ENV_ID  = "865ad4fe-8d3c-415d-a9d3-59373d34b42b";       // PingOne Protect Environment ID
const COMPANY_ID      = "865ad4fe-8d3c-415d-a9d3-59373d34b42b";   // DaVinci Company ID
const POLICY_ID       = "4860ba0c8cf79e509c6fcfe13594cc44";    // DaVinci Flow Policy ID
const REGION          = "com";                       // PingOne Region: "com", "ca", "eu", "asia", "com.au"

// Backend that returns { access_token } (SDK token)
const BACKEND_BASE_URL = "http://localhost:3001"
const DV_SDK_TOKEN_ENDPOINT = `${BACKEND_BASE_URL}/davinci/sdk-token`;

// Global reference for the initialized SDK
let signalsInstance = null;

// Basic nonce generator
function generateNonce(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

// Standard SDK Helper: Ensures we wait for the script to load
function onPingOneSignalsReady(callback) {
    if (window['_pingOneSignalsReady']) {
        callback();
    } else {
        document.addEventListener('PingOneSignalsReadyEvent', callback);
    }
}

// Main function: fetch SDK token and run widget (now accepts captured data)
async function loadDaVinciWidget(username, riskPayload) {
  // 1️⃣ UI Switch: Hide local form, show DaVinci widget
  const formWrapper = document.getElementById("pre-login-wrapper");
  const widgetWrapper = document.getElementById("dv-widget-wrapper");
  const widgetContainer = document.getElementById("dv-widget");

  if (formWrapper) formWrapper.style.display = "none";
  if (widgetWrapper) widgetWrapper.style.display = "block";
  
  if (!widgetContainer) {
    console.error("dv-widget container not found");
    return;
  }

  try {
    // 2️⃣ Get SDK token from your backend (server-side sdktoken call)
    const response = await fetch(DV_SDK_TOKEN_ENDPOINT, {
      method: "GET",
      credentials: "include", // if your backend uses cookies/sessions
    });

    if (!response.ok) {
      throw new Error(`SDK token request failed: ${response.status}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    if (!accessToken) {
      throw new Error("No access_token in SDK token response");
    }

    // 3️⃣ Build DaVinci widget props
    const nonce = generateNonce();

    const props = {
      config: {
        method: "runFlow",
        apiRoot: `https://auth.pingone.${REGION}/`,
        accessToken: accessToken,
        companyId: COMPANY_ID,
        policyId: POLICY_ID,
        includeHttpCredentials: false, 
        parameters: {
          nonce: nonce,
          riskPayload: riskPayload, // <--- Passed from the button click
          username: username        // <--- Passed from the input field
        },
      },
      useModal: false,
      successCallback: (response) => {
        console.log("DaVinci success:", response);
      },
      errorCallback: (error) => {
        console.error("DaVinci error:", error);
      },
      onCloseModal: () => {
        console.log("DaVinci modal closed");
      },
    };

    // 4️⃣ Run the widget
    if (typeof davinci === "undefined" || !davinci.skRenderScreen) {
      console.error("DaVinci library not loaded yet");
      return;
    }

    davinci.skRenderScreen(widgetContainer, props);
  } catch (err) {
    console.error("Failed to load DaVinci widget:", err);
    if (widgetContainer) {
      widgetContainer.textContent = "Failed to load DaVinci widget. Check console for details.";
    }
  }
}

// Auto-run logic: Setup listeners and Init SDK
document.addEventListener("DOMContentLoaded", async () => {
  
  // A. Initialize Signals SDK immediately (using the safe listener pattern)
  onPingOneSignalsReady(async () => {
      try {
          const signals = window._pingOneSignals; 
          await signals.init({ envId: PINGONE_ENV_ID });
          signalsInstance = signals;
          console.log("👁️ Signals SDK initialized and watching behavior...");
      } catch (e) {
          console.error("⚠️ Signals SDK Init Failed:", e);
      }
  });

  // B. Attach listener to the 'Next' button
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
        const username = document.getElementById("local-username").value;
        if (!username) { alert("Please enter username"); return; }
        
        startBtn.disabled = true;
        startBtn.innerText = "Analyzing...";

        // C. Capture the Data (Snapshot of behavior up to this point)
        let riskPayload = "";
        if (signalsInstance) {
            try {
                riskPayload = await signalsInstance.getData();
                console.log("✅ Behavioral Payload Generated");
            } catch (e) {
                console.error("Failed to get payload:", e);
            }
        }

        // D. Start DaVinci
        loadDaVinciWidget(username, riskPayload);
    });
  }
});