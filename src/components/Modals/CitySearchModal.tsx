import React, { useState } from 'react';
import { Search, MapPin, Plus, Check } from 'lucide-react';
import { CityData, Language } from '../../types';
import { CITIES_DATA } from '../../data/mockData';
import { t } from '../../data/translations';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCityIds: string[];
  activeCityId: string;
  onSelectAndSwitchCity: (cityId: string) => void;
  onAddCity: (cityId: string) => void;
  language: Language;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  savedCityIds,
  activeCityId,
  onSelectAndSwitchCity,
  onAddCity,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const dict = t[language].common;

  const filteredCities = CITIES_DATA.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.nameHi.includes(term) ||
      c.state.toLowerCase().includes(term) ||
      c.stateHi.includes(term)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <MapPin size={20} />
            <span>{dict.manageCities}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f1f5f9',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
          }}
        >
          <Search size={16} color="var(--text-subtle)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={dict.searchCity}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.86rem',
            }}
            autoFocus
          />
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {savedCityIds.length} / 10 cities currently saved. Tap a city to view or add.
        </div>

        {/* City Results List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
          {filteredCities.map((city) => {
            const isSaved = savedCityIds.includes(city.id);
            const isActive = activeCityId === city.id;

            return (
              <div
                key={city.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isActive ? '#f0f9ff' : '#ffffff',
                  border: isActive ? '1.5px solid #0284c7' : '1px solid var(--border-light)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  onSelectAndSwitchCity(city.id);
                  onClose();
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {language === 'en' ? city.name : city.nameHi}
                    </span>
                    {isActive && (
                      <span style={{ fontSize: '0.62rem', background: '#0a4b8c', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    {language === 'en' ? city.state : city.stateHi} • {city.temp}°C, {language === 'en' ? city.condition : city.conditionHi}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isSaved && savedCityIds.length < 10 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddCity(city.id);
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', minHeight: '30px' }}
                      title="Add to saved list"
                    >
                      <Plus size={13} />
                      <span>{dict.addCity}</span>
                    </button>
                  ) : isSaved ? (
                    <Check size={16} color="#15803d" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
