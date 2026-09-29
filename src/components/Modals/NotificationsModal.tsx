import React from 'react';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Moon,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Language, UserSettings } from '../../types';
import { OFFICIAL_ALERTS } from '../../data/mockData';
import { t } from '../../data/translations';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateNotifications: (updated: UserSettings['notifications']) => void;
  language: Language;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateNotifications,
  language,
}) => {
  if (!isOpen) return null;

  const dict = t[language];
  const { notifications } = settings;

  const toggleProactive = () => {
    onUpdateNotifications({
      ...notifications,
      proactiveOpportunityAlerts: !notifications.proactiveOpportunityAlerts,
    });
  };

  const toggleQuietHours = () => {
    onUpdateNotifications({
      ...notifications,
      quietHoursEnabled: !notifications.quietHoursEnabled,
    });
  };

  const setFatigueThreshold = (val: number) => {
    onUpdateNotifications({
      ...notifications,
      fatigueThreshold: val,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <Bell size={20} />
            <span>{dict.settings.notificationsTitle}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Section 1: MANDATORY OFFICIAL WARNINGS (NON-SKIPPABLE) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <ShieldAlert size={16} color="var(--warn-red)" />
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--warn-red)' }}>
              {dict.settings.officialWarnings}
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '2px 6px',
                borderRadius: '4px',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Lock size={10} />
              {dict.settings.alwaysActive}
            </span>
          </div>

          <div
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              fontSize: '0.72rem',
              color: '#991b1b',
              lineHeight: 1.4,
              marginBottom: '10px',
            }}
          >
            {dict.common.mandatoryAlertNotice}
          </div>

          {/* List of active official alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {OFFICIAL_ALERTS.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: alert.severity === 'red' ? '#fff1f2' : alert.severity === 'orange' ? '#fff7ed' : '#fefce8',
                  border: `1.5px solid ${alert.severity === 'red' ? '#fda4af' : alert.severity === 'orange' ? '#fdba74' : '#fde047'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: alert.severity === 'red' ? '#be123c' : alert.severity === 'orange' ? '#c2410c' : '#a16207',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                      }}
                    >
                      OFFICIAL WEATHER WARNING
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>
                      {language === 'en' ? alert.titleEn : alert.titleHi}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: alert.severity === 'red' ? '#be123c' : alert.severity === 'orange' ? '#c2410c' : '#a16207',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    {alert.severity} Warning
                  </span>
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  📍 {language === 'en' ? alert.locationEn : alert.locationHi} • {alert.validUntil} • <em>Source: Official weather authority</em>
                </div>

                <p style={{ fontSize: '0.73rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.4 }}>
                  {language === 'en' ? alert.descEn : alert.descHi}
                </p>

                {alert.isMandatory && (
                  <div style={{ fontSize: '0.66rem', color: '#be123c', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={11} />
                    <span>{dict.common.nonSkippable}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: NOTIFICATION FATIGUE CONTROL (SYSTEM SUGGESTS, USER DECIDES) */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sliders size={16} color="var(--imd-secondary)" />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--imd-primary)' }}>
              {dict.settings.fatigueControlTitle}
            </span>
          </div>

          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {dict.settings.fatigueDesc}
          </p>

          <div
            style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Proactive Plan Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {dict.settings.proactiveAlerts}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  Notify me when an optimal alternative window opens up
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.proactiveOpportunityAlerts}
                onChange={toggleProactive}
                style={{ width: '18px', height: '18px', accentColor: 'var(--imd-primary)' }}
              />
            </div>

            {/* Minimum Delta Threshold Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700 }}>
                <span>{dict.settings.fatigueThreshold}</span>
                <span style={{ color: 'var(--imd-secondary)' }}>&ge; {notifications.fatigueThreshold}% Change</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="10"
                value={notifications.fatigueThreshold}
                onChange={(e) => setFatigueThreshold(Number(e.target.value))}
                style={{ width: '100%', marginTop: '6px', accentColor: 'var(--imd-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-subtle)' }}>
                <span>20% (More alerts)</span>
                <span>40% (Recommended)</span>
                <span>60% (Strict only)</span>
              </div>
            </div>

            {/* Quiet Hours Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Moon size={15} color="#6366f1" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  {dict.settings.quietHours}
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.quietHoursEnabled}
                onChange={toggleQuietHours}
                style={{ width: '18px', height: '18px', accentColor: 'var(--imd-primary)' }}
              />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose} style={{ marginTop: '8px' }}>
          <span>{dict.common.close}</span>
        </button>
      </div>
    </div>
  );
};
