import React from 'react';
import { MapPin, Bell, Settings, ChevronDown, ShieldAlert } from 'lucide-react';
import { Language, CityData } from '../../types';

interface HeaderProps {
  city: CityData;
  language: Language;
  onOpenCityModal: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onToggleLanguage: () => void;
  unreadAlerts: number;
}

export const Header: React.FC<HeaderProps> = ({
  city,
  language,
  onOpenCityModal,
  onOpenNotifications,
  onOpenSettings,
  onToggleLanguage,
  unreadAlerts,
}) => {
  return (
    <header className="imd-top-navbar">
      <div className="imd-nav-left">
        <div className="imd-logo-emblem" title="India Meteorological Department">
          IMD
        </div>

        <button className="imd-location-btn" onClick={onOpenCityModal} title="Change location">
          <div className="imd-location-name">
            <MapPin size={15} color="#c29b38" />
            <span>{language === 'en' ? city.name : city.nameHi}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </div>
          <div className="imd-location-sub">
            {language === 'en' ? city.state : city.stateHi} • {city.temp}°C
          </div>
        </button>
      </div>

      <div className="imd-nav-right">
        {/* Language Quick Switch */}
        <button
          className="nav-icon-btn"
          onClick={onToggleLanguage}
          title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          style={{ width: 'auto', padding: '0 8px' }}
        >
          <span className="nav-lang-badge">{language === 'en' ? 'हि' : 'EN'}</span>
        </button>

        {/* Notifications Icon with Alert Badge */}
        <button
          className="nav-icon-btn"
          onClick={onOpenNotifications}
          title="Weather Warnings & Notifications"
        >
          {unreadAlerts > 0 ? <ShieldAlert size={19} color="#fca5a5" /> : <Bell size={19} />}
          {unreadAlerts > 0 && <span className="alert-counter-badge">{unreadAlerts > 1 ? unreadAlerts : '!'}</span>}
        </button>

        {/* Settings Icon */}
        <button className="nav-icon-btn" onClick={onOpenSettings} title="Settings">
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
};
