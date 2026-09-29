import React, { useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Moon,
  AlertTriangle,
  Layers,
  LineChart as LineChartIcon,
  BarChart2,
  Search,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { CityData, Language } from '../../types';
import { CITIES_DATA } from '../../data/mockData';
import { t } from '../../data/translations';
import { TodayCitySearchModal } from '../Modals/TodayCitySearchModal';

interface TodayTabProps {
  city: CityData;
  language: Language;
  todayViewedCityId?: string | null;
  onSelectTodayCity?: (cityId: string | null) => void;
  onOpenTodayCitySearch?: () => void;
  onOpenCityModal?: () => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  city,
  language,
  todayViewedCityId,
  onSelectTodayCity,
  onOpenTodayCitySearch,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'temp' | 'humidity' | 'wind' | 'dewPoint'>('temp');
  const [graphView, setGraphView] = useState<'line' | 'bar'>('line');
  const dict = t[language];

  // Resolve active display city:
  // If todayViewedCityId is active, load that city's full dataset from CITIES_DATA.
  // Otherwise, default to the global navigation city.
  const displayCity = todayViewedCityId
    ? (CITIES_DATA.find((c) => c.id === todayViewedCityId) || city)
    : city;

  const isTemporaryCity = displayCity.id !== city.id;

  const renderWeatherIcon = (iconName: string, size = 32) => {
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

  const getWarningBadge = () => {
    if (displayCity.warningLevel === 'green' || !displayCity.warningTitle) return null;

    const bgMap = {
      yellow: 'var(--severity-watch-bg)',
      orange: 'var(--severity-moderate-bg)',
      red: 'var(--severity-severe-bg)',
    };
    const borderMap = {
      yellow: 'var(--severity-watch)',
      orange: 'var(--severity-moderate)',
      red: 'var(--severity-severe)',
    };
    const textMap = {
      yellow: '#b45309',
      orange: 'var(--severity-moderate)',
      red: 'var(--severity-severe)',
    };

    return (
      <div
        style={{
          background: bgMap[displayCity.warningLevel as 'yellow' | 'orange' | 'red'],
          border: `1.5px solid ${borderMap[displayCity.warningLevel as 'yellow' | 'orange' | 'red']}`,
          borderRadius: '10px',
          padding: '12px 14px',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: textMap[displayCity.warningLevel as 'yellow' | 'orange' | 'red'] }}>
          <AlertTriangle size={17} />
          <span>{language === 'en' ? displayCity.warningTitle : displayCity.warningTitleHi}</span>
        </div>
        <p style={{ fontSize: '0.74rem', lineHeight: 1.45, color: 'var(--text-primary)', margin: 0 }}>
          {language === 'en' ? displayCity.warningText : displayCity.warningTextHi}
        </p>
      </div>
    );
  };

  // Helper values for line chart SVG
  const metricColor =
    selectedMetric === 'temp'
      ? '#ea580c'
      : selectedMetric === 'humidity'
      ? '#0284c7'
      : selectedMetric === 'wind'
      ? '#64748b'
      : '#16a34a';

  const hourlyData = displayCity.hourly;
  const values = hourlyData.map((h) => {
    if (selectedMetric === 'humidity') return h.humidity;
    if (selectedMetric === 'wind') return h.windSpeed;
    if (selectedMetric === 'dewPoint') return h.dewPoint;
    return h.temp;
  });

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = Math.max(1, maxVal - minVal);

  const chartWidth = 320;
  const chartHeight = 110;
  const paddingX = 22;
  const paddingTop = 26;
  const paddingBottom = 26;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = hourlyData.map((h, i) => {
    const val = values[i];
    const x = paddingX + (i / (hourlyData.length - 1)) * usableWidth;
    const y = paddingTop + usableHeight - ((val - minVal) / valRange) * usableHeight;
    return { x, y, val, time: h.time.replace(':00 ', ' '), rainProb: h.rainProb };
  });

  const svgPointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '24px' }}>
      {/* ========================================================================= */}
      {/* 0. TODAY TAB TOP HEADER & COMPACT CITY SEARCH TRIGGER                     */}
      {/* ========================================================================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'en' ? "Today's Forecast" : "आज का पूर्वानुमान"}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '2px 0 0', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {language === 'en' ? 'Today' : 'आज'}
            </h1>
          </div>

          {/* Compact City Search Icon Button */}
          <button
            onClick={() => onOpenTodayCitySearch ? onOpenTodayCitySearch() : setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              background: isTemporaryCity ? 'rgba(0, 114, 206, 0.12)' : 'var(--card-bg)',
              border: isTemporaryCity ? '1px solid var(--color-sky-day-top)' : '1px solid var(--border-color)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: isTemporaryCity ? 'var(--color-sky-day-top)' : 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease',
            }}
            title={language === 'en' ? "View another city's today weather" : "अन्य शहर का आज का मौसम देखें"}
          >
            <Search size={14} />
            <span>{language === 'en' ? 'Search City' : 'शहर खोजें'}</span>
          </button>
        </div>

        {/* Temporary City Notice Banner with "Back to My City" action */}
        {isTemporaryCity && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: 'rgba(0, 114, 206, 0.08)',
              border: '1px solid rgba(0, 114, 206, 0.25)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-sky-day-top)', fontWeight: 600 }}>
              <MapPin size={13} />
              <span>
                {language === 'en'
                  ? `Viewing: ${displayCity.name} (${displayCity.state})`
                  : `देख रहे हैं: ${displayCity.nameHi} (${displayCity.stateHi})`}
              </span>
            </div>
            <button
              onClick={() => onSelectTodayCity?.(null)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={language === 'en' ? `Restore ${city.name}` : `${city.nameHi} पर वापस जाएं`}
            >
              <RotateCcw size={11} />
              <span>
                {language === 'en' ? `Back to ${city.name}` : `${city.nameHi} पर वापस`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CURRENT CONDITIONS & WEATHER DATA (Hero Card)                          */}
      {/* ========================================================================= */}
      <div
        className="imd-card"
        style={{
          background: 'linear-gradient(135deg, #002b5c 0%, #0a4b8c 100%)',
          color: '#ffffff',
          padding: '18px 16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: 700 }}>
                {language === 'en' ? displayCity.name : displayCity.nameHi}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                • {language === 'en' ? displayCity.state : displayCity.stateHi}
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              {language === 'en' ? 'Current Conditions' : 'वर्तमान मौसमी स्थिति'}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{displayCity.temp}°C</span>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                {dict.weather.feelsLike} {displayCity.feelsLike}°C
              </span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
              {language === 'en' ? displayCity.condition : displayCity.conditionHi}
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '14px' }}>
            {renderWeatherIcon(displayCity.conditionIcon, 40)}
            <div style={{ fontSize: '0.66rem', color: '#e2e8f0', marginTop: '4px', fontWeight: 600 }}>
              {displayCity.humidity}% {dict.weather.humidity}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#cbd5e1',
          }}
        >
          <span>{dict.common.updatedJustNow}</span>
          <span>Station ID: IMD-{displayCity.id.toUpperCase()}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WEATHER ALERTS / WATCHES (Placed after Current Conditions, before Graph) */}
      {/* ========================================================================= */}
      {getWarningBadge()}

      {/* ========================================================================= */}
      {/* 3. 3-HOUR WEATHER VISUALIZATION WITH LINE | BAR TOGGLE                    */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ padding: '16px' }}>
        <div
          className="imd-card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div className="imd-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--color-sky-day-top)" />
            <span style={{ fontWeight: 800, fontSize: '0.86rem' }}>
              {dict.weather.hourlyForecast}
            </span>
          </div>

          {/* Line vs Bar Graph View Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-subtle)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => setGraphView('line')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: graphView === 'line' ? 'var(--color-sky-day-top)' : 'transparent',
                color: graphView === 'line' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Line Chart View"
            >
              <LineChartIcon size={12} />
              <span>Line</span>
            </button>
            <button
              onClick={() => setGraphView('bar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: graphView === 'bar' ? 'var(--color-sky-day-top)' : 'transparent',
                color: graphView === 'bar' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Bar Chart View"
            >
              <BarChart2 size={12} />
              <span>Bar</span>
            </button>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {(['temp', 'humidity', 'wind', 'dewPoint'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              style={{
                flex: 1,
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '6px 0',
                borderRadius: '6px',
                background: selectedMetric === metric ? 'var(--color-sky-day-top)' : 'var(--bg-subtle)',
                color: selectedMetric === metric ? '#ffffff' : 'var(--text-muted)',
                border: selectedMetric === metric ? '1px solid var(--color-sky-day-top)' : '1px solid var(--border-color)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              {metric === 'temp' && '°C Temp'}
              {metric === 'humidity' && '% Humidity'}
              {metric === 'wind' && 'km/h Wind'}
              {metric === 'dewPoint' && 'Dew Pt'}
            </button>
          ))}
        </div>

        {/* VIEW 1: LINE GRAPH (SVG View) */}
        {graphView === 'line' && (
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 6px 8px 6px',
              overflow: 'hidden',
            }}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              {/* Subtle Horizontal Grid lines */}
              <line
                x1={paddingX}
                y1={paddingTop}
                x2={chartWidth - paddingX}
                y2={paddingTop}
                stroke="var(--border-color)"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingTop + usableHeight / 2}
                x2={chartWidth - paddingX}
                y2={paddingTop + usableHeight / 2}
                stroke="var(--border-color)"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingTop + usableHeight}
                x2={chartWidth - paddingX}
                y2={paddingTop + usableHeight}
                stroke="var(--border-color)"
              />

              {/* Connecting Polyline */}
              <polyline
                fill="none"
                stroke={metricColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPointsString}
              />

              {/* Data points & Values */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Point circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={idx === 2 ? 4.5 : 3.5}
                    fill="var(--card-bg)"
                    stroke={metricColor}
                    strokeWidth={idx === 2 ? 2.5 : 2}
                  />

                  {/* Value label above point */}
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill="var(--text-primary)"
                  >
                    {p.val}
                    {selectedMetric === 'temp' || selectedMetric === 'dewPoint' ? '°' : selectedMetric === 'humidity' ? '%' : 'k'}
                  </text>

                  {/* X-axis time label */}
                  <text
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="7.5"
                    fontWeight="600"
                    fill="var(--text-muted)"
                  >
                    {p.time}
                  </text>
                </g>
              ))}
            </svg>

            {/* Rain Prob strip below graph */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 12px 0 12px',
                borderTop: '1px solid var(--border-color)',
                marginTop: '4px',
                fontSize: '0.62rem',
                color: 'var(--color-sky-day-top)',
                fontWeight: 600,
              }}
            >
              {hourlyData.map((h, i) => (
                <span key={i} style={{ textAlign: 'center', width: `${100 / hourlyData.length}%` }}>
                  {h.rainProb}%
                </span>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {language === 'en' ? 'Rain Probability Strip' : 'वर्षा की संभावना'}
            </div>
          </div>
        )}

        {/* VIEW 2: BAR GRAPH VIEW */}
        {graphView === 'bar' && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              paddingTop: '4px',
            }}
          >
            {displayCity.hourly.map((hour, idx) => {
              let activeValue = `${hour.temp}°`;
              let barHeight = Math.min(100, Math.max(25, (hour.temp - 15) * 4));

              if (selectedMetric === 'humidity') {
                activeValue = `${hour.humidity}%`;
                barHeight = (hour.humidity / 100) * 80;
              } else if (selectedMetric === 'wind') {
                activeValue = `${hour.windSpeed}k`;
                barHeight = Math.min(100, hour.windSpeed * 3);
              } else if (selectedMetric === 'dewPoint') {
                activeValue = `${hour.dewPoint}°`;
                barHeight = Math.min(100, Math.max(20, (hour.dewPoint - 5) * 4));
              }

              return (
                <div
                  key={idx}
                  style={{
                    minWidth: '66px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 4px',
                    background: idx === 2 ? 'rgba(0, 114, 206, 0.08)' : 'var(--bg-subtle)',
                    border: idx === 2 ? '1px solid var(--color-sky-day-top)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {hour.time}
                  </span>

                  <div style={{ margin: '6px 0' }}>
                    {renderWeatherIcon(hour.conditionIcon, 20)}
                  </div>

                  {/* Vertical Bar Graph Visual */}
                  <div
                    style={{
                      height: '50px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      margin: '4px 0',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: `${barHeight}px`,
                        background:
                          selectedMetric === 'temp'
                            ? 'linear-gradient(180deg, #ea580c, #f59e0b)'
                            : selectedMetric === 'humidity'
                            ? 'linear-gradient(180deg, #0284c7, #38bdf8)'
                            : selectedMetric === 'wind'
                            ? 'linear-gradient(180deg, #64748b, #94a3b8)'
                            : 'linear-gradient(180deg, #16a34a, #4ade80)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeValue}
                  </span>

                  <span style={{ fontSize: '0.62rem', color: 'var(--color-sky-day-top)', marginTop: '2px', fontWeight: 600 }}>
                    {hour.rainProb}% rain
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
          {language === 'en'
            ? 'Interactive 3-hour cycle. Tap Line/Bar or metrics to switch forecast visual.'
            : 'प्रत्येक 3 घंटे का पूर्वानुमान। रेखा/बार अथवा मापदंड चुनकर चार्ट बदलें।'}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DETAILED ATMOSPHERIC PARAMETERS GRID                                   */}
      {/* ========================================================================= */}
      <div className="imd-card" style={{ padding: '16px' }}>
        <div className="imd-card-header" style={{ marginBottom: '12px' }}>
          <div className="imd-card-title">
            <span style={{ fontWeight: 800, fontSize: '0.86rem' }}>
              {language === 'en' ? 'Complete Atmospheric Parameters' : 'सभी वायुमंडलीय मापदंड'}
            </span>
          </div>
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
          {/* Sunrise */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontSize: '0.74rem', fontWeight: 700 }}>
              <Sunrise size={16} />
              <span>{dict.weather.sunrise}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.sunrise}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Dawn twilight at 05:48 AM</span>
          </div>

          {/* Moonrise */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '0.74rem', fontWeight: 700 }}>
              <Moon size={16} />
              <span>{dict.weather.moonrise}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.moonrise}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Waning Gibbous phase</span>
          </div>

          {/* Humidity */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.74rem', fontWeight: 700 }}>
              <Droplets size={16} />
              <span>{dict.weather.humidity}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.humidity}%
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Relative humidity level</span>
          </div>

          {/* Dew Point */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.74rem', fontWeight: 700 }}>
              <Thermometer size={16} />
              <span>{dict.weather.dewPoint}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.dewPoint}°C
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Condensation threshold</span>
          </div>

          {/* Wind Speed & Direction */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.74rem', fontWeight: 700 }}>
              <Wind size={16} />
              <span>{dict.weather.wind}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.windSpeed} km/h
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{displayCity.windDir}</span>
          </div>

          {/* Surface Pressure */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontSize: '0.74rem', fontWeight: 700 }}>
              <Gauge size={16} />
              <span>{dict.weather.pressure}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.pressure} hPa
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Normal barometric gradient</span>
          </div>

          {/* Optical Visibility */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.74rem', fontWeight: 700 }}>
              <Eye size={16} />
              <span>{dict.weather.visibility}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {displayCity.visibility} km
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Surface optical sensors</span>
          </div>

          {/* UV Radiation Index */}
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c', fontSize: '0.74rem', fontWeight: 700 }}>
              <Sun size={16} />
              <span>{dict.weather.uvIndex}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              UV {displayCity.uvIndex}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Peak solar radiation</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TODAY TAB TEMPORARY CITY SEARCH MODAL (Fallback if not mounted at root) */}
      {/* ========================================================================= */}
      {!onOpenTodayCitySearch && (
        <TodayCitySearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectCity={(newCityId) => {
            onSelectTodayCity?.(newCityId);
          }}
          currentCityId={displayCity.id}
          globalCity={city}
          language={language}
        />
      )}
    </div>
  );
};
