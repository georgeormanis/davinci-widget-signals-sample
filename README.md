# DaVinci Widget + PingOne Signals (Protect) Sample

A reference sample app that demonstrates how to integrate **PingOne Signals (Protect) SDK** with the **PingOne DaVinci Widget**.

This app captures device intelligence and behavioral data (signals) *before* the DaVinci Widget loads, ensuring that the risk engine has a complete picture of the user's environment for precise risk-based authentication (RBA).

## Features

* **Pre-Login Signal Collection:** Initializes the Signals SDK early to capture behavioral metrics (mouse movements, typing cadence) on the username screen.
* **Seamless Hand-off:** Passes the captured `riskPayload` and `username` into the DaVinci flow parameters.
* **Secure Token Minting:** Includes a Node.js backend to mint the DaVinci SDK Token server-side (keeping API keys safe).

## Prerequisites

1.  **PingOne Account:** Access to a PingOne environment with **DaVinci** and **Protect** (Risk) enabled.
2.  **Node.js:** Installed on your local machine.
3.  **Ngrok (Recommended):** For exposing your local server to a public HTTPS URL. Alternatively, you can configure a local hostname in your hosts file (eg. example.local)

## Configuration Setup

### 1. PingOne Console (DaVinci)
Update your DaVinci flow to accept the incoming risk data.

1.  Open your Flow in DaVinci.
2.  Go to **Settings (Gear Icon)** > **Input Schema**.
3.  Add the following variables (Type: String):
    * `username`
    * `riskPayload`
4.  In your **PingOne Protect Connector** node under General tab:
    * Map **User ID** to `{{global.parameters.username}}`.
    * Map **IP Address** to `Global` > `IP`.
5.  In your **PingOne Protect Connector** node under Device Configurations tab:
    * Map **Risk Input from device** to `{{global.parameters.riskPayload}}`.
    * Map **User Agent** to `Global` > `User Agent`.

### 2. Local Project Config
Open `app.js` and `.env` and update the constants:

**`app.js`**
```javascript
const PINGONE_ENV_ID  = "YOUR_PINGONE_ENV_ID";     // Env ID where Protect is enabled
const COMPANY_ID      = "YOUR_DAVINCI_COMPANY_ID"; // DaVinci Company ID
const POLICY_ID       = "YOUR_DAVINCI_POLICY_ID";  // Flow Policy ID
const REGION          = "com";                     // e.g., "com", "eu", "asia"
```
**`.env`**
```javascript
DAVINCI_COMPANY_ID="YOUR_DAVINCI_COMPANY_ID"    # This is the same as your PingOne Environment ID
DAVINCI_API_KEY="YOUR_DAVINCI_APP_API_KEY"      # Your DaVinci Application API key
DAVINCI_REGION="com"                            # Your PingOne region
```
### 3. Running the App
For details on how the widget sample app works see the [davinci-widget-sample-app](https://github.com/georgeormanis/davinci-widget-sample-app.git) repo.