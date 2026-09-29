import { PersonaId, DashboardConfig, CustomWidgetConfig } from '../types';

export interface WidgetMeta {
  id: string;
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  category: 'weather' | 'personalized' | 'planning' | 'persona-specific';
  personaSpecificFor?: PersonaId[];
  hasSettings?: boolean;
}

export const AVAILABLE_SYSTEM_WIDGETS: WidgetMeta[] = [
  // WEATHER
  {
    id: 'currentWeather',
    nameEn: 'Current Weather & Station Bar',
    nameHi: 'वर्तमान मौसम एवं स्टेशन बार',
    descEn: 'Real-time temperature, feels-like, alert status and humidity.',
    descHi: 'वास्तविक समय तापमान, अलर्ट एवं मौसम स्थिति।',
    category: 'weather',
  },
  {
    id: 'aqi',
    nameEn: 'Air Quality Index (AQI)',
    nameHi: 'वायु गुणवत्ता सूचकांक (AQI)',
    descEn: 'CPCB 6-band standard with particulate matter values.',
    descHi: 'सीपीसीबी 6-बैंड स्तर एवं धूल कण विश्लेषण।',
    category: 'weather',
  },
  {
    id: 'uvIndex',
    nameEn: 'UV Index',
    nameHi: 'पराबैंगनी सूचकांक (UV)',
    descEn: 'Solar irradiance metric for sunlight safety.',
    descHi: 'धूप से सुरक्षा हेतु पराबैंगनी विकिरण माप।',
    category: 'weather',
  },
  {
    id: 'hourlyForecast',
    nameEn: 'Hourly Forecast Cycle',
    nameHi: 'प्रति घंटा पूर्वानुमान चक्र',
    descEn: 'Progression of rain, wind and temperature in 3-hour cycles.',
    descHi: 'तापमान, वर्षा और हवा का 3 घंटे का चक्र।',
    category: 'weather',
  },
  {
    id: 'bestHours',
    nameEn: 'Best Hours for Daily Routine',
    nameHi: 'दैनिक कार्यों के लिए श्रेष्ठ समय',
    descEn: 'Optimal hours for outdoor errands and ventilation.',
    descHi: 'बाहरी कार्यों के लिए अनुकूल समय।',
    category: 'weather',
  },

  // PERSONALIZED
  {
    id: 'personaScore',
    nameEn: 'Persona Suitability Score',
    nameHi: 'गतिविधि उपयुक्तता सूचकांक',
    descEn: 'Calibrated score based on lifestyle factors and weights.',
    descHi: 'आपकी जीवनशैली प्राथमिकताओं के अनुसार अनुकूलता स्कोर।',
    category: 'personalized',
  },
  {
    id: 'advice',
    nameEn: 'Persona Advice & Safety Guidance',
    nameHi: 'प्रमाणित सुरक्षा सुझाव व सावधानियां',
    descEn: 'Scientific preventive tips and guidance for your profile.',
    descHi: 'आपकी प्रोफ़ाइल के लिए वैज्ञानिक सुरक्षा निर्देश।',
    category: 'personalized',
  },
  {
    id: 'decisions',
    nameEn: 'Decision Checks & Questions',
    nameHi: 'त्वरित निर्णय एवं स्थिति जांच',
    descEn: 'Yes/No conditional answers for daily activities.',
    descHi: 'दैनिक गतिविधियों के लिए त्वरित स्पष्ट उत्तर।',
    category: 'personalized',
  },

  // PLANNING
  {
    id: 'myPlans',
    nameEn: 'My Weather-Aware Plans',
    nameHi: 'मेरी मौसम-आधारित योजनाएं',
    descEn: 'Parent itinerary widget with Scheduled and Open plans.',
    descHi: 'निर्धारित और लचीली मौसम योजनाओं का प्रबंधन।',
    category: 'planning',
    hasSettings: true,
  },
  {
    id: 'arrivalOpportunity',
    nameEn: 'Arrival-Aware Weather Opportunity',
    nameHi: 'गंतव्य-आगमन मौसम अवसर',
    descEn: 'Actionable suggestions with departure vs arrival comparison.',
    descHi: 'प्रस्थान और आगमन मौसम तुलना के साथ उपयुक्त अवसर।',
    category: 'planning',
  },
  {
    id: 'changeAlerts',
    nameEn: 'Proactive Forecast-Change Alerts',
    nameHi: 'पूर्वानुमान परिवर्तन व वैकल्पिक समय अलर्ट',
    descEn: 'Proactive notifications when radar detects shifted rain cells.',
    descHi: 'रडार में बदलाव होने पर वैकल्पिक समय की सूचना।',
    category: 'planning',
  },

  // PERSONA-SPECIFIC: COMMUTERS
  {
    id: 'visibility',
    nameEn: 'Visibility Index',
    nameHi: 'दृश्यता सूचकांक (Visibility)',
    descEn: 'Optical fog distance and road clarity (Single-data index).',
    descHi: 'कोहरे व सड़क दृश्यता की दूरी का माप।',
    category: 'persona-specific',
    personaSpecificFor: ['commuter'],
  },
  {
    id: 'commuteDelay',
    nameEn: 'Commute Delay Risk',
    nameHi: 'यात्रा विलंब जोखिम (Delay Risk)',
    descEn: 'Composite index factoring rain, visibility, wind and squalls.',
    descHi: 'बारिश, दृश्यता और हवा पर आधारित विलंब जोखिम।',
    category: 'persona-specific',
    personaSpecificFor: ['commuter'],
  },
  {
    id: 'roadSafety',
    nameEn: 'Road Safety / Waterlogging Risk',
    nameHi: 'सड़क सुरक्षा / जलभराव जोखिम',
    descEn: 'Composite index of rainfall accumulation and surface friction.',
    descHi: 'जलभराव और सड़क फिसलन का समग्र मूल्यांकन।',
    category: 'persona-specific',
    personaSpecificFor: ['commuter'],
  },
  {
    id: 'bestDeparture',
    nameEn: 'Best Departure Window',
    nameHi: 'श्रेष्ठ प्रस्थान समय विंडो',
    descEn: 'Optimal departure window before peak rain and traffic cells.',
    descHi: 'बारिश और जाम से पहले निकलने का श्रेष्ठ समय।',
    category: 'persona-specific',
    personaSpecificFor: ['commuter'],
  },

  // PERSONA-SPECIFIC: HEALTH-CONSCIOUS
  {
    id: 'uvSkin',
    nameEn: 'UV & Skin Type Advisory',
    nameHi: 'पराबैंगनी एवं त्वचा प्रकार सलाह',
    descEn: 'Sun safety tailored by Fitzpatrick skin photo-type (Light/Brown/Dark).',
    descHi: 'त्वचा के प्रकार (Light/Brown/Dark) अनुसार धूप सुरक्षा।',
    category: 'persona-specific',
    personaSpecificFor: ['health'],
    hasSettings: true,
  },
  {
    id: 'allergyRisk',
    nameEn: 'Allergy / Asthma Risk',
    nameHi: 'एलर्जी एवं अस्थमा जोखिम',
    descEn: 'Composite index combining AQI, Pollen (Estimated) and humidity.',
    descHi: 'AQI, परागकण (अनुमानित) और आर्द्रता का समग्र जोखिम।',
    category: 'persona-specific',
    personaSpecificFor: ['health'],
  },
  {
    id: 'bestWorstHours',
    nameEn: 'Best/Worst Outdoor Hours',
    nameHi: 'बाहरी गतिविधियों के उत्तम / हानिकारक घंटे',
    descEn: 'Clean comparison of safest outdoor window vs peak pollution/UV.',
    descHi: 'व्यायाम हेतु सुरक्षित घंटे बनाम उच्च प्रदूषण समय।',
    category: 'persona-specific',
    personaSpecificFor: ['health'],
  },

  // PERSONA-SPECIFIC: TRAVELERS
  {
    id: 'flightRisk',
    nameEn: 'Flight Weather Disruption Risk',
    nameHi: 'उड़ान मौसम व्यवधान जोखिम',
    descEn: 'Weather risk metric (not airline status) for runway shear & storms.',
    descHi: 'मौसम व्यवधान जोखिम मापदंड (एयरलाइन स्थिति नहीं)।',
    category: 'persona-specific',
    personaSpecificFor: ['traveler'],
  },
  {
    id: 'destComfort',
    nameEn: 'Destination Comfort Index',
    nameHi: 'गंतव्य आराम सूचकांक',
    descEn: 'Composite metric of destination temp, humidity and rain.',
    descHi: 'गंतव्य के तापमान, आर्द्रता और वर्षा का समग्र सूचकांक।',
    category: 'persona-specific',
    personaSpecificFor: ['traveler'],
  },
  {
    id: 'savedDestWeather',
    nameEn: 'Saved Destination Weather',
    nameHi: 'सहेजे गए गंतव्यों का मौसम',
    descEn: 'Origin vs destination temperature difference and arrival conditions.',
    descHi: 'प्रस्थान और गंतव्य के तापमान अंतर की तुलना।',
    category: 'persona-specific',
    personaSpecificFor: ['traveler'],
  },
  {
    id: 'packingSuggestions',
    nameEn: 'Packing Suggestions',
    nameHi: 'जलवायु अनुकूल पैकिंग सलाह',
    descEn: 'Recommended clothing layers and transit essentials.',
    descHi: 'गंतव्य जलवायु अनुसार उपयुक्त वस्त्रों की सूची।',
    category: 'persona-specific',
    personaSpecificFor: ['traveler'],
  },

  // OFFICIAL ALERTS
  {
    id: 'officialAlerts',
    nameEn: 'Official Severe Weather Alerts',
    nameHi: 'आधिकारिक गंभीर मौसम अलर्ट',
    descEn: 'High-priority IMD cyclone, flood and squall bulletins.',
    descHi: 'आईएमडी के आधिकारिक चक्रवात व वर्षा बुलेटिन।',
    category: 'weather',
  },
];

/**
 * Returns the recommended widget order for a given persona
 */
export function getRecommendedWidgetsForPersona(personaId: PersonaId): string[] {
  switch (personaId) {
    case 'commuter':
      return [
        'currentWeather',
        'personaScore',
        'visibility',
        'commuteDelay',
        'roadSafety',
        'bestDeparture',
        'decisions',
        'advice',
        'myPlans',
        'arrivalOpportunity',
        'hourlyForecast',
        'officialAlerts',
      ];
    case 'health':
      return [
        'currentWeather',
        'personaScore',
        'aqi',
        'uvSkin',
        'allergyRisk',
        'bestWorstHours',
        'decisions',
        'advice',
        'myPlans',
        'arrivalOpportunity',
        'hourlyForecast',
        'officialAlerts',
      ];
    case 'traveler':
      return [
        'currentWeather',
        'personaScore',
        'flightRisk',
        'destComfort',
        'savedDestWeather',
        'packingSuggestions',
        'decisions',
        'advice',
        'myPlans',
        'arrivalOpportunity',
        'hourlyForecast',
        'officialAlerts',
      ];
  }
}

/**
 * Creates default dashboard config for persona
 */
export function createDefaultDashboardConfig(
  personaId: PersonaId,
  mode: 'recommended' | 'customize' | 'custom' = 'recommended'
): DashboardConfig {
  const widgetOrder =
    mode === 'custom' ? [] : getRecommendedWidgetsForPersona(personaId);

  return {
    setupMode: mode,
    widgetOrder,
    widgetSettings: {
      skinType: 'brown',
      myPlansShowScheduled: true,
      myPlansShowOpen: true,
    },
    customWidgets: [],
  };
}
