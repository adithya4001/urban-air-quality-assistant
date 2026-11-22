# VaayuDootha — Urban Air Quality Assistant

A hackathon prototype for PromptWars Virtual Challenge 6. VaayuDootha helps residents understand winter air pollution and make practical choices around outdoor activity, commuting and indoor air.

## What it does

- Retrieves modelled US AQI, PM2.5, PM10 and weather estimates for a selected location using Open-Meteo. The insights dashboard shows hourly, seven-day and 30-day historical views where available. These are model estimates, not local monitoring-station measurements; historical views are not a monthly forecast.
- Combines the selected location, health sensitivities and lifestyle profile with current conditions to produce a rule-based set of suggested actions. A user can review and approve that exact list in chat and see it under Today's approved plan. Chat messages do not currently edit the approved list.
- Uses a server-side Gemini integration, when configured, to answer relevant questions and explain the available context. If AI is unavailable, the app labels its rule-based fallback. No model was trained for this project.
- Offers general precautions and supportive information. It does not diagnose, prescribe, or provide emergency care. Urgent phrase matching is limited and does not replace professional assessment.

## Running locally

Prerequisites: Node.js 18+ and npm. Install dependencies with `npm ci`, then run `npm run dev`. The terminal prints the local URL. `npm test` runs the unit tests; `npm run build` type-checks and builds the app.

The sign-in interface requires `VITE_CLERK_PUBLISHABLE_KEY`. The server API also needs `CLERK_SECRET_KEY`. The Vite development server alone does not run the serverless assistant; configure a compatible API endpoint using `VITE_ASSISTANT_ENDPOINT` or use the configured Vercel deployment. Without an AI endpoint, the client uses a limited rule-based fallback. Never put a server secret in a `VITE_` variable or commit credentials.

On the server, configure `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) for direct Gemini access, or configure the Vercel AI Gateway credentials and `AI_GATEWAY_MODEL` for gateway access. The function verifies a Clerk session, bounds input sizes, and sends the question, recent conversation and selected environmental context to the configured AI provider. Provider quotas and availability apply.

## Structure and data flow

`src/domain/` contains typed models, recommendations and safety logic. `src/services/` contains weather, air-quality and AI provider adapters. `src/components/` and `src/pages/` implement the interface. `api/assistant.ts` is the authenticated AI endpoint. `src/tests/` contains unit and API-boundary tests.

Air and weather are requested in parallel. Missing signals use clearly labelled sample fallback values; chart requests report missing data rather than inventing readings. The recommendation engine applies predefined rules, not a validated clinical risk model. AI-generated explanations are probabilistic and can be wrong. Client-provided context is not independently verified by the server.

The app stores profile, selected locations, chat history and approved plans in the browser; these do not automatically sync across devices. Location coordinates are sent to Open-Meteo to fetch estimates. When AI is used, the question and relevant context are sent through the server to the configured AI provider. Do not include information you do not wish to share.

## Sources and limits

- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) and [Weather API](https://open-meteo.com/en/docs): check provider coverage, free-use restrictions and terms before real-world deployment.
- [AirNow AQI basics](https://www.airnow.gov/aqi/aqi-basics/): the interface explicitly identifies the US AQI scale, which differs from India's AQI scale.
- [NHS guidance on shortness of breath](https://www.nhs.uk/symptoms/shortness-of-breath/): seek appropriate urgent care for severe symptoms rather than relying on an assistant.

This is a prototype. It does not claim clinical validation, comprehensive multilingual emergency detection, reliable background alarms, per-user distributed rate limiting, or guaranteed AI availability. Security, accessibility, cross-browser performance and end-to-end flows need further independent testing before production health use.
