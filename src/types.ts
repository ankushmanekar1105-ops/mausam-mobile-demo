export type Language = 'en' | 'hi';

export type PersonaId = 'commuter' | 'health' | 'traveler';

export type TabId = 'home' | 'today' | 'personalized' | 'weekly';

export type WarningLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface HourlyForecast {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  dewPoint: number;
  rainProb: number;
  condition: string;
  conditionIcon: 'sun' | 'cloud' | 'cloud-rain' | 'cloud-sun' | 'cloud-lightning' | 'wind';
}

export interface DailyForecast {
  day: string;
  dayHi: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  conditionHi: string;
  conditionIcon: 'sun' | 'cloud' | 'cloud-rain' | 'cloud-sun' | 'cloud-lightning' | 'wind';
  rainProb: number;
  uvIndex: number;
  windSpeed: number;
  warningLevel: WarningLevel;
  warningText: string;
  warningTextHi: string;
}

export interface CityData {
  id: string;
  name: string;
  nameHi: string;
  state: string;
  stateHi: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionHi: string;
  conditionIcon: 'sun' | 'cloud' | 'cloud-rain' | 'cloud-sun' | 'cloud-lightning' | 'wind';
  humidity: number;
  windSpeed: number;
  windDir: string;
  uvIndex: number;
  dewPoint: number;
  pressure: number;
  visibility: number;
  airQualityIndex: number;
  airQualityStatus: string;
  airQualityStatusHi: string;
  sunrise: string;
  moonrise: string;
  warningLevel: WarningLevel;
  warningTitle: string;
  warningTitleHi: string;
  warningText: string;
  warningTextHi: string;
  hourly: HourlyForecast[];
  weekly: DailyForecast[];
}

export interface PersonaMeta {
  id: PersonaId;
  nameEn: string;
  nameHi: string;
  taglineEn: string;
  taglineHi: string;
  iconName: string;
  accentColor: string;
  focusMetrics: string[];
}

export interface PlanItem {
  id: string;
  title: string;
  titleHi: string;
  type: 'scheduled' | 'open';
  personaId: PersonaId;
  location: string;
  timeSlot: string;
  timeSlotHi: string;
  feasibilityScore: number;
  status: 'optimal' | 'moderate' | 'unfavorable';
  statusTextEn: string;
  statusTextHi: string;
  reasonEn: string;
  reasonHi: string;
  bestAlternativeEn?: string;
  bestAlternativeHi?: string;
  conditionsNeededEn: string;
  conditionsNeededHi: string;
}

export interface AdviceItem {
  id: string;
  personaId: PersonaId;
  categoryEn: string;
  categoryHi: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  iconName: string;
  badgeEn?: string;
  badgeHi?: string;
}

export interface DecisionCheck {
  id: string;
  personaId: PersonaId;
  questionEn: string;
  questionHi: string;
  verdict: 'yes' | 'caution' | 'no';
  verdictLabelEn: string;
  verdictLabelHi: string;
  reasonEn: string;
  reasonHi: string;
  optimalTimeEn: string;
  optimalTimeHi: string;
}

export interface OfficialAlert {
  id: string;
  severity: WarningLevel;
  titleEn: string;
  titleHi: string;
  locationEn: string;
  locationHi: string;
  validUntil: string;
  descEn: string;
  descHi: string;
  isMandatory: boolean; // cannot be disabled (e.g. Cyclone / Red alerts)
}

export type WidgetId =
  | 'currentWeather'
  | 'personaScore'
  | 'aqi'
  | 'uvSkin'
  | 'uvIndex'
  | 'hourlyForecast'
  | 'bestHours'
  | 'bestWorstHours'
  | 'visibility'
  | 'commuteDelay'
  | 'roadSafety'
  | 'bestDeparture'
  | 'allergyRisk'
  | 'flightRisk'
  | 'destComfort'
  | 'savedDestWeather'
  | 'packingSuggestions'
  | 'arrivalOpportunity'
  | 'myPlans'
  | 'changeAlerts'
  | 'decisions'
  | 'advice'
  | 'officialAlerts'
  | 'monitoredCities'
  | string;

export interface CustomWidgetConfig {
  id: string;
  name: string;
  infoSelected: {
    temp: boolean;
    rain: boolean;
    aqi: boolean;
    wind: boolean;
  };
  conditions: {
    maxRain: number;
    maxTemp: number;
    maxAqi: number;
    maxWind: number;
  };
  displayStyle: 'summary' | 'metrics' | 'timeline' | 'gauge';
}

export interface DashboardConfig {
  setupMode: 'recommended' | 'customize' | 'custom';
  widgetOrder: string[];
  widgetSettings: {
    skinType?: 'light' | 'brown' | 'dark';
    myPlansShowScheduled?: boolean;
    myPlansShowOpen?: boolean;
    [key: string]: any;
  };
  customWidgets: CustomWidgetConfig[];
}

export interface UserSettings {
  language: Language;
  selectedPersonas: PersonaId[];
  activePersonaId: PersonaId;
  activeCityId: string;
  savedCityIds: string[];
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  hasCompletedOnboarding: boolean;
  hasGivenLocationConsent: boolean;
  offlineMode: boolean;
  notifications: {
    officialWarnings: boolean; // always true
    proactiveOpportunityAlerts: boolean;
    arrivalAlerts: boolean;
    dailyForecastSummary: boolean;
    fatigueThreshold: number; // e.g. 40% change only
    quietHoursEnabled: boolean;
    quietHoursRange: string;
  };
  widgetOrder: string[];
  dashboardConfig?: DashboardConfig;
}
