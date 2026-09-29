import React from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Cloud,
  ArrowRight,
  ShieldAlert,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { CityData, Language, PlanItem } from '../../types';
import { t } from '../../data/translations';

interface HomeTabProps {
  activeCity: CityData;
  savedCities: CityData[];
  plans: PlanItem[];
  onSelectCity: (cityId: string) => void;
  onRemoveCity?: (cityId: string) => void;
  onOpenAddCityModal: () => void;
  onNavigateToPersonalized: () => void;
  language: Language;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  activeCity,
  savedCities,
  plans,
  onSelectCity,
  onOpenAddCityModal,
  onNavigateToPersonalized,
  language,
}) => {
  const dict = t[language];

  // Helper to render weather condition icon
  const renderConditionIcon = (iconName: string, size = 22) => {
    switch (iconName) {
      case 'sun':
        return <Sun size={size} color="#eab308" />;
      case 'cloud-sun':
        return <CloudSun size={size} color="#f59e0b" />;
      case 'cloud-rain':
        return <CloudRain size={size} color="#0284c7" />;
      case 'cloud-lightning':
        return <CloudLightning size={size} color="#9333ea" />;
      default:
        return <Cloud size={size} color="#64748b" />;
    }
  };

  // Ensure monitored cities list has the active/home city as the very first card
  // Up to a maximum of 10 cities
  const uniqueCitiesMap = new Map<string, CityData>();
  uniqueCitiesMap.set(activeCity.id, activeCity);
  savedCities.forEach((city) => {
    if (!uniqueCitiesMap.has(city.id) && uniqueCitiesMap.size < 10) {
      uniqueCitiesMap.set(city.id, city);
    }
  });
  const monitoredCities = Array.from(uniqueCitiesMap.values()).slice(0, 10);
  const cityCount = monitoredCities.length;
  const isMaxCitiesReached = cityCount >= 10;

  // Determine if any saved plan has a weather conflict
  // A conflict exists if plan status is 'unfavorable' or weather has heavy rain / red/orange alert
  const conflictedPlans = plans.filter((p) => {
    if (p.status === 'unfavorable') return true;
    if (activeCity.warningLevel === 'red' || activeCity.warningLevel === 'orange') return true;
    return false;
  });

  const primaryConflictPlan = conflictedPlans.length > 0 ? conflictedPlans[0] : null;

  return (
    <div className="page-container" style={{ paddingBottom: '24px' }}>
      {/* ========================================================================= */}
      {/* 1. MONITORED LOCATIONS (Bento Grid of up to 10 cities)                    */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ padding: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--imd-primary)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              {language === 'en' ? 'MONITORED LOCATIONS' : 'निगरानी वाले शहर'}
            </span>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              {language === 'en'
                ? 'Real-time IMD observation stations'
                : 'आईएमडी के वास्तविक समय वेधशाला केंद्र'}
            </div>
          </div>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              background: isMaxCitiesReached ? 'var(--warn-orange-bg)' : '#f1f5f9',
              color: isMaxCitiesReached ? 'var(--warn-orange)' : 'var(--text-muted)',
              border: isMaxCitiesReached
                ? '1px solid var(--warn-orange-border)'
                : '1px solid var(--border-light)',
              flexShrink: 0,
            }}
          >
            {cityCount} / 10 {language === 'en' ? 'cities' : 'शहर'}
          </span>
        </div>

        {/* 2-Column Square Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {monitoredCities.map((c, index) => {
            const isHome = index === 0 && c.id === activeCity.id;
            const isSelected = c.id === activeCity.id;

            return (
              <div
                key={c.id}
                onClick={() => onSelectCity(c.id)}
                role="button"
                tabIndex={0}
                style={{
                  background: isSelected
                    ? 'linear-gradient(145deg, #002b5c 0%, #0a4b8c 100%)'
                    : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  borderRadius: '12px',
                  padding: '12px 10px',
                  border: isSelected
                    ? '1.5px solid var(--imd-gov-gold)'
                    : '1px solid var(--border-light)',
                  boxShadow: isSelected
                    ? '0 4px 12px rgba(0, 43, 92, 0.25)'
                    : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  aspectRatio: '1 / 1',
                  minHeight: '142px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* Header: City Name + HOME badge */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '4px',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {language === 'en' ? c.name : c.nameHi}
                      </div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: isSelected ? '#cbd5e1' : 'var(--text-subtle)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {language === 'en' ? c.state : c.stateHi}
                      </div>
                    </div>

                    {isHome && (
                      <span
                        style={{
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          background: isSelected ? '#c29b38' : 'var(--imd-primary)',
                          color: isSelected ? '#000000' : '#ffffff',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          flexShrink: 0,
                        }}
                      >
                        HOME
                      </span>
                    )}
                  </div>

                  {/* Temperature & Feels Like */}
                  <div style={{ marginTop: '8px' }}>
                    <div
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {c.temp}°C
                    </div>
                    <div
                      style={{
                        fontSize: '0.64rem',
                        color: isSelected ? '#93c5fd' : 'var(--text-muted)',
                        marginTop: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Feels {c.feelsLike}°C
                    </div>
                  </div>
                </div>

                {/* Footer: UV, Humidity & Weather Condition */}
                <div
                  style={{
                    borderTop: isSelected
                      ? '1px solid rgba(255,255,255,0.15)'
                      : '1px solid var(--border-light)',
                    paddingTop: '6px',
                    marginTop: '6px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.62rem',
                      color: isSelected ? '#e2e8f0' : 'var(--text-subtle)',
                      fontWeight: 600,
                      marginBottom: '4px',
                      minWidth: 0,
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap' }}>UV {c.uvIndex}</span>
                    <span style={{ whiteSpace: 'nowrap' }}>Humidity {c.humidity}%</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                      {renderConditionIcon(c.conditionIcon, 13)}
                    </span>
                    <span
                      style={{
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {language === 'en' ? c.condition : c.conditionHi}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add City Button */}
        <div style={{ marginTop: '14px' }}>
          {isMaxCitiesReached ? (
            <div
              style={{
                width: '100%',
                padding: '10px',
                textAlign: 'center',
                fontSize: '0.74rem',
                color: 'var(--text-subtle)',
                background: '#f8fafc',
                border: '1px dashed var(--border-light)',
                borderRadius: '8px',
              }}
            >
              10 / 10 {language === 'en' ? 'cities monitored (Maximum reached)' : 'शहर मॉनिटर किए जा रहे हैं (अधिकतम सीमा)'}
            </div>
          ) : (
            <button
              onClick={onOpenAddCityModal}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                background: 'var(--bg-card)',
                border: '1.5px dashed var(--imd-secondary)',
                borderRadius: '8px',
                color: 'var(--imd-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'background 0.2s ease',
              }}
            >
              <Plus size={16} />
              <span>{language === 'en' ? 'Add City' : 'शहर जोड़ें'}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
                ({10 - cityCount} {language === 'en' ? 'available' : 'शेष'})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PLAN-WEATHER CONFLICT ALERTS (Prominent Alert if any plan conflicts)   */}
      {/* ========================================================================= */}
      {primaryConflictPlan && (
        <div
          className="imd-card"
          style={{
            marginTop: '14px',
            background: 'var(--warn-red-bg)',
            border: '2px solid var(--warn-red-border)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--warn-red)',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <ShieldAlert size={18} />
            <span>
              {language === 'en'
                ? 'WEATHER ALERT FOR YOUR PLAN'
                : 'आपकी योजना के लिए मौसम चेतावनी'}
            </span>
          </div>

          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#991b1b' }}>
            🚗 {language === 'en' ? primaryConflictPlan.title : primaryConflictPlan.titleHi}
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '3px',
            }}
          >
            <Clock size={13} />
            <span>
              {language === 'en'
                ? primaryConflictPlan.timeSlot
                : primaryConflictPlan.timeSlotHi}
            </span>
          </div>

          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-main)',
              lineHeight: 1.45,
              marginTop: '10px',
            }}
          >
            {language === 'en'
              ? 'Heavy rainfall or severe weather conditions are expected around your planned time window.'
              : 'आपके निर्धारित समय के दौरान भारी वर्षा या प्रतिकूल मौसमी स्थिति की आशंका है।'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(185, 28, 28, 0.2)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.64rem',
                  color: 'var(--text-subtle)',
                  display: 'block',
                }}
              >
                {language === 'en' ? 'Rain Probability' : 'वर्षा की संभावना'}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b91c1c' }}>
                {activeCity.humidity > 80 ? '82%' : '65%'}
              </span>
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                background: '#dc2626',
                color: '#ffffff',
                padding: '4px 9px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              🔴 {language === 'en' ? 'HIGH WEATHER CONFLICT' : 'गंभीर मौसमी व्यवधान'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
            }}
          >
            <span style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
              {language === 'en'
                ? 'Forecast-based alert · Weather conditions may affect your plan'
                : 'पूर्वानुमान आधारित अलर्ट · मौसम आपकी योजना को प्रभावित कर सकता है'}
            </span>
            <button
              onClick={onNavigateToPersonalized}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#991b1b',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              <span>{language === 'en' ? 'View Plan' : 'योजना देखें'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WEATHER-AWARE PLAN MANAGEMENT (Displays existing plans only)           */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ marginTop: '14px', padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--imd-primary)',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              {language === 'en' ? 'MY WEATHER-AWARE PLANS' : 'मेरी मौसम-आधारित योजनाएं'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              {language === 'en'
                ? 'Weather conditions for your saved plans.'
                : 'आपकी सहेजी गई योजनाओं के लिए मौसम की स्थिति।'}
            </div>
          </div>
        </div>

        {/* Existing plans list */}
        {plans.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {language === 'en' ? 'No weather-aware plans yet.' : 'अभी कोई योजना नहीं बनाई गई है।'}
            </div>
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-subtle)',
                marginTop: '4px',
                maxWidth: '280px',
                marginInline: 'auto',
                lineHeight: 1.4,
              }}
            >
              {language === 'en'
                ? 'Create and monitor plans from Personalized.'
                : 'निजीकृत (Personalized) टैब से मौसम अनुकूल योजनाएं बनाएं और ट्रैक करें।'}
            </p>
            <button
              onClick={onNavigateToPersonalized}
              style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--imd-primary)',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              <span>{language === 'en' ? 'Go to Personalized' : 'पर्सनलाइज़्ड पर जाएं'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plans.map((plan) => {
              const isConflict =
                plan.status === 'unfavorable' ||
                (activeCity.warningLevel !== 'green' && plan.status !== 'optimal');

              return (
                <div
                  key={plan.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isConflict ? 'var(--warn-red-bg)' : '#f8fafc',
                    border: isConflict
                      ? '1px solid var(--warn-red-border)'
                      : '1px solid var(--border-light)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: isConflict ? '#991b1b' : 'var(--text-main)',
                        }}
                      >
                        {language === 'en' ? plan.title : plan.titleHi}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                        }}
                      >
                        <Clock size={12} />
                        <span>{language === 'en' ? plan.timeSlot : plan.timeSlotHi}</span>
                        {plan.location && (
                          <span>• {plan.location}</span>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        padding: '3px 7px',
                        borderRadius: '4px',
                        background: isConflict ? '#fee2e2' : '#dcfce7',
                        color: isConflict ? '#b91c1c' : '#15803d',
                      }}
                    >
                      {plan.type === 'scheduled'
                        ? language === 'en'
                          ? 'Scheduled'
                          : 'निर्धारित'
                        : language === 'en'
                        ? 'Open Window'
                        : 'लचीला'}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '8px',
                      paddingTop: '6px',
                      borderTop: isConflict
                        ? '1px solid rgba(185, 28, 28, 0.15)'
                        : '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: isConflict ? '#b91c1c' : '#16a34a',
                    }}
                  >
                    {isConflict ? (
                      <>
                        <AlertTriangle size={14} color="#dc2626" />
                        <span>
                          {language === 'en'
                            ? '🔴 Weather conflict: Precipitation or gusts expected around your planned time'
                            : '🔴 मौसमी व्यवधान: निर्धारित समय के आसपास वर्षा की आशंका'}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span>
                          {language === 'en'
                            ? '✓ Conditions currently suitable'
                            : '✓ वर्तमान मौसमी स्थिति अनुकूल है'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. OTHER USEFUL GENERAL WEATHER INFORMATION (Public-Service Brief)        */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ marginTop: '14px', padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <Radio size={16} color="var(--imd-primary)" />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--imd-primary)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {language === 'en'
              ? 'NATIONAL OBSERVATION & RADAR STATUS'
              : 'राष्ट्रीय वेधशाला एवं डॉप्लर रडार स्थिति'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
              {language === 'en' ? 'Doppler Radar Network' : 'डॉप्लर रडार नेटवर्क'}
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color: '#16a34a',
                marginTop: '3px',
              }}
            >
              ● {language === 'en' ? 'Active & Calibrated' : 'सक्रिय एवं संरेखित'}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              INSAT-3DR Scan: 07:15 IST
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ fontSize: '0.64rem', color: 'var(--text-subtle)' }}>
              {language === 'en' ? 'Active City AQI' : 'वर्तमान शहर एक्यूआई'}
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color:
                  activeCity.airQualityIndex > 150
                    ? '#ea580c'
                    : activeCity.airQualityIndex > 100
                    ? '#d97706'
                    : '#16a34a',
                marginTop: '3px',
              }}
            >
              {activeCity.airQualityIndex} ({language === 'en' ? activeCity.airQualityStatus : activeCity.airQualityStatusHi})
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Station: IMD-{activeCity.id.toUpperCase()}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '6px',
            background: '#f1f5f9',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          <strong>{language === 'en' ? 'Regional Synoptic Summary:' : 'क्षेत्रीय मौसम सारांश:'}</strong>{' '}
          {language === 'en'
            ? `Monsoon trough and localized pressure gradient over ${activeCity.name}. Surface winds at ${activeCity.windSpeed} km/h from ${activeCity.windDir}.`
            : `${activeCity.nameHi} में मानसूनी द्रोणिका सक्रिय। सतही हवा की गति ${activeCity.windSpeed} किमी/घंटा।`}
        </div>
      </div>
    </div>
  );
};
