import React, { useState } from 'react';
import { Search, MapPin, X, Sun, Cloud, CloudSun, CloudRain, CloudLightning, Wind } from 'lucide-react';
import { CityData, Language } from '../../types';
import { CITIES_DATA } from '../../data/mockData';

interface TodayCitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityId: string | null) => void;
  currentCityId: string;
  globalCity: CityData;
  language: Language;
}

export const TodayCitySearchModal: React.FC<TodayCitySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  currentCityId,
  globalCity,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const renderWeatherIcon = (iconName: string, size = 18) => {
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

  const term = searchTerm.toLowerCase().trim();
  const filteredCities = CITIES_DATA.filter((c) => {
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) ||
      c.nameHi.includes(term) ||
      c.state.toLowerCase().includes(term) ||
      c.stateHi.includes(term)
    );
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '16px 12px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-modal-panel)',
          borderRadius: '12px',
          border: '1px solid var(--border-modal)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '84vh',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* 1. Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-modal-panel)',
          }}
        >
          <div>
            <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {language === 'en' ? 'Search City' : 'शहर खोजें'}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
              {language === 'en' ? "Today's temporary weather view" : "केवल आज के मौसम हेतु अस्थायी दृश्य"}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Solid Search Input */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-modal-input)',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-modal)',
            }}
          >
            <Search size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'en' ? 'Search city (e.g. Chennai, Mumbai)...' : 'शहर खोजें (उदा. चेन्नई, मुंबई)...'}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 3. My City Row */}
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--bg-modal-panel)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.6px', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>
            {language === 'en' ? 'My City' : 'मेरा शहर'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} style={{ color: 'var(--color-sky-day-top)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'en' ? globalCity.name : globalCity.nameHi}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {language === 'en' ? globalCity.state : globalCity.stateHi} · {globalCity.temp}°C
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectCity(null);
                onClose();
              }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: currentCityId === globalCity.id ? 'var(--bg-subtle)' : 'var(--color-sky-day-top)',
                color: currentCityId === globalCity.id ? 'var(--text-muted)' : '#ffffff',
                border: currentCityId === globalCity.id ? '1px solid var(--border-light)' : 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {currentCityId === globalCity.id
                ? (language === 'en' ? 'Active' : 'सक्रिय')
                : (language === 'en' ? 'Use My City' : 'मेरा शहर चुनें')}
            </button>
          </div>
        </div>

        {/* 4. Filtered City Results List (Scrollable, Opaque, Simple Rows) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg-modal-panel)',
          }}
        >
          <div style={{ padding: '8px 16px 4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.6px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            {language === 'en' ? 'All Cities' : 'सभी शहर'}
          </div>

          {filteredCities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
              {language === 'en' ? 'No cities found.' : 'कोई शहर नहीं मिला।'}
            </div>
          ) : (
            filteredCities.map((c, index) => {
              const isCurrent = c.id === currentCityId;
              const isGlobal = c.id === globalCity.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCity(c.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: index < filteredCities.length - 1 ? '1px solid var(--border-light)' : 'none',
                    cursor: 'pointer',
                    background: isCurrent ? 'rgba(0, 114, 206, 0.08)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {language === 'en' ? c.name : c.nameHi}
                      </span>
                      {isGlobal && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-light)',
                          }}
                        >
                          {language === 'en' ? 'My City' : 'मेरा शहर'}
                        </span>
                      )}
                      {isCurrent && !isGlobal && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(0, 114, 206, 0.15)',
                            color: 'var(--color-sky-day-top)',
                          }}
                        >
                          {language === 'en' ? 'Viewing' : 'वर्तमान'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {language === 'en' ? c.state : c.stateHi}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {renderWeatherIcon(c.conditionIcon, 20)}
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {c.temp}°C
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
