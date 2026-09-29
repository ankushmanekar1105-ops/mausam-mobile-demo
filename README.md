# मौसम (Mausam) • IMD Personalization Mobile Demo
### Smart India Hackathon (SIH) Prototype • Ministry of Earth Sciences, Government of India

A mobile-first, standalone frontend demonstration prototype showcasing **Adaptive Dashboard Customization**, **Weather-Aware Plan Intelligence**, and **Personalized Proactive Weather Opportunities** built on Indian government public service design principles (UX4G).

---

## 🌟 Key Features Implemented

### 1. Bilingual Support (Hindi + English)
- Instant reactive language toggle between **हिन्दी** and **English** across all onboarding screens, tabs, weather metrics, and advisory tips.
- Hindi weather vocabulary tailored to public understanding (e.g. *ओस बिंदु*, *महसूस तापमान*, *वायु गुणवत्ता*, *पराबैंगनी सूचकांक*).

### 2. Legal, Consent & DPDP Act 2023 Compliance
- Explicit legal & privacy disclosure step prior to requesting GPS location permission.
- **On-Device Storage Architecture**: Assures citizens that location histories, custom plan conditions, and activity preferences are computed and stored strictly on-device without cloud tracking.

### 3. Comprehensive Onboarding & 8 Life Personas
- **IMD & Ministry of Earth Sciences Emblem**: Trustworthy official visual identity.
- **Auth Simulation**: Fast citizen profile setup.
- **"What suits you the best?"**: 8 selectable personas:
  1. *Health-Conscious* (AQI, UV, wet-bulb heat strain, pollen)
  2. *Outdoor Fitness Enthusiasts* (Running, cycling, hydration, sports windows)
  3. *Beach Goers & Surfers* (Tides, coastal swell, rip current risk, sunshine)
  4. *Travelers & Explorers* (Highway visibility, transit fog, scenic vista)
  5. *Parents & Families* (Park hours, playground surface heat, rain cover)
  6. *Agriculture & Gardeners* (Soil moisture, optimal spraying windows, dew)
  7. *Daily Commuters* (Peak hour rain, road waterlogging, fog)
  8. *Event Planners* (Open venue viability, tent wind limits, evening rain)
- **Top-Right Skip Button**: Instantly redirects to the generic unpersonalized view (`Today` tab).
- **Default Redirection to Personalized Tab**: If the user selects personas, the app by default navigates directly to the `Personalized` tab.

### 4. Four Core Bottom Navigation Tabs
1. **Home (`HomeTab`)**:
   - Compare weather across up to **10 Indian cities** at the same time.
   - City cards display: Current temp, Feels-like temp, Humidity, Sunrise time, Moonrise time, and IMD warning badge.
   - Tapping any card expands full generic meteorological parameters directly on the Home page.
2. **Today (`TodayTab`) - Generic Official Broadcast**:
   - Same unpersonalized view for everyone in the selected city.
   - Interactive 3-hour interval chart supporting **Temperature**, **Humidity**, **Wind**, and **Dew Point**.
   - Parameters grid: Sunrise, Moonrise, Humidity, Dew Point, Wind speed/direction, UV index, Pressure, and Visibility.
3. **Personalized (`PersonalizedTab`) - The Core Feature**:
   - **Switch Controls**: Switch persona for the same city, switch city for the same persona, or switch both.
   - **Persona Suitability Score (0-100)**: Real-time suitability rating based on atmospheric parameters.
   - **Tailored Weights Explanation**: Compares scoring weights (e.g., Cricket vs. Trekking).
   - **Parent "My Plans" Widget**:
     - *Scheduled Plans*: Fixed what, where, and when (e.g., Sunday morning cricket match, evening commute).
     - *Open Plans*: Flexible weather windows (e.g., Marathon training run, crop spraying).
   - **Arrival-Aware Intelligence ("Will the weather still be good when I get there?")**:
     - Simulates route transit (Origin -> Destination -> ETA) and predicts destination weather at arrival time.
   - **Meaningful Forecast-Change Alerts & Alternative Windows**:
     - Proactive notifications of shifting storm fronts with recommended alternative time slots.
   - **Decision & Conditional Widgets**:
     - Quick activity checks (*"Can I spray pesticide today?"*, *"Can I play cricket this afternoon?"*).
   - **Persona Advice**:
     - 4 to 5 practical, scientifically grounded tips at the bottom of each persona (e.g. Vitamin D, Sunscreen SPF, Water intake, Protein & recovery).
4. **Weekly (`WeeklyTab`)**:
   - 7-day card view showing High/Low temperatures, rain alerts %, UV index, wind speed, and IMD warning status.

### 5. Settings, Notifications & Governance
- **Mandatory Public Warnings**: Severe Cyclone and Red alerts are permanently active and non-skippable under National Disaster Management guidelines.
- **Notification Fatigue Control**: Slider to enforce a minimum forecast change threshold (&ge; 40%) before alerting citizens, plus night quiet hours (10:00 PM – 06:00 AM).
- **Offline & Low-Bandwidth Mode**: Demonstrates compressed 4.8 KB synoptic packets and edge caching.
- **Double Confirmation Reset**: Resetting all customized widgets, notifications, and personas asks **twice** before wiping local storage.

---

## 🚀 Running Locally

```bash
cd mausam-mobile-demo
npm install
npm run dev
```

The application will start at `http://localhost:5173/`.

### Evaluator Presentation Features
On desktop screens, the mobile app is presented in a centered **390 × 844 / 393 × 852** smartphone simulator frame with top status bar, tricolor ribbon, and top controls to toggle screen width (390px, 430px, or Fullscreen) or restart the demo walkthrough at any time.
