import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Sliders,
  Plus,
  TrendingUp,
  Compass,
  Navigation,
  Shield,
  HelpCircle,
  Zap,
  Info,
  Sun,
  Camera,
  Car,
  HeartPulse,
  Eye,
  Droplets,
  Wind,
  Thermometer,
  Plane,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Luggage,
} from 'lucide-react';
import { CityData, Language, PersonaId, PlanItem } from '../../types';
import { PERSONAS, PERSONA_ADVICE, DECISION_CHECKS } from '../../data/mockData';
import { t } from '../../data/translations';

interface PersonalizedTabProps {
  city: CityData;
  activePersonaId: PersonaId;
  selectedPersonas: PersonaId[];
  plans: PlanItem[];
  onSelectPersona: (personaId: PersonaId) => void;
  onOpenNewPlanModal: () => void;
  onPlanOpportunity: (plan: PlanItem) => void;
  opportunityPlanned: boolean;
  opportunityDismissed: boolean;
  onDismissOpportunity: () => void;
  language: Language;
}

export const PersonalizedTab: React.FC<PersonalizedTabProps> = ({
  city,
  activePersonaId,
  selectedPersonas,
  plans,
  onSelectPersona,
  onOpenNewPlanModal,
  onPlanOpportunity,
  opportunityPlanned,
  opportunityDismissed,
  onDismissOpportunity,
  language,
}) => {
  // Modal states for compact icon controls
  const [isPersonaPickerOpen, setIsPersonaPickerOpen] = useState(false);
  const [showIndexInfoModal, setShowIndexInfoModal] = useState(false);
  const [showWeightsEditor, setShowWeightsEditor] = useState(false);

  // Accordion states for collapsible sections
  const [isDecisionChecksExpanded, setIsDecisionChecksExpanded] = useState(true);
  const [isTipsExpanded, setIsTipsExpanded] = useState(true);
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});

  // UV Skin Type Switcher: Light | Brown | Dark (for Health-Conscious persona)
  const [skinType, setSkinType] = useState<'light' | 'brown' | 'dark'>('brown');

  // Adjustable Factor Weights (Rain, Wind, AQI, UV, Humidity)
  const [factorWeights, setFactorWeights] = useState({
    rain: 35,
    wind: 20,
    aqi: 20,
    uv: 15,
    humidity: 10,
  });

  const dict = t[language];
  const activePersona = PERSONAS.find((p) => p.id === activePersonaId) || PERSONAS[0];

  // =========================================================================
  // SINGLE DERIVED PERSONALIZATION CONTEXT
  // Everything recalculates dynamically from (city, activePersonaId, factorWeights, skinType)
  // =========================================================================
  const calculatePersonaScore = () => {
    let baseScore = 90;

    const rainPenalty =
      (city.warningLevel === 'red' ? 40 : city.warningLevel === 'orange' ? 25 : city.warningLevel === 'yellow' ? 12 : 4) *
      (factorWeights.rain / 30);
    const aqiPenalty =
      (city.airQualityIndex > 150 ? 20 : city.airQualityIndex > 100 ? 10 : 3) * (factorWeights.aqi / 20);
    const heatHumidityPenalty = (city.humidity > 75 && city.temp > 30 ? 18 : 6) * (factorWeights.humidity / 15);
    const windPenalty = (city.windSpeed > 25 ? 16 : 4) * (factorWeights.wind / 20);
    const uvPenalty = (city.uvIndex >= 8 ? 14 : 4) * (factorWeights.uv / 15);

    const totalDeduction = rainPenalty + aqiPenalty + heatHumidityPenalty + windPenalty + uvPenalty;
    let score = Math.round(baseScore - totalDeduction + 15);

    if (activePersonaId === 'commuter' && city.visibility >= 5) score += 6;
    if (activePersonaId === 'health' && city.airQualityIndex < 80) score += 8;
    if (activePersonaId === 'traveler' && city.warningLevel === 'green') score += 7;

    return Math.max(25, Math.min(98, score));
  };

  const personaScore = calculatePersonaScore();

  // Commuter-specific derived metrics
  const commuteDelayScore = Math.min(
    95,
    Math.max(
      15,
      Math.round(
        (city.warningLevel === 'orange' ? 45 : city.warningLevel === 'yellow' ? 25 : 8) +
        (city.visibility < 4 ? 30 : city.visibility < 6 ? 15 : 4) +
        (city.humidity > 80 ? 16 : 6)
      )
    )
  );

  const trafficEstimate =
    commuteDelayScore > 75
      ? 'Estimated Heavy Congestion'
      : commuteDelayScore > 45
        ? 'Estimated Moderate Delays'
        : 'Estimated Normal Flow';

  const roadWaterloggingRisk =
    city.humidity > 80 || city.warningLevel === 'orange'
      ? 'High Risk · Low-lying road waterlogging likely'
      : city.humidity > 65
        ? 'Moderate · Wet tarmac, low waterlogging'
        : 'Minimal Risk · Dry road friction optimal';

  // Health-specific derived metrics
  const safeSunMinutes =
    skinType === 'light'
      ? Math.max(12, Math.round(180 / city.uvIndex))
      : skinType === 'brown'
        ? Math.max(25, Math.round(300 / city.uvIndex))
        : Math.max(45, Math.round(450 / city.uvIndex));

  const allergyAsthmaRisk =
    city.airQualityIndex > 150
      ? 'High Risk · Elevated PM2.5 and surface inversion'
      : city.humidity > 80
        ? 'Moderate Risk · High humidity and mold spores'
        : 'Low Risk · Clean air dispersion';

  const pollenEstimate =
    city.windSpeed > 18 && city.temp > 28
      ? 'Moderate (Estimated)'
      : 'Low (Estimated)';

  // Traveler-specific derived metrics
  const flightRiskStatus =
    city.warningLevel === 'orange'
      ? 'High Weather Risk · Convective cells & runway shear'
      : city.visibility < 4
        ? 'Moderate Weather Risk · Low visibility surface fog'
        : 'Low Weather Risk · Stable transit corridor';

  const destComfortScore = Math.max(
    40,
    Math.min(96, Math.round(100 - (city.temp > 33 ? 20 : 5) - (city.humidity > 80 ? 20 : 6)))
  );

  const destinationTemp = 16; // Shimla reference destination
  const tempDelta = city.temp - destinationTemp;

  // Filter advice for active persona
  const adviceList = PERSONA_ADVICE.filter((a) => a.personaId === activePersonaId);

  // Group advice by category for 2-tier collapsible subsection headers
  const adviceCategoriesMap = new Map<string, typeof adviceList>();
  adviceList.forEach((adv) => {
    const catName = language === 'en' ? adv.categoryEn : adv.categoryHi;
    if (!adviceCategoriesMap.has(catName)) {
      adviceCategoriesMap.set(catName, []);
    }
    adviceCategoriesMap.get(catName)!.push(adv);
  });
  const groupedAdviceCategories = Array.from(adviceCategoriesMap.entries()).map(([name, items]) => ({
    name,
    items,
    isExpanded: !collapsedSubcategories[name],
  }));

  const toggleSubcategory = (catName: string) => {
    setCollapsedSubcategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Filter plans created by the user
  const personaPlans = plans.filter(
    (p) => p.personaId === activePersonaId || selectedPersonas.includes(p.personaId) || true
  );
  const scheduledPlans = personaPlans.filter((p) => p.type === 'scheduled');
  const openPlans = personaPlans.filter((p) => p.type === 'open');

  // Decision checks for active persona
  const decisionChecks = DECISION_CHECKS.filter((d) => d.personaId === activePersonaId);

  // Handle "Plan This" from Persona-Tailored Opportunity
  const handlePlanOpportunity = () => {
    let oppPlan: PlanItem;

    if (activePersonaId === 'commuter') {
      oppPlan = {
        id: `plan-opp-${Date.now()}`,
        title: language === 'en' ? 'Morning Highway Commute' : 'सुबह की दैनिक यात्रा',
        titleHi: 'सुबह की दैनिक यात्रा',
        type: 'scheduled',
        personaId: 'commuter',
        location: `${city.name} Arterial Expressway`,
        timeSlot: language === 'en' ? 'Today · 08:30 AM – 10:00 AM' : 'आज · 08:30 AM – 10:00 AM',
        timeSlotHi: 'आज · 08:30 AM – 10:00 AM',
        feasibilityScore: 92,
        status: 'optimal',
        statusTextEn: '92/100 Optimal Departure Window',
        statusTextHi: '92/100 उत्तम प्रस्थान समय',
        reasonEn: `Surface fog and haze disperse after 08:30 AM in ${city.name}. Visibility extends to ${Math.max(6, city.visibility + 2)} km.`,
        reasonHi: `${city.nameHi} में 08:30 बजे के बाद कोहरा छंटने से दृश्यता बढ़ेगी। जलभराव का खतरा न्यूनतम है।`,
        conditionsNeededEn: 'Visibility > 5 km, Rain < 10%, Wind < 15 km/h',
        conditionsNeededHi: 'दृश्यता > 5 किमी, वर्षा < 10%, हवा < 15 किमी/घंटा',
      };
    } else if (activePersonaId === 'health') {
      oppPlan = {
        id: `plan-opp-${Date.now()}`,
        title: language === 'en' ? 'Evening Park Walk & Jogging' : 'शाम की सैर एवं व्यायाम',
        titleHi: 'शाम की सैर एवं व्यायाम',
        type: 'scheduled',
        personaId: 'health',
        location: `${city.name} Municipal Green Park`,
        timeSlot: language === 'en' ? 'Today · 05:00 PM – 06:30 PM' : 'आज · 05:00 PM – 06:30 PM',
        timeSlotHi: 'आज · 05:00 PM – 06:30 PM',
        feasibilityScore: 94,
        status: 'optimal',
        statusTextEn: '94/100 Optimal Air Quality & UV Window',
        statusTextHi: '94/100 उत्तम वायु व धूप समय',
        reasonEn: `AQI in ${city.name} stabilizes with low UV and comfortable humidity. Ideal for cardiovascular aerobic exercise.`,
        reasonHi: `${city.nameHi} में शाम के समय UV न्यूनतम और नमी अनुकूल रहेगी। व्यायाम हेतु श्रेष्ठ।`,
        conditionsNeededEn: 'AQI < 100, UV < 3, Humidity < 65%',
        conditionsNeededHi: 'AQI < 100, UV < 3, नमी < 65%',
      };
    } else {
      oppPlan = {
        id: `plan-opp-${Date.now()}`,
        title: language === 'en' ? `Transit Flight: ${city.name} to Shimla` : `यात्रा: ${city.nameHi} से शिमला`,
        titleHi: `यात्रा: ${city.nameHi} से शिमला`,
        type: 'scheduled',
        personaId: 'traveler',
        location: `${city.name} Terminal Corridor`,
        timeSlot: language === 'en' ? 'Today · 10:00 AM – 12:15 PM' : 'आज · 10:00 AM – 12:15 PM',
        timeSlotHi: 'आज · 10:00 AM – 12:15 PM',
        feasibilityScore: 90,
        status: 'optimal',
        statusTextEn: '90/100 Low Travel Weather Risk',
        statusTextHi: '90/100 मौसम व्यवधान का कम जोखिम',
        reasonEn: `Origin ${city.name} clear. Destination Shimla: 16°C. Runway crosswinds calm at ${city.windSpeed} km/h (Weather risk metric, not airline status).`,
        reasonHi: `${city.nameHi} प्रस्थान अनुकूल। शिमला 16°C। रनवे पर मौसम शांत (मौसम जोखिम मापदंड, एयरलाइन स्टेटस नहीं)।`,
        conditionsNeededEn: 'Crosswinds < 25 km/h, Arrival Visibility > 6 km',
        conditionsNeededHi: 'हवा < 25 किमी/घंटा, दृश्यता > 6 किमी',
      };
    }

    onPlanOpportunity(oppPlan);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '30px' }}>
      {/* ========================================================================= */}
      {/* 1. COMPACT TOP HEADER: Persona Control Only (Clean & Compact)             */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px 6px 4px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'var(--text-subtle)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {language === 'en' ? 'PERSONALIZED' : 'व्यक्तिगत मौसम'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {language === 'en' ? `Location: ${city.name}` : `स्थान: ${city.nameHi}`}
          </div>
        </div>

        {/* Compact Persona Selector Button */}
        <button
          onClick={() => setIsPersonaPickerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            minHeight: '40px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
          title={language === 'en' ? 'Change persona' : 'प्रोफ़ाइल बदलें'}
        >
          {activePersonaId === 'commuter' && <Car size={18} color="#d97706" />}
          {activePersonaId === 'health' && <HeartPulse size={18} color="#0284c7" />}
          {activePersonaId === 'traveler' && <Compass size={18} color="#7c3aed" />}
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {language === 'en' ? activePersona.nameEn : activePersona.nameHi}
          </span>
          <ChevronDown size={14} color="var(--text-subtle)" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PERSONA PICKER MODAL (Reveals available personas upon tapping 🚗/❤️/✈️)     */}
      {/* ========================================================================= */}
      {isPersonaPickerOpen && (
        <div className="modal-overlay" onClick={() => setIsPersonaPickerOpen(false)}>
          <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="modal-header-title">
                <span>{language === 'en' ? 'CHANGE PERSONA' : 'प्रोफ़ाइल बदलें'}</span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsPersonaPickerOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {language === 'en'
                ? `Keeps ${city.name} as active city while recalculating all persona-specific decision engines.`
                : `${city.nameHi} को सक्रिय रखते हुए प्रोफ़ाइल के अनुसार सभी सुझाव पुनः संरेखित होंगे।`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PERSONAS.map((p) => {
                const isSelected = p.id === activePersonaId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p.id);
                      setIsPersonaPickerOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      borderRadius: '10px',
                      background: isSelected ? 'var(--imd-primary)' : '#f8fafc',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: isSelected ? '2px solid var(--imd-secondary)' : '1px solid var(--border-light)',
                      textAlign: 'left',
                      minHeight: '48px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isSelected ? 'rgba(255,255,255,0.15)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        {p.id === 'commuter' && <Car size={18} color={isSelected ? '#ffffff' : '#d97706'} />}
                        {p.id === 'health' && <HeartPulse size={18} color={isSelected ? '#ffffff' : '#0284c7'} />}
                        {p.id === 'traveler' && <Compass size={18} color={isSelected ? '#ffffff' : '#7c3aed'} />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                          {language === 'en' ? p.nameEn : p.nameHi}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: isSelected ? '#cbd5e1' : 'var(--text-subtle)',
                            marginTop: '2px',
                          }}
                        >
                          {language === 'en' ? p.taglineEn : p.taglineHi}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          background: '#c29b38',
                          color: '#000000',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PERSONA SUITABILITY SCORE & TAILORED DECISION WEIGHTS                  */}
      {/* ========================================================================= */}
      <div
        className="imd-card"
        style={{
          // borderLeft: `5px solid ${personaScore >= 80 ? 'var(--warn-green)' : personaScore >= 50 ? 'var(--warn-yellow)' : 'var(--warn-red)'}`,
        }}
      >
        <div className="imd-card-header">
          <div>
            <div className="imd-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="var(--imd-secondary)" />
              <span>{dict.personalized.activityScore}</span>
              <button
                onClick={() => setShowIndexInfoModal(true)}
                style={{ color: 'var(--imd-secondary)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                title="Index calculation info"
              >
                <Info size={14} />
              </button>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
              {language === 'en' ? activePersona.nameEn : activePersona.nameHi} • Indicative — not an official advisory
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: personaScore >= 80 ? 'var(--warn-green)' : personaScore >= 50 ? 'var(--warn-yellow)' : 'var(--warn-red)',
              }}
            >
              {personaScore}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 700 }}> / 100</span>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {personaScore >= 80
            ? language === 'en'
              ? `Highly Favorable for ${activePersona.nameEn} in ${city.name}. Atmospheric conditions align well with routine activity.`
              : `अत्यधिक अनुकूल परिस्थितियाँ। ${city.nameHi} में मौसम की स्थिति ${activePersona.nameHi} के लिए श्रेष्ठ है।`
            : personaScore >= 50
              ? language === 'en'
                ? `Moderate Conditions for ${activePersona.nameEn} in ${city.name}. Exercise caution during peak windows.`
                : `मध्यम स्थिति। ${city.nameHi} में चरम समय में सावधानी बरतें।`
              : language === 'en'
                ? `Unfavorable Conditions for ${activePersona.nameEn} in ${city.name}. Adverse environmental factors detected.`
                : `प्रतिकूल मौसम। ${city.nameHi} में मौसम विभाग की चेतावनियों के अनुसार सतर्क रहें।`}
        </p>

        {/* User-Adjustable Factor Weights (Clean Sub-Section) */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--imd-primary)' }}>
              <Zap size={14} color="#ea580c" />
              <span>{dict.personalized.tailoredWeightsTitle}</span>
            </div>
            <button
              onClick={() => setShowWeightsEditor(!showWeightsEditor)}
              style={{ fontSize: '0.7rem', color: 'var(--imd-secondary)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
            >
              {showWeightsEditor ? 'Close Weights' : 'Adjust Weights'}
            </button>
          </div>

          <div style={{ fontSize: '0.64rem', color: 'var(--text-subtle)', marginTop: '3px' }}>
            {dict.personalized.cricketVsTrek}
          </div>

          {showWeightsEditor && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['rain', 'wind', 'aqi', 'uv', 'humidity'] as const).map((factor) => (
                <div key={factor} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                  <span style={{ width: '64px', textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: 600 }}>{factor}:</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={factorWeights[factor]}
                    onChange={(e) =>
                      setFactorWeights({ ...factorWeights, [factor]: Number(e.target.value) })
                    }
                    style={{ flex: 1, accentColor: 'var(--imd-primary)' }}
                  />
                  <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                    {factorWeights[factor]}%
                  </span>
                </div>
              ))}
              <button
                onClick={() =>
                  setFactorWeights({ rain: 35, wind: 20, aqi: 20, uv: 15, humidity: 10 })
                }
                style={{ alignSelf: 'flex-end', fontSize: '0.68rem', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset Weights
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PERSONA-SPECIFIC INDICES (Clean Un-nested Presentation)                */}
      {/* ========================================================================= */}
      <div className="imd-card">
        <div className="imd-card-header">
          <div className="imd-card-title">
            {activePersonaId === 'commuter' && <Car size={16} color="#d97706" />}
            {activePersonaId === 'health' && <HeartPulse size={16} color="#0284c7" />}
            {activePersonaId === 'traveler' && <Compass size={16} color="#7c3aed" />}
            <span>
              {activePersonaId === 'commuter'
                ? language === 'en' ? 'Commuter Weather Indices' : 'दैनिक यात्री मौसम सूचकांक'
                : activePersonaId === 'health'
                  ? language === 'en' ? 'Health & Air Quality Indices' : 'स्वास्थ्य एवं वायु सूचकांक'
                  : language === 'en' ? 'Traveler Weather Disruption Indices' : 'यात्री मौसम व्यवधान सूचकांक'}
            </span>
          </div>
          <span style={{ fontSize: '0.66rem', color: 'var(--text-subtle)' }}>
            Station: IMD-{city.id.toUpperCase()}
          </span>
        </div>

        {/* COMMUTER INDICES */}
        {activePersonaId === 'commuter' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706', fontSize: '0.72rem', fontWeight: 700 }}>
                  <Eye size={14} />
                  <span>1. Road Visibility</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
                  {city.visibility} km
                </div>
                <span style={{ fontSize: '0.64rem', color: city.visibility < 5 ? 'var(--severity-moderate)' : 'var(--severity-normal)', fontWeight: 600 }}>
                  {city.visibility < 5 ? 'Surface haze. Keep low-beams on.' : 'Clear highway visibility.'}
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ea580c', fontSize: '0.72rem', fontWeight: 700 }}>
                  <Clock size={14} />
                  <span>2. Delay Risk</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: commuteDelayScore > 70 ? 'var(--severity-severe)' : '#d97706', marginTop: '2px' }}>
                  {commuteDelayScore} / 100
                </div>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
                  {trafficEstimate}
                </span>
              </div>
            </div>

            <div className="section-divider" />

            {/* 3. Road Safety & Waterlogging */}
            <div className="metric-row">
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  3. Road Safety / Waterlogging:
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Surface Wind: {city.windSpeed} km/h • Rain Prob: {city.hourly[2]?.rainProb}%
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: city.humidity > 80 ? 'var(--severity-severe-bg)' : 'var(--severity-normal-bg)',
                  color: city.humidity > 80 ? 'var(--severity-severe)' : 'var(--severity-normal)',
                }}
              >
                {roadWaterloggingRisk}
              </span>
            </div>

            <div className="section-divider" />

            {/* 4. Best Departure Window */}
            <div className="metric-row">
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  4. Best Departure Window:
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                  {city.id === 'mumbai'
                    ? 'Depart prior to coastal high-tide peak'
                    : 'Surface fog clears, road visibility > 6 km'}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--imd-secondary)',
                  background: 'rgba(0, 75, 147, 0.08)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {city.id === 'mumbai' ? '06:00 AM – 07:30 AM' : '08:30 AM – 10:00 AM'}
              </span>
            </div>
          </div>
        )}

        {/* HEALTH INDICES */}
        {activePersonaId === 'health' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0284c7', fontSize: '0.72rem', fontWeight: 700 }}>
                  <HeartPulse size={14} />
                  <span>1. Air Quality Index</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: city.airQualityIndex > 150 ? 'var(--severity-severe)' : 'var(--severity-normal)', marginTop: '2px' }}>
                  AQI {city.airQualityIndex}
                </div>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
                  {city.airQualityStatus} • CPB Standard
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ea580c', fontSize: '0.72rem', fontWeight: 700 }}>
                  <Sun size={14} />
                  <span>2. UV & Solar Safety</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ea580c', marginTop: '2px' }}>
                  UV {city.uvIndex}
                </div>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
                  Safe sun: ~{safeSunMinutes} mins ({skinType})
                </span>
              </div>
            </div>

            <div className="section-divider" />

            {/* Fitzpatrick Phototype Switcher */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Fitzpatrick Skin Phototype Advisory:
                </span>
                <span style={{ fontSize: '0.68rem', color: '#ea580c', fontWeight: 700 }}>
                  Safe threshold: ~{safeSunMinutes} mins
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['light', 'brown', 'dark'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSkinType(type)}
                    style={{
                      padding: '6px 4px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      fontWeight: skinType === type ? 800 : 600,
                      background: skinType === type ? 'var(--imd-primary)' : 'var(--bg-subtle)',
                      color: skinType === type ? '#ffffff' : 'var(--text-main)',
                      border: skinType === type ? '1px solid var(--imd-secondary)' : '1px solid var(--border-light)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {type === 'light' ? 'Light (I-II)' : type === 'brown' ? 'Brown (III-IV)' : 'Dark (V-VI)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-divider" />

            {/* Allergy / Asthma Risk */}
            <div className="metric-row">
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  3. Allergy / Asthma Risk:
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Pollen Level: {pollenEstimate} • Humidity: {city.humidity}%
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: city.airQualityIndex > 150 ? 'var(--severity-severe-bg)' : 'var(--severity-normal-bg)',
                  color: city.airQualityIndex > 150 ? 'var(--severity-severe)' : 'var(--severity-normal)',
                }}
              >
                {allergyAsthmaRisk}
              </span>
            </div>

            <div className="section-divider" />

            {/* Best / Worst Outdoor Hours */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
              <div style={{ padding: '8px 10px', background: 'var(--severity-normal-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--severity-normal)' }}>
                <strong>Safest Outdoor Window:</strong>
                <div style={{ fontWeight: 800, marginTop: '2px' }}>05:00 PM – 06:30 PM</div>
                <div style={{ fontSize: '0.64rem' }}>Low UV, stable AQI</div>
              </div>

              <div style={{ padding: '8px 10px', background: 'var(--severity-severe-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--severity-severe)' }}>
                <strong>Peak Risk Window:</strong>
                <div style={{ fontWeight: 800, marginTop: '2px' }}>11:30 AM – 03:00 PM</div>
                <div style={{ fontSize: '0.64rem' }}>High Solar Radiation & Ozone</div>
              </div>
            </div>
          </div>
        )}

        {/* TRAVELER INDICES */}
        {activePersonaId === 'traveler' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700 }}>
                  <Plane size={14} />
                  <span>1. Flight Weather Risk</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: city.warningLevel === 'orange' ? 'var(--severity-severe)' : 'var(--severity-normal)', marginTop: '2px' }}>
                  {city.warningLevel === 'orange' ? 'High Risk' : 'Low Risk'}
                </div>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
                  Weather risk metric (not airline status)
                </span>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0f766e', fontSize: '0.72rem', fontWeight: 700 }}>
                  <Compass size={14} />
                  <span>2. Comfort Index</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--severity-normal)', marginTop: '2px' }}>
                  {destComfortScore} / 100
                </div>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
                  Temp + Humidity + Rain index
                </span>
              </div>
            </div>

            <div className="section-divider" />

            {/* Saved Route: Origin vs Destination Comparison */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Saved Route: <strong>{city.name} &rarr; Shimla</strong>
                </span>
                <span style={{ fontSize: '0.66rem', background: 'var(--severity-normal-bg)', color: 'var(--severity-normal)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Clear Route
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>Departure ({city.name}):</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{city.temp}°C • Feels {city.feelsLike}°C</div>
                  <div style={{ color: 'var(--text-muted)' }}>Rain: {city.hourly[2]?.rainProb}% • Vis: {city.visibility} km</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: '#7c3aed', fontWeight: 700 }}>Arrival (Shimla):</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{destinationTemp}°C • Alpine Crisp</div>
                  <div style={{ color: '#7c3aed' }}>Thermal Delta: -{tempDelta}°C drop</div>
                </div>
              </div>
            </div>

            <div className="section-divider" />

            {/* Packing Suggestions */}
            <div style={{ padding: '8px 10px', background: 'var(--severity-watch-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Luggage size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Packing Suggestions:</strong> Significant {tempDelta}°C temperature drop expected in Shimla. Pack light woollens/cardigan for evening cooling. Compact umbrella recommended for transit.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. QUICK ACTIVITY & DECISION CHECKS (COLLAPSIBLE SECTION)                 */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ padding: '0', overflow: 'hidden' }}>
        <button
          onClick={() => setIsDecisionChecksExpanded(!isDecisionChecksExpanded)}
          style={{
            width: '100%',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            borderBottom: isDecisionChecksExpanded ? '1px solid var(--border-light)' : 'none',
            textAlign: 'left',
            minHeight: '48px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--imd-primary)" />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {dict.personalized.decisionWidgets}
            </span>
          </div>
          {isDecisionChecksExpanded ? (
            <ChevronUp size={18} color="var(--text-muted)" />
          ) : (
            <ChevronRight size={18} color="var(--text-muted)" />
          )}
        </button>

        {isDecisionChecksExpanded && (
          <div style={{ padding: '0 16px 12px 16px', display: 'flex', flexDirection: 'column' }}>
            {decisionChecks.map((check, index) => (
              <div
                key={check.id}
                style={{
                  padding: '10px 0',
                  borderBottom: index < decisionChecks.length - 1 ? '1px solid var(--border-light)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>
                    {language === 'en' ? check.questionEn : check.questionHi}
                  </span>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background:
                        check.verdict === 'yes'
                          ? 'var(--severity-normal-bg)'
                          : check.verdict === 'caution'
                            ? 'var(--severity-watch-bg)'
                            : 'var(--severity-severe-bg)',
                      color:
                        check.verdict === 'yes'
                          ? 'var(--severity-normal)'
                          : check.verdict === 'caution'
                            ? 'var(--severity-moderate)'
                            : 'var(--severity-severe)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {language === 'en' ? check.verdictLabelEn : check.verdictLabelHi}
                  </span>
                </div>

                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {language === 'en' ? check.reasonEn : check.reasonHi}
                </p>

                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--imd-secondary)', marginTop: '2px' }}>
                  ⏱ {language === 'en' ? check.optimalTimeEn : check.optimalTimeHi}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. PERSONA TIPS & PREVENTIVE GUIDANCE (2-TIER COLLAPSIBLE SECTION)        */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ padding: '0', overflow: 'hidden' }}>
        <button
          onClick={() => setIsTipsExpanded(!isTipsExpanded)}
          style={{
            width: '100%',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            borderBottom: isTipsExpanded ? '1px solid var(--border-light)' : 'none',
            textAlign: 'left',
            minHeight: '48px',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--imd-primary)" />
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {dict.personalized.adviceHeader}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px', marginLeft: '26px' }}>
              {language === 'en'
                ? `Verified safety guidance for ${activePersona.nameEn}`
                : `${activePersona.nameHi} के लिए प्रमाणित सुरक्षा सुझाव`}
            </div>
          </div>
          {isTipsExpanded ? (
            <ChevronUp size={18} color="var(--text-muted)" />
          ) : (
            <ChevronRight size={18} color="var(--text-muted)" />
          )}
        </button>

        {isTipsExpanded && (
          <div style={{ padding: '0 16px 12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {groupedAdviceCategories.map((category) => (
              <div
                key={category.name}
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden',
                }}
              >
                {/* Subsection Header Tappable */}
                <button
                  onClick={() => toggleSubcategory(category.name)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-subtle)',
                    borderBottom: category.isExpanded ? '1px solid var(--border-light)' : 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--imd-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {category.name}
                  </span>
                  {category.isExpanded ? (
                    <ChevronUp size={14} color="var(--text-muted)" />
                  ) : (
                    <ChevronDown size={14} color="var(--text-muted)" />
                  )}
                </button>

                {category.isExpanded && (
                  <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-card)' }}>
                    {category.items.map((advice, aIdx) => (
                      <div
                        key={advice.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          paddingBottom: aIdx < category.items.length - 1 ? '6px' : '0',
                          borderBottom: aIdx < category.items.length - 1 ? '1px solid var(--border-light)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {language === 'en' ? advice.titleEn : advice.titleHi}
                          </span>
                          {advice.badgeEn && (
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                background: 'rgba(0,0,0,0.06)',
                                color: 'var(--text-muted)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {language === 'en' ? advice.badgeEn : advice.badgeHi}
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {language === 'en' ? advice.descEn : advice.descHi}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MY WEATHER-AWARE PLANS (WITH + Add New Plan BUTTON & SUB-SECTIONS)     */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: 'var(--imd-primary)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {dict.personalized.myPlans}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Weather conditions evaluated for your routine
            </div>
          </div>

          {/* Exactly ONE Plus Icon */}
          <button
            onClick={onOpenNewPlanModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              background: 'var(--imd-primary)',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>{dict.personalized.addPlanButton}</span>
          </button>
        </div>

        {plans.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-light)',
            }}
          >
            <Calendar size={28} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {language === 'en' ? 'No weather-aware plans yet.' : 'अभी कोई योजना नहीं बनाई गई है।'}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {language === 'en'
                ? 'Add your scheduled commutes or activities to receive forecast alerts.'
                : 'मौसम-आधारित चेतावनियां प्राप्त करने के लिए अपनी योजनाएं जोड़ें।'}
            </p>
            <button
              onClick={onOpenNewPlanModal}
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--imd-primary)',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>{dict.personalized.addPlanButton}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Sub-Widget A: Scheduled Plans (Fixed What, Where, When) */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--imd-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} />
                <span>{dict.personalized.scheduledSub}</span>
              </div>
              {scheduledPlans.length === 0 ? (
                <div style={{ padding: '10px', fontSize: '0.72rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
                  No scheduled plans active.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {scheduledPlans.map((plan, pIdx) => (
                    <div
                      key={plan.id}
                      style={{
                        padding: '8px 0',
                        borderBottom: pIdx < scheduledPlans.length - 1 ? '1px solid var(--border-light)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {language === 'en' ? plan.title : plan.titleHi}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background:
                              plan.status === 'optimal'
                                ? 'var(--severity-normal-bg)'
                                : plan.status === 'moderate'
                                  ? 'var(--severity-watch-bg)'
                                  : 'var(--severity-severe-bg)',
                            color:
                              plan.status === 'optimal'
                                ? 'var(--severity-normal)'
                                : plan.status === 'moderate'
                                  ? 'var(--severity-moderate)'
                                  : 'var(--severity-severe)',
                          }}
                        >
                          {plan.feasibilityScore}% Match
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ⏰ {language === 'en' ? plan.timeSlot : plan.timeSlotHi} {plan.location && `• 📍 ${plan.location}`}
                      </div>

                      <p style={{ fontSize: '0.74rem', color: 'var(--text-main)', marginTop: '2px' }}>
                        {language === 'en' ? plan.reasonEn : plan.reasonHi}
                      </p>

                      {plan.bestAlternativeEn && (
                        <div style={{ marginTop: '4px', padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--severity-watch-bg)', fontSize: '0.7rem', color: 'var(--severity-moderate)' }}>
                          <strong>{dict.personalized.alternativeWindow}:</strong> {language === 'en' ? plan.bestAlternativeEn : plan.bestAlternativeHi}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section-divider" />

            {/* Sub-Widget B: Open / Condition-Based Plans (Flexible Weather Windows) */}
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--imd-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Compass size={13} />
                <span>{dict.personalized.openSub}</span>
              </div>
              {openPlans.length === 0 ? (
                <div style={{ padding: '10px', fontSize: '0.72rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
                  No open condition-based plans active.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {openPlans.map((plan, oIdx) => (
                    <div
                      key={plan.id}
                      style={{
                        padding: '8px 0',
                        borderBottom: oIdx < openPlans.length - 1 ? '1px solid var(--border-light)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {language === 'en' ? plan.title : plan.titleHi}
                        </span>
                        <span style={{ background: 'rgba(0, 114, 206, 0.12)', color: 'var(--imd-secondary)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          Active Monitor
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--severity-normal)', fontWeight: 700 }}>
                        ✨ {language === 'en' ? plan.statusTextEn : plan.statusTextHi}
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {language === 'en' ? plan.reasonEn : plan.reasonHi}
                      </p>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                        Criteria: {language === 'en' ? plan.conditionsNeededEn : plan.conditionsNeededHi}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. WEATHER OPPORTUNITIES                                                  */}
      {/* ========================================================================= */}
      {!opportunityDismissed && (
        <div
          className="imd-card"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1.5px solid #86efac',
          }}
        >
          <div className="imd-card-header">
            <div>
              <div className="imd-card-title">
                <Sparkles size={17} color="#15803d" />
                <span>{language === 'en' ? 'WEATHER OPPORTUNITY' : 'मौसम अवसर'}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                {activePersonaId === 'commuter'
                  ? 'Favorable commute departure window detected'
                  : activePersonaId === 'health'
                    ? 'Favorable outdoor aerobic conditions nearby'
                    : 'Favorable transit & flight departure corridor'}
              </span>
            </div>
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                background: '#dcfce7',
                color: '#15803d',
                padding: '2px 8px',
                borderRadius: '12px',
                textTransform: 'uppercase',
              }}
            >
              Opportunity
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: 'var(--imd-primary)' }}>
                {activePersonaId === 'commuter' && <Car size={18} color="#d97706" />}
                {activePersonaId === 'health' && <HeartPulse size={18} color="#0284c7" />}
                {activePersonaId === 'traveler' && <Compass size={18} color="#7c3aed" />}
                <span>
                  {activePersonaId === 'commuter'
                    ? 'Better Highway Commute Window'
                    : activePersonaId === 'health'
                      ? 'Favorable Outdoor Exercise Window'
                      : 'Optimal Transit Corridor Window'}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--severity-normal)', fontWeight: 800, background: 'var(--severity-normal-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                92 / 100 Match
              </span>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              📍 <strong>{city.name} Corridor</strong> · Travel time: ~20 mins
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--bg-subtle)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem',
                marginTop: '4px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>Expected at Arrival:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  Rain: {city.hourly[2]?.rainProb}% • Vis: {Math.max(6, city.visibility + 2)} km
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '8px' }}>
                <span style={{ color: 'var(--severity-normal)', fontWeight: 700 }}>Favorable Window:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  {activePersonaId === 'health' ? '05:00 PM – 06:30 PM' : '08:30 AM – 10:00 AM'}
                </div>
              </div>
            </div>

            {opportunityPlanned ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px',
                  background: 'var(--severity-normal-bg)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--severity-normal)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                }}
              >
                <CheckCircle size={16} />
                <span>Added to your weather-aware plans!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handlePlanOpportunity}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    minHeight: '38px',
                    padding: '8px',
                    fontSize: '0.78rem',
                  }}
                >
                  <span>{language === 'en' ? 'Plan This' : 'योजना बनाएं'}</span>
                </button>
                <button
                  onClick={onDismissOpportunity}
                  className="btn-secondary"
                  style={{
                    minHeight: '38px',
                    padding: '8px 14px',
                    fontSize: '0.74rem',
                  }}
                >
                  Not Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ARRIVAL-AWARE WEATHER INTELLIGENCE                                     */}
      {/* ========================================================================= */}
      <div
        className="imd-card"
        style={{
          background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(0, 114, 206, 0.05) 100%)',
          border: '1.5px solid rgba(0, 114, 206, 0.25)',
        }}
      >
        <div className="imd-card-header">
          <div>
            <div className="imd-card-title">
              <Navigation size={17} color="var(--imd-secondary)" />
              <span>{dict.personalized.arrivalAware}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
              {dict.personalized.arrivalQuestion}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
            <div>
              <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>Current Location:</span>
              <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                {city.name} ({city.temp}°C)
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '8px' }}>
              <span style={{ color: 'var(--imd-secondary)', fontWeight: 700 }}>Destination:</span>
              <div style={{ fontWeight: 800, color: 'var(--imd-primary)', marginTop: '2px' }}>
                {activePersonaId === 'traveler' ? 'Shimla Terminal' : `${city.name} Business District`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem' }}>
            <span><strong>Travel Time:</strong> {activePersonaId === 'traveler' ? '~2h 15m' : '~40 mins'}</span>
            <span style={{ color: 'var(--severity-normal)', fontWeight: 700 }}>Favorable Duration: ~3.5 hrs</span>
          </div>

          <button
            onClick={handlePlanOpportunity}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: '38px',
              padding: '8px',
              fontSize: '0.78rem',
              marginTop: '4px',
            }}
          >
            <span>{language === 'en' ? 'Plan This' : 'योजना बनाएं'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Index Information Modal / Panel */}
      {showIndexInfoModal && (
        <div className="modal-overlay" onClick={() => setShowIndexInfoModal(false)}>
          <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="modal-header-title">
                <Info size={18} />
                <span>
                  {activePersonaId === 'commuter'
                    ? 'Commuter Weather Indices'
                    : activePersonaId === 'health'
                      ? 'Health & Environmental Indices'
                      : 'Traveler Weather Disruption Indices'}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowIndexInfoModal(false)}>
                &times;
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.45 }}>
              <div style={{ padding: '8px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontWeight: 700 }}>
                Indicative Index — Not an Official Disaster Advisory
              </div>

              <div>
                <strong>Calculation Methodology:</strong>
                <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                  Evaluates atmospheric dew point depression, wet-bulb globe temperature, ground-level particulate matter, optical road visibility, and convective turbulence against user intent thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
