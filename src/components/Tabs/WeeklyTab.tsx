import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  Wind,
  Droplets,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CalendarRange,
} from 'lucide-react';
import { CityData, Language } from '../../types';
import { t } from '../../data/translations';

interface WeeklyTabProps {
  city: CityData;
  language: Language;
}

export const WeeklyTab: React.FC<WeeklyTabProps> = ({ city, language }) => {
  const [expandedDayIdx, setExpandedDayIdx] = useState<number | null>(0);
  const dict = t[language];

  const renderWeatherIcon = (iconName: string, size = 26) => {
    switch (iconName) {
      case 'sun':
        return <Sun size={size} color="#eab308" />;
      case 'cloud-sun':
        return <CloudSun size={size} color="#f59e0b" />;
      case 'cloud-rain':
        return <CloudRain size={size} color="#0284c7" />;
      case 'cloud-lightning':
        return <CloudLightning size={size} color="#9333ea" />;
      case 'wind':
        return <Wind size={size} color="#64748b" />;
      default:
        return <Cloud size={size} color="#64748b" />;
    }
  };

  const getWarningBadge = (level: string) => {
    switch (level) {
      case 'red':
        return 'badge-warning red';
      case 'orange':
        return 'badge-warning orange';
      case 'yellow':
        return 'badge-warning yellow';
      default:
        return 'badge-warning green';
    }
  };

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div className="info-banner generic">
        <CalendarRange size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>{language === 'en' ? '7-Day Outlook:' : '7-दिवसीय दृष्टिकोण:'}</strong>{' '}
          {language === 'en'
            ? `Comprehensive weekly IMD synoptic bulletin for ${city.name}.`
            : `${city.nameHi} के लिए भारतीय मौसम विभाग का 7-दिवसीय विस्तृत पूर्वानुमान।`}
        </span>
      </div>

      {/* Weekly Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {city.weekly.map((dayItem, idx) => {
          const isExpanded = expandedDayIdx === idx;

          return (
            <div
              key={idx}
              className="imd-card"
              style={{
                borderLeft: `4px solid ${
                  dayItem.warningLevel === 'red'
                    ? 'var(--warn-red)'
                    : dayItem.warningLevel === 'orange'
                    ? 'var(--warn-orange)'
                    : dayItem.warningLevel === 'yellow'
                    ? 'var(--warn-yellow)'
                    : 'var(--warn-green)'
                }`,
                cursor: 'pointer',
              }}
              onClick={() => setExpandedDayIdx(isExpanded ? null : idx)}
            >
              {/* Main Card Summary Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'center', minWidth: '44px' }}>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--imd-primary)' }}>
                      {language === 'en' ? dayItem.day : dayItem.dayHi}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                      {dayItem.date}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderWeatherIcon(dayItem.conditionIcon, 26)}
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {language === 'en' ? dayItem.condition : dayItem.conditionHi}
                      </div>
                      <span className={getWarningBadge(dayItem.warningLevel)}>
                        {dayItem.warningLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {dayItem.tempMax}° / {dayItem.tempMin}°
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 600 }}>
                      ☔ {dayItem.rainProb}% rain
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.74rem',
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  {/* Warning summary for the day */}
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background:
                        dayItem.warningLevel === 'red'
                          ? 'var(--warn-red-bg)'
                          : dayItem.warningLevel === 'orange'
                          ? 'var(--warn-orange-bg)'
                          : dayItem.warningLevel === 'yellow'
                          ? 'var(--warn-yellow-bg)'
                          : 'var(--warn-green-bg)',
                      border: `1px solid ${
                        dayItem.warningLevel === 'red'
                          ? 'var(--warn-red-border)'
                          : dayItem.warningLevel === 'orange'
                          ? 'var(--warn-orange-border)'
                          : dayItem.warningLevel === 'yellow'
                          ? 'var(--warn-yellow-border)'
                          : 'var(--warn-green-border)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 600,
                      color:
                        dayItem.warningLevel === 'red'
                          ? 'var(--warn-red)'
                          : dayItem.warningLevel === 'orange'
                          ? 'var(--warn-orange)'
                          : dayItem.warningLevel === 'yellow'
                          ? 'var(--warn-yellow)'
                          : 'var(--warn-green)',
                    }}
                  >
                    <AlertTriangle size={14} />
                    <span>
                      {language === 'en' ? dayItem.warningText : dayItem.warningTextHi}
                    </span>
                  </div>

                  {/* Metrics Row: UV, Wind, Rain probability */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                    }}
                  >
                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-subtle)' }}>{dict.weather.uvIndex}</span>
                      <div style={{ fontWeight: 800, marginTop: '2px' }}>{dayItem.uvIndex} / 11</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-subtle)' }}>{dict.weather.wind}</span>
                      <div style={{ fontWeight: 800, marginTop: '2px' }}>{dayItem.windSpeed} km/h</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-subtle)' }}>Rain Alert Risk</span>
                      <div
                        style={{
                          fontWeight: 800,
                          marginTop: '2px',
                          color: dayItem.rainProb >= 50 ? '#dc2626' : '#16a34a',
                        }}
                      >
                        {dayItem.rainProb >= 50 ? 'Significant' : 'Low / Dry'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
