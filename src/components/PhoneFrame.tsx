import React, { useState } from 'react';
import { Wifi, Battery, Signal, Smartphone, Maximize2, RotateCcw, Globe } from 'lucide-react';
import { Language } from '../types';

interface PhoneFrameProps {
  children: React.ReactNode;
  language: Language;
  onLanguageToggle: () => void;
  onResetDemo: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  language,
  onLanguageToggle,
  onResetDemo,
}) => {
  const [screenMode, setScreenMode] = useState<'normal' | 'wide' | 'fullscreen'>('normal');

  return (
    <div className="desktop-wrapper">
      {/* Top Demo Presentation Bar */}
      <div className="desktop-controls-bar">
        <span className="badge-gov">IMD SIH DEMO</span>
        <span>• Prototype Viewport (393 × 852 Mobile First)</span>

        <button
          className="control-btn"
          onClick={() => setScreenMode(screenMode === 'normal' ? 'wide' : screenMode === 'wide' ? 'fullscreen' : 'normal')}
          title="Toggle Screen Size"
        >
          {screenMode === 'fullscreen' ? <Smartphone size={14} /> : <Maximize2 size={14} />}
          <span>{screenMode === 'normal' ? '390px Mobile' : screenMode === 'wide' ? '430px Large' : 'Full Screen'}</span>
        </button>

        <button className="control-btn" onClick={onLanguageToggle} title="Switch Language">
          <Globe size={14} />
          <span>{language === 'en' ? 'हिन्दी में देखें' : 'View in English'}</span>
        </button>

        <button className="control-btn" onClick={onResetDemo} title="Restart Demo Walkthrough">
          <RotateCcw size={14} />
          <span>Restart Walkthrough</span>
        </button>
      </div>

      {/* Mobile Shell */}
      <div
        className={`mobile-device-shell ${
          screenMode === 'wide' ? 'screen-wide' : screenMode === 'fullscreen' ? 'screen-fullscreen' : ''
        }`}
      >
        {/* Notch / Dynamic Island */}
        {screenMode !== 'fullscreen' && (
          <div className="phone-top-island">
            <div className="phone-speaker-dot" />
            <div className="phone-camera-lens" />
          </div>
        )}

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span>07:15 AM</span>
          <div className="status-bar-icons">
            <Signal size={14} />
            <Wifi size={14} />
            <Battery size={16} />
          </div>
        </div>

        {/* Tricolor Indicator */}
        <div className="gov-tricolor-line" />

        {/* Main Content Body */}
        <div className="app-screen-body">{children}</div>
      </div>
    </div>
  );
};
