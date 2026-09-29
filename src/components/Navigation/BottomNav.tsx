import React from 'react';
import { Home, CalendarDays, Sliders, CalendarRange } from 'lucide-react';
import { TabId, Language } from '../../types';
import { t } from '../../data/translations';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const dict = t[language].tabs;

  return (
    <nav className="imd-bottom-bar" aria-label="Main Navigation">
      {/* 1. Home */}
      <button
        className={`bottom-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
        id="nav-tab-home"
      >
        <Home size={20} />
        <span>{dict.home}</span>
      </button>

      {/* 2. Today */}
      <button
        className={`bottom-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
        onClick={() => onTabChange('today')}
        id="nav-tab-today"
      >
        <CalendarDays size={20} />
        <span>{dict.today}</span>
      </button>

      {/* 3. Personalized */}
      <button
        className={`bottom-tab-btn ${activeTab === 'personalized' ? 'active' : ''}`}
        onClick={() => onTabChange('personalized')}
        id="nav-tab-personalized"
      >
        <Sliders size={20} />
        <span>{dict.personalized}</span>
      </button>

      {/* 4. Weekly */}
      <button
        className={`bottom-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
        onClick={() => onTabChange('weekly')}
        id="nav-tab-weekly"
      >
        <CalendarRange size={20} />
        <span>{dict.weekly}</span>
      </button>
    </nav>
  );
};
