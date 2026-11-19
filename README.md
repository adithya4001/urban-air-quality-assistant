# urban-air-quality-assistant — BreatheSafe

**PromptWars Virtual Challenge 6: Urban Air Quality Assistant**  
*GenAI-powered Urban Air Quality Assistant for winter smog and pollution guidance*

A production-grade, accessible foundation for an environmental health companion designed to help urban residents, children, and vulnerable families navigate severe winter smog and urban air pollution.

---

> [!WARNING]
> **Health & Medical Boundary Disclaimer**  
> **This application does NOT provide medical diagnosis, clinical treatment plans, or emergency intervention.**  
> It delivers environmental exposure mitigation guidance derived deterministically from standard air quality metrics (EPA AQI and WHO 2021 Air Quality Guidelines). Always consult a licensed healthcare professional for individual medical decisions or acute respiratory distress.

---

## 1. Challenge & Problem Statement

Winter air pollution in urban centers and topographical basins (e.g., Delhi, Ulaanbaatar, Salt Lake City, London) creates severe health hazards through **temperature inversions**, stagnant boundary layers, and concentrated combustion aerosols (PM2.5, PM10, NOx).

Residents face difficult daily decisions:
- When is it safe for children or sensitive individuals to commute or exercise outdoors?
- How can families improve indoor air quality without expensive overhauls?
- What routine modifications reduce personal exposure while also cutting community emissions?

This solution provides **personalized, deterministic guidance** tailored to location, topography, health status, and lifestyle routines, backed by transparent environmental science.

---

## 2. Architectural Design & Philosophy

### 2.1 Deterministic-First Safety Model
Generative AI must **explain, contextualize, and personalize** advice, but it must **never invent or hallucinate unsafe medical recommendations**. 
All baseline recommendations and risk thresholds in BreatheSafe are calculated by a pure, deterministic engine (`src/domain/recommendationEngine.ts`) with zero stochastic drift. Future GenAI extensions consume this deterministic output as a hard constraint.

### 2.2 Provider Abstraction & Safe Fallback
Environmental data (air quality and meteorological snapshots) is mediated via interfaces:
- `IAirQualityProvider`
- `IWeatherProvider`
- `IEnvironmentService`

If live telemetry fails or coordinates have no sensor coverage, the system gracefully shifts into a **Conservative Safety Baseline** (`isStaleOrFallback: true`) rather than crashing or showing blank screens. Users can also simulate sensor outages with a single toggle.

---

## 3. Project Directory Structure

```
urban-air-quality-assistant/
├── .gitignore                   # Standard Git ignore rules for Vite/Node/TypeScript
├── index.html                   # Semantic HTML root with accessible viewport & meta tags
├── package.json                 # Minimal production dependencies (React 18, Vite 5, Vitest)
├── package-lock.json            # Deterministic dependency lockfile
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite bundler configuration
├── README.md                    # Challenge guide, architecture, and safety rules
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root app layout with accessibility skip-link
│   ├── index.css                # Accessible design system, CSS variables & focus rings
│   ├── domain/                  # Pure business logic and domain types
│   │   ├── types.ts             # Domain models (Location, UserProfile, RiskLevel, etc.)
│   │   └── recommendationEngine.ts # Deterministic rule engine & safety boundaries
│   ├── services/                # Provider abstraction layer & data sources
│   │   ├── types.ts             # IAirQualityProvider, IWeatherProvider, IEnvironmentService
│   │   ├── mockData.ts          # Realistic winter smog scenarios & fallback baseline
│   │   ├── MockAirQualityProvider.ts
│   │   ├── MockWeatherProvider.ts
│   │   ├── EnvironmentService.ts# Unified coordinator with error recovery
│   │   └── AssistantService.ts  # Remote endpoint boundary with deterministic fallback
│   ├── components/              # Accessible, semantic UI components
│   │   ├── Header.tsx           # Application header with challenge branding
│   │   ├── MedicalDisclaimer.tsx# Prominent non-medical advisory callout
│   │   ├── FallbackBanner.tsx   # Telemetry status and outage simulation toggle
│   │   ├── LocationSelector.tsx # Dropdown for urban locations and topography
│   │   ├── UserProfileEditor.tsx# Accessible form for age, asthma/COPD, commute, heating
│   │   ├── EnvironmentalCard.tsx# AQI display, pollutant breakdown, and inversion alerts
│   │   └── RecommendationCard.tsx# Action plan cards with health/environmental impacts
│   ├── pages/
│   │   └── DashboardPage.tsx    # Responsive dashboard coordinating state and layouts
│   ├── utils/
│   │   └── formatters.ts        # Accessible formatting and AQI color tokens
│   └── tests/                   # Vitest coverage for rules and provider boundaries
```

---

## 4. Domain Models & Types

| Type Name | Purpose | Key Attributes |
| :--- | :--- | :--- |
| `RiskLevel` | Standardized risk tiers | `'low'`, `'moderate'`, `'unhealthy_sensitive'`, `'unhealthy'`, `'very_unhealthy'`, `'hazardous'` |
| `Location` | Geographical & topographical metadata | `id`, `name`, `city`, `coordinates`, `elevationMeters`, `isValleyOrBasin` |
| `UserProfile` | Resident health & lifestyle factors | `ageGroup`, `healthConditions` (asthma, COPD, etc.), `commuteMode`, `homeHeatingType`, `hasAirPurifier`, `hasN95Masks` |
| `WeatherSnapshot` | Atmospheric state | `temperatureC`, `humidityPercent`, `windSpeedKmh`, `condition`, `inversionRisk`, `forecastSummary` |
| `AirQualitySnapshot` | Pollutant concentrations | `aqi`, `primaryPollutant`, `pm25`, `pm10`, `no2`, `riskLevel`, `indoorAqiEstimate`, `isStaleOrFallback` |
| `Recommendation` | Individual actionable guideline | `category`, `priority`, `title`, `summary`, `actionItems`, `healthImpact`, `environmentalImpact`, `safetyNotice` |
| `DailyPlan` | Composite daily schedule | `date`, `location`, `overallRisk`, `weather`, `airQuality`, `recommendations`, `fallbackActive` |

---

## 5. Environmental & Smog Science Assumptions

1. **Valley Basins & Nocturnal Temperature Inversions:**  
   During winter, cold air pools in basins beneath a layer of warm air. Without wind (>10 km/h) or direct solar heating, pollutants cannot disperse vertically. Locations flagged with `isValleyOrBasin: true` trigger automated thermal inversion checks.
2. **Vulnerability Weighting:**  
   Users with asthma, COPD, cardiovascular conditions, pregnancy, or age extremes (children/elderly) have their effective exposure risk level escalated by one tier in moderate-to-unhealthy bands.
3. **Indoor Filtration:**  
   Without mechanical air cleaning, indoor PM2.5 tracks between 50% and 70% of outdoor smog levels. HEPA filtration is emphasized alongside window sealing and elimination of indoor combustion (incense, frying, wood stoves).
4. **Respirators vs. Cloth Masks:**  
   Cloth and surgical masks do not create a seal or filter sub-micron PM2.5. The engine specifically instructs certified respirators (N95 / FFP2 / KF94) with proper facial seal checks during unhealthy or hazardous periods.

---

## 6. Accessibility & Responsiveness

- **Keyboard Navigation & Focus Indicators:** Clear 3px high-contrast focus rings on interactive elements.
- **Screen Reader Support:** Semantic HTML5 (`header`, `main`, `section`, `aside`, `article`, `footer`, `role="region"`, `role="alert"`).
- **Skip Links:** Direct `#main-content` skip link at top of page for screen reader and keyboard users.
- **Responsive Layout:** CSS Grid collapsing from a 2-column desktop control cockpit to an intuitive mobile layout.

---

## 7. Explainable Assistant Boundary

The interface includes an **Ask BreatheSafe** panel with suggested questions for today, indoor air, outdoor activity, family sensitivity, commute, and environmental impact. By default, `DemoAssistantProvider` is deterministic and offline-safe. An optional `RemoteAssistantProvider` can call a server-side endpoint when `VITE_ASSISTANT_ENDPOINT` is configured; `FallbackAssistantProvider` automatically returns the deterministic answer if that endpoint fails. Model credentials must remain on the server and are never placed in the browser bundle.

The app persists only the selected mock location and resident preferences in browser storage. Storage failures are ignored safely and never block the plan.

For local Vite development, the app intentionally uses the deterministic assistant unless `VITE_ASSISTANT_ENDPOINT` is set. On a production build, it automatically targets `/api/assistant`. The Vercel Function keeps the deterministic plan authoritative and uses AI Gateway only to explain verified actions. Do not put a Gemini, Google, or other provider API key in `VITE_*` variables.

The server function uses the exact current AI Gateway model ID `google/gemini-3.8-flash` by default. Set `AI_GATEWAY_MODEL` only if you deliberately choose another model from the live AI Gateway catalog. For deployment, configure `AI_GATEWAY_API_KEY` as a Vercel server environment variable, or use Vercel OIDC where available; never commit the value.

## 8. Getting Started

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```
The app will start at `http://localhost:3000`.

### Running Unit Tests
```bash
npm test
```
Runs the unit suite validating deterministic safety rules, vulnerability escalation, fallback guarantees, and assistant intent routing.

### Building for Production
```bash
npm run build
```
Generates a type-checked, optimized production bundle in `dist/`.

### Deploying to Vercel
```bash
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env add AI_GATEWAY_API_KEY production
npx vercel@latest --prod
```

The deployed URL is the required live preview for the challenge. After adding the secret and deploying, verify `/api/assistant` from the live site and record a short demo video covering profile personalization, AQI changes, fallback mode, assistant answers, and the visible medical disclaimer.
