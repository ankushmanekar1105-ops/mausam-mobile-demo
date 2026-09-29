import React, { useState } from 'react';
import { Calendar, Plus, Clock, Compass } from 'lucide-react';
import { Language, PersonaId, PlanItem } from '../../types';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersonaId: PersonaId;
  onAddPlan: (plan: PlanItem) => void;
  language: Language;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({
  isOpen,
  onClose,
  activePersonaId,
  onAddPlan,
  language,
}) => {
  const [title, setTitle] = useState('');
  const [planType, setPlanType] = useState<'scheduled' | 'open'>('scheduled');
  const [location, setLocation] = useState('Central Sports Ground');

  // Scheduled Plan fields: THREE separate inputs for Date, Start Time, End Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('08:30');

  // Open Plan fields: Flexible monitoring
  const [flexibleHorizon, setFlexibleHorizon] = useState('Next 48 Hours');

  // Weather Intent Criteria
  const [maxTemp, setMaxTemp] = useState('30');
  const [maxRain, setMaxRain] = useState('15');
  const [maxWind, setMaxWind] = useState('20');

  if (!isOpen) return null;

  const formatDisplayTime = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let timeSlotStr = '';
    let timeSlotHiStr = '';

    if (planType === 'scheduled') {
      const formattedDate = formatDisplayDate(scheduledDate);
      const startFormatted = formatDisplayTime(startTime);
      const endFormatted = formatDisplayTime(endTime);
      timeSlotStr = `${formattedDate} · ${startFormatted} – ${endFormatted}`;
      timeSlotHiStr = `${formattedDate} · ${startFormatted} – ${endFormatted}`;
    } else {
      timeSlotStr = `Flexible Window (${flexibleHorizon})`;
      timeSlotHiStr = `लचीला समय (${flexibleHorizon})`;
    }

    const calculatedScore = Math.floor(88 + Math.random() * 8);

    const newPlan: PlanItem = {
      id: `plan-${Date.now()}`,
      title: title.trim(),
      titleHi: title.trim(),
      type: planType,
      personaId: activePersonaId,
      location,
      timeSlot: timeSlotStr,
      timeSlotHi: timeSlotHiStr,
      feasibilityScore: calculatedScore,
      status: 'optimal',
      statusTextEn: `${calculatedScore}/100 Optimal Weather Match`,
      statusTextHi: `${calculatedScore}/100 मौसम पूर्णतः अनुकूल`,
      reasonEn:
        planType === 'scheduled'
          ? `Radar analysis for ${location}: Temp expected < ${maxTemp}°C and Rain prob < ${maxRain}% during your selected slot.`
          : `Active monitoring started. System will notify as soon as a window with Temp < ${maxTemp}°C and Rain < ${maxRain}% occurs.`,
      reasonHi:
        planType === 'scheduled'
          ? `${location} के लिए रडार विश्लेषण: चयनित समय में तापमान < ${maxTemp}°C और वर्षा < ${maxRain}%.`
          : `सक्रिय निगरानी प्रारंभ। तापमान < ${maxTemp}°C और वर्षा < ${maxRain}% मिलते ही सूचित किया जाएगा।`,
      conditionsNeededEn: `Temp < ${maxTemp}°C, Rain < ${maxRain}%, Wind < ${maxWind} km/h`,
      conditionsNeededHi: `तापमान < ${maxTemp}°C, वर्षा < ${maxRain}%, हवा < ${maxWind} किमी/घंटा`,
    };

    onAddPlan(newPlan);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <Calendar size={18} />
            <span>{language === 'en' ? 'Create Weather-Aware Plan' : 'मौसम-सचेत योजना बनाएं'}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Plan Type Selector: Scheduled vs Open */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPlanType('scheduled')}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: planType === 'scheduled' ? '2px solid var(--imd-primary)' : '1px solid var(--border-light)',
                background: planType === 'scheduled' ? '#f0f9ff' : '#ffffff',
                color: planType === 'scheduled' ? 'var(--imd-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '44px',
              }}
            >
              <Clock size={16} />
              <span>{language === 'en' ? 'Scheduled (Fixed Date)' : 'निर्धारित (निश्चित तिथि)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPlanType('open')}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: planType === 'open' ? '2px solid var(--imd-primary)' : '1px solid var(--border-light)',
                background: planType === 'open' ? '#f0f9ff' : '#ffffff',
                color: planType === 'open' ? 'var(--imd-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '44px',
              }}
            >
              <Compass size={16} />
              <span>{language === 'en' ? 'Open (Flexible Window)' : 'लचीली योजना (अनुकूल समय)'}</span>
            </button>
          </div>

          {/* Activity / Plan Title */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
              {language === 'en' ? 'Activity / Event Name:' : 'गतिविधि / कार्यक्रम का नाम:'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Morning Highway Commute, Nehru Park Walk, Mumbai Flight' : 'उदा. सुबह की यात्रा, पार्क वॉक, मुंबई यात्रा'}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#ffffff',
              }}
            />
          </div>

          {/* Venue / Location */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
              {language === 'en' ? 'Location / Venue:' : 'स्थान / आयोजन स्थल:'}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Feroz Shah Kotla, Lodhi Garden"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#ffffff',
              }}
            />
          </div>

          {/* FOR SCHEDULED PLANS: THREE SEPARATE INPUTS FOR DATE, START TIME, END TIME */}
          {planType === 'scheduled' ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--imd-secondary)' }}>
                {language === 'en' ? 'Scheduled Timing (Separate Inputs)' : 'निर्धारित समय (अलग-अलग इनपुट)'}
              </span>

              {/* 1. Date Input */}
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {language === 'en' ? 'Scheduled Date:' : 'निर्धारित तिथि:'}
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #94a3b8',
                    fontSize: '0.88rem',
                    background: '#ffffff',
                    minHeight: '40px',
                  }}
                />
              </div>

              {/* 2 & 3. Start Time and End Time Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {language === 'en' ? 'Start Time:' : 'प्रारंभ समय:'}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #94a3b8',
                      fontSize: '0.88rem',
                      background: '#ffffff',
                      minHeight: '40px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    {language === 'en' ? 'End Time:' : 'समाप्ति समय:'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #94a3b8',
                      fontSize: '0.88rem',
                      background: '#ffffff',
                      minHeight: '40px',
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                ✓ {formatDisplayDate(scheduledDate)} · {formatDisplayTime(startTime)} – {formatDisplayTime(endTime)}
              </div>
            </div>
          ) : (
            /* FOR OPEN PLANS: Flexible Window & Monitoring Horizon */
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontWeight: 700, fontSize: '0.78rem' }}>
                <Compass size={15} />
                <span>{language === 'en' ? 'Flexible Weather Window (No Fixed Date/Time)' : 'लचीला समय (कोई निश्चित तिथि/समय नहीं)'}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {language === 'en'
                  ? 'Mausam continuously evaluates real-time weather forecasts and notifies you when favorable conditions occur.'
                  : 'मौसम सेवा निरंतर पूर्वानुमानों का मूल्यांकन करती है और उपयुक्त परिस्थितियाँ बनते ही आपको सूचित करती है।'}
              </p>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  {language === 'en' ? 'Monitoring Time Horizon:' : 'निगरानी समय सीमा:'}
                </label>
                <select
                  value={flexibleHorizon}
                  onChange={(e) => setFlexibleHorizon(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #94a3b8',
                    fontSize: '0.86rem',
                    background: '#ffffff',
                    minHeight: '40px',
                  }}
                >
                  <option value="Next 24 Hours">Next 24 Hours</option>
                  <option value="Next 48 Hours">Next 48 Hours</option>
                  <option value="This Weekend">This Upcoming Weekend</option>
                  <option value="Next 7 Days">Next 7 Days</option>
                </select>
              </div>
            </div>
          )}

          {/* Weather Intent Criteria */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid var(--border-light)',
            }}
          >
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--imd-secondary)' }}>
              {language === 'en' ? 'Weather Acceptance Thresholds (Intents):' : 'मौसम अनुकूलता की शर्तें (Intents):'}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Max Temp (°C):</label>
                <input
                  type="number"
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Max Rain (%):</label>
                <input
                  type="number"
                  value={maxRain}
                  onChange={(e) => setMaxRain(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Max Wind (k):</label>
                <input
                  type="number"
                  value={maxWind}
                  onChange={(e) => setMaxWind(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>
            <Plus size={16} />
            <span>{language === 'en' ? 'Save & Evaluate Weather Fit' : 'योजना सहेजें और मौसम अनुकूलता जांचें'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
