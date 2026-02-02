require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. CORS Configuration ---
const allowedOrigins = [
    'http://localhost:3000',
    // 'https://your-production-domain.com' // Add production domains here
];

app.use(cors({
    /**
     * For local testing with ngrok (where the URL changes), 'true' reflects the request origin.
     * In production, replace 'true' with 'allowedOrigins' or a specific domain.
     */
    origin: true, 
    credentials: true
}));

app.use(express.json());

/**
 * --- Securely Mint DaVinci SDK Token (Widget Flow) ---
 * This endpoint communicates server-to-server with PingOne DaVinci
 * to retrieve a short-lived SDK token, keeping your API Key hidden from the frontend.
 */
app.get('/davinci/sdk-token', async (req, res) => {
    try {
        const companyId = process.env.DAVINCI_COMPANY_ID;
        const apiKey = process.env.DAVINCI_API_KEY;
        const region = process.env.DAVINCI_REGION || 'com';

        console.log(`🔹 Minting SDK token for Env/Company: ${companyId} (Region: ${region})`);

        if (!companyId || !apiKey) {
            console.error("❌ Missing DaVinci environment configuration");
            return res.status(500).json({
                error: "Server misconfiguration: Missing DaVinci credentials."
            });
        }

        // --- Construct the DaVinci Orchestrate API URL ---
        const orchestrateUrl = `https://orchestrate-api.pingone.${region}/v1/company/${companyId}/sdktoken`;

        const response = await fetch(orchestrateUrl, {
            method: 'GET',
            headers: { 
                'X-SK-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("🔥 DaVinci API Error:", data);
            return res.status(response.status).json({
                error: "Failed to generate SDK token",
                details: data.message || "Unknown error"
            });
        }

        // 🔑 Return access_token field to the frontend
        res.json({
            access_token: data.access_token
        });

    } catch (error) {
        console.error('SDK Token Error:', error.message);
        res.status(500).json({ error: "Internal server error while generating SDK token" });
    }
});

// --- 3. START SERVER ---
app.listen(PORT, () => {
    console.log(`✅ Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Targeting region: ${process.env.DAVINCI_REGION || 'com (default)'}`);
});