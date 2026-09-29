import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings as SettingsIcon,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  CloudSun,
  HeartPulse,
  Compass,
  Car,
  Calendar,
  Navigation,
  Sun,
  Wind,
  Droplets,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  DashboardConfig,
  CustomWidgetConfig,
  Language,
  PersonaId,
} from '../../types';
import {
  AVAILABLE_SYSTEM_WIDGETS,
  WidgetMeta,
  getRecommendedWidgetsForPersona,
} from '../../data/dashboardPresets';
import { PERSONAS } from '../../data/mockData';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaId: PersonaId;
  currentConfig: DashboardConfig;
  onSave: (config: DashboardConfig) => void;
  language: Language;
  isFirstTimeSetup?: boolean;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  personaId,
  currentConfig,
  onSave,
  language,
  isFirstTimeSetup = false,
}) => {
  // Working state inside the editor
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [customWidgets, setCustomWidgets] = useState<CustomWidgetConfig[]>([]);
  const [widgetSettings, setWidgetSettings] = useState<{
    skinType?: 'light' | 'brown' | 'dark';
    myPlansShowScheduled?: boolean;
    myPlansShowOpen?: boolean;
    [key: string]: any;
  }>({
    skinType: 'brown',
    myPlansShowScheduled: true,
    myPlansShowOpen: true,
  });

  // UI state
  const [expandedSettingsWidgetId, setExpandedSettingsWidgetId] = useState<string | null>(null);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [showOtherPersonas, setShowOtherPersonas] = useState(false);

  // New Custom Widget form state
  const [customName, setCustomName] = useState('Should I Go Outside?');
  const [customInfoSelected, setCustomInfoSelected] = useState({
    temp: true,
    rain: true,
    aqi: true,
    wind: true,
  });
  const [customConditions, setCustomConditions] = useState({
    maxRain: 30,
    maxTemp: 32,
    maxAqi: 100,
    maxWind: 20,
  });
  const [customDisplayStyle, setCustomDisplayStyle] = useState<
    'summary' | 'metrics' | 'timeline' | 'gauge'
  >('summary');
  const [showCustomPreview, setShowCustomPreview] = useState(true);

  // Initialize/sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setWidgetOrder(currentConfig.widgetOrder ? [...currentConfig.widgetOrder] : []);
      setCustomWidgets(currentConfig.customWidgets ? [...currentConfig.customWidgets] : []);
      setWidgetSettings(
        currentConfig.widgetSettings
          ? { ...currentConfig.widgetSettings }
          : {
            skinType: 'brown',
            myPlansShowScheduled: true,
            myPlansShowOpen: true,
          }
      );
      setExpandedSettingsWidgetId(null);
      setIsAddWidgetOpen(false);
      setIsCreateCustomOpen(false);
      setIsConfirmRestoreOpen(false);
      setShowOtherPersonas(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const activePersonaMeta = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  // Helper to find widget metadata
  const getWidgetMeta = (id: string): { name: string; category: string; desc: string } => {
    const sys = AVAILABLE_SYSTEM_WIDGETS.find((w) => w.id === id);
    if (sys) {
      return {
        name: language === 'en' ? sys.nameEn : sys.nameHi,
        category: sys.category,
        desc: language === 'en' ? sys.descEn : sys.descHi,
      };
    }
    const custom = customWidgets.find((c) => c.id === id);
    if (custom) {
      return {
        name: `${custom.name} (Custom)`,
        category: 'custom',
        desc: `Rule: Rain < ${custom.conditions.maxRain}%, Temp < ${custom.conditions.maxTemp}°C, AQI < ${custom.conditions.maxAqi}.`,
      };
    }
    return {
      name: id,
      category: 'general',
      desc: '',
    };
  };

  // Helper for widget icons
  const getWidgetIcon = (id: string) => {
    switch (id) {
      case 'currentWeather':
        return <CloudSun size={15} />;
      case 'aqi':
        return <Activity size={15} />;
      case 'uvIndex':
      case 'uvSkin':
        return <Sun size={15} />;
      case 'hourlyForecast':
        return <Clock size={15} />;
      case 'bestHours':
      case 'bestWorstHours':
        return <Sun size={15} />;
      case 'personaScore':
        return <Sliders size={15} />;
      case 'advice':
        return <HeartPulse size={15} />;
      case 'decisions':
        return <CheckCircle2 size={15} />;
      case 'myPlans':
        return <Calendar size={15} />;
      case 'arrivalOpportunity':
      case 'bestDeparture':
        return <Navigation size={15} />;
      case 'changeAlerts':
        return <AlertTriangle size={15} />;
      case 'visibility':
        return <Eye size={15} />;
      case 'commuteDelay':
      case 'roadSafety':
        return <Car size={15} />;
      case 'allergyRisk':
        return <HeartPulse size={15} />;
      case 'flightRisk':
      case 'destComfort':
      case 'savedDestWeather':
      case 'packingSuggestions':
        return <Compass size={15} />;
      default:
        return <Layers size={15} />;
    }
  };

  // Reordering handlers
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setWidgetOrder((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= widgetOrder.length - 1) return;
    setWidgetOrder((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgetOrder((prev) => prev.filter((id) => id !== widgetId));
  };

  const handleAddWidget = (widgetId: string) => {
    if (!widgetOrder.includes(widgetId)) {
      setWidgetOrder((prev) => [...prev, widgetId]);
    }
  };

  // Create custom widget handler
  const handleCreateCustomWidget = () => {
    const newId = `custom_${Date.now()}`;
    const newWidget: CustomWidgetConfig = {
      id: newId,
      name: customName.trim() || 'My Weather Check',
      infoSelected: { ...customInfoSelected },
      conditions: { ...customConditions },
      displayStyle: customDisplayStyle,
    };

    setCustomWidgets((prev) => [...prev, newWidget]);
    setWidgetOrder((prev) => [...prev, newId]);
    setIsCreateCustomOpen(false);
  };

  // Restore recommended handler
  const handleConfirmRestore = () => {
    const recommended = getRecommendedWidgetsForPersona(personaId);
    setWidgetOrder(recommended);
    setIsConfirmRestoreOpen(false);
  };

  // Save handler
  const handleSave = () => {
    const updatedConfig: DashboardConfig = {
      setupMode: 'customize',
      widgetOrder,
      widgetSettings,
      customWidgets,
    };
    onSave(updatedConfig);
  };

  // Persona-specific recommended list
  const personaRecommendedWidgets = AVAILABLE_SYSTEM_WIDGETS.filter(
    (w) => w.personaSpecificFor && w.personaSpecificFor.includes(personaId)
  );

  // Other personas' widgets (for the secondary collapsible)
  const otherPersonaWidgets = AVAILABLE_SYSTEM_WIDGETS.filter(
    (w) => w.category === 'persona-specific' && (!w.personaSpecificFor || !w.personaSpecificFor.includes(personaId))
  );

  // Representative items for compact Live Preview (max 3)
  const previewWidgetIds = widgetOrder.slice(0, 3);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1200,
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* =========================================================
          STICKY TOP HEADER (UX4G Government Navy)
          ========================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #002b5c 0%, #0a4b8c 100%)',
          color: '#ffffff',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <span
              style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#c29b38',
                fontWeight: 800,
              }}
            >
              {language === 'en' ? 'Personalized Dashboard' : 'व्यक्तिगत डैशबोर्ड'}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '2px', lineHeight: 1.2 }}>
              {language === 'en' ? 'Customize Dashboard' : 'डैशबोर्ड कस्टमाइज़ करें'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '3px' }}>
              {language === 'en'
                ? 'Choose what matters to you.'
                : 'अपनी प्राथमिकताओं के अनुसार मौसम की जानकारी चुनें।'}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Persona Indicator Context Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.12)',
            padding: '3px 8px',
            borderRadius: '12px',
            marginTop: '8px',
            fontSize: '0.7rem',
            color: '#e2e8f0',
          }}
        >
          <span>Persona:</span>
          <strong style={{ color: '#ffffff' }}>
            {language === 'en' ? activePersonaMeta.nameEn : activePersonaMeta.nameHi}
          </strong>
        </div>
      </div>

      {/* =========================================================
          MAIN SCROLLABLE CONTENT AREA
          ========================================================= */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* =========================================================
            SECTION 1 — YOUR DASHBOARD (Only Currently Selected Widgets)
            ========================================================= */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            padding: '12px 12px 14px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: 'var(--imd-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                YOUR DASHBOARD
              </span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                Modules currently active in your personalized view ({widgetOrder.length})
              </p>
            </div>
          </div>

          {/* Current Widgets List */}
          {widgetOrder.length === 0 ? (
            <div
              style={{
                padding: '20px 14px',
                textAlign: 'center',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={24} color="var(--text-subtle)" />
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)' }}>
                No information modules selected
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                Tap &quot;Add Information&quot; below to pick weather modules suited to your daily routine.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {widgetOrder.map((id, index) => {
                const meta = getWidgetMeta(id);
                const hasSettings = id === 'uvSkin' || id === 'myPlans';
                const isExpanded = expandedSettingsWidgetId === id;

                return (
                  <div
                    key={id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Widget Row */}
                    <div
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      {/* Left: Reorder Symbol, Icon, Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '0.95rem',
                            color: '#94a3b8',
                            userSelect: 'none',
                            lineHeight: 1,
                          }}
                          title="Reorder item"
                        >
                          ☷
                        </span>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--imd-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {getWidgetIcon(id)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              color: 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.25,
                            }}
                          >
                            {meta.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.67rem',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {meta.desc}
                          </div>
                        </div>
                      </div>

                      {/* Right Controls: Settings (if applicable), Up, Down, Remove */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {hasSettings && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSettingsWidgetId(isExpanded ? null : id)
                            }
                            style={{
                              padding: '5px 7px',
                              borderRadius: '5px',
                              background: isExpanded ? '#e0f2fe' : '#f1f5f9',
                              border: isExpanded ? '1px solid #0284c7' : '1px solid #cbd5e1',
                              color: isExpanded ? '#0284c7' : 'var(--text-main)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Widget Settings"
                          >
                            <SettingsIcon size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          style={{
                            padding: '5px 7px',
                            borderRadius: '5px',
                            background: index === 0 ? '#f8fafc' : '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: index === 0 ? '#cbd5e1' : 'var(--text-main)',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === widgetOrder.length - 1}
                          style={{
                            padding: '5px 7px',
                            borderRadius: '5px',
                            background: index === widgetOrder.length - 1 ? '#f8fafc' : '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: index === widgetOrder.length - 1 ? '#cbd5e1' : 'var(--text-main)',
                            cursor: index === widgetOrder.length - 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveWidget(id)}
                          style={{
                            padding: '5px 7px',
                            borderRadius: '5px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove from Dashboard"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Widget Settings (only for uvSkin & myPlans) */}
                    {hasSettings && isExpanded && (
                      <div
                        style={{
                          padding: '10px 12px',
                          background: '#f8fafc',
                          borderTop: '1px solid #e2e8f0',
                        }}
                      >
                        {id === 'uvSkin' && (
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '5px' }}>
                              Skin Photo-Type Sensitivity:
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {(['light', 'brown', 'dark'] as const).map((type) => (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() =>
                                    setWidgetSettings((prev) => ({
                                      ...prev,
                                      skinType: type,
                                    }))
                                  }
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    background: widgetSettings.skinType === type ? '#fef3c7' : '#ffffff',
                                    border: widgetSettings.skinType === type ? '2px solid #d97706' : '1px solid #cbd5e1',
                                    color: widgetSettings.skinType === type ? '#92400e' : '#475569',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {type}
                                  {type === 'brown' ? ' (Indian Avg)' : ''}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {id === 'myPlans' && (
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '5px' }}>
                              Sub-Sections inside My Plans:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={widgetSettings.myPlansShowScheduled !== false}
                                  onChange={(e) =>
                                    setWidgetSettings((prev) => ({
                                      ...prev,
                                      myPlansShowScheduled: e.target.checked,
                                    }))
                                  }
                                  style={{ accentColor: 'var(--imd-primary)' }}
                                />
                                <span>☑ Scheduled Plans (Fixed time & location)</span>
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={widgetSettings.myPlansShowOpen !== false}
                                  onChange={(e) =>
                                    setWidgetSettings((prev) => ({
                                      ...prev,
                                      myPlansShowOpen: e.target.checked,
                                    }))
                                  }
                                  style={{ accentColor: 'var(--imd-primary)' }}
                                />
                                <span>☑ Open / Condition-Based Plans (Flexible weather)</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SECTION 2 ACTION: Add Information */}
          <button
            type="button"
            onClick={() => setIsAddWidgetOpen(true)}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#f0f9ff',
              border: '1.5px dashed #0284c7',
              color: '#0284c7',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Add Information</span>
          </button>
        </div>

        {/* =========================================================
            SECTION 2 — LIVE PREVIEW (Compact & Representative)
            ========================================================= */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} color="var(--imd-secondary)" />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--imd-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                LIVE PREVIEW
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
              {widgetOrder.length} {widgetOrder.length === 1 ? 'module active' : 'modules active'}
            </span>
          </div>

          {previewWidgetIds.length === 0 ? (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px dashed #cbd5e1',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              Empty dashboard preview. Add modules above to visualize.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {previewWidgetIds.map((id, idx) => {
                const meta = getWidgetMeta(id);
                let metricValue = 'Active';
                let metricColor = 'var(--imd-secondary)';

                if (id === 'personaScore') {
                  metricValue = '78 / 100 • Favorable';
                  metricColor = '#0284c7';
                } else if (id === 'aqi') {
                  metricValue = '142 • Moderate (CPCB)';
                  metricColor = '#16a34a';
                } else if (id === 'myPlans') {
                  metricValue = '2 Weather Plans';
                  metricColor = 'var(--text-main)';
                } else if (id === 'currentWeather') {
                  metricValue = '31°C • Haze & Warm';
                  metricColor = 'var(--imd-primary)';
                } else if (id === 'uvIndex' || id === 'uvSkin') {
                  metricValue = 'UV 6.4 • Very High';
                  metricColor = '#d97706';
                } else if (id === 'visibility') {
                  metricValue = '4.2 km • Moderate';
                  metricColor = '#0284c7';
                } else if (id === 'commuteDelay') {
                  metricValue = 'Low Risk (+5 min)';
                  metricColor = '#16a34a';
                } else if (id === 'flightRisk') {
                  metricValue = 'Normal Conditions';
                  metricColor = '#16a34a';
                }

                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-subtle)' }}>
                        {idx + 1}.
                      </span>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {meta.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: metricColor,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {metricValue}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: '0.67rem', color: 'var(--text-subtle)', marginTop: '6px', textAlign: 'center' }}>
            Simulating top modules on your Home screen
          </div>
        </div>

        {/* =========================================================
            SECTION 3 — CUSTOM WIDGETS
            ========================================================= */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2px',
            }}
          >
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--imd-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              CUSTOM WIDGETS
            </span>
            {customWidgets.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                {customWidgets.length} custom created
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.35 }}>
            Create a simple weather check using conditions you choose.
          </p>

          <button
            type="button"
            onClick={() => setIsCreateCustomOpen(true)}
            className="btn-secondary"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span>Create Custom Widget</span>
          </button>
        </div>

        {/* =========================================================
            SECTION 4 — RESTORE RECOMMENDED (Secondary Action)
            ========================================================= */}
        <div style={{ textAlign: 'center', padding: '6px 0 2px 0' }}>
          <button
            type="button"
            onClick={() => setIsConfirmRestoreOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--imd-secondary)',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              textDecoration: 'underline',
            }}
          >
            <RotateCcw size={13} />
            <span>Restore Recommended Dashboard</span>
          </button>
          <p style={{ fontSize: '0.67rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
            Returns your dashboard to the recommended layout for your selected persona.
          </p>
        </div>
      </div>

      {/* =========================================================
          STICKY BOTTOM SAVE BAR
          ========================================================= */}
      <div
        style={{
          flexShrink: 0,
          background: '#ffffff',
          borderTop: '1px solid #cbd5e1',
          padding: '10px 16px 12px 16px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          style={{ width: '35%', minHeight: '40px', fontSize: '0.82rem', fontWeight: 700 }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          style={{ width: '65%', minHeight: '40px', fontSize: '0.84rem', fontWeight: 800 }}
        >
          <span>Save Dashboard</span>
        </button>
      </div>

      {/* =========================================================
          SHEET: ADD INFORMATION (Grouped by Category & Persona-Prioritized)
          ========================================================= */}
      {isAddWidgetOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1300,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              maxHeight: '90%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
            }}
          >
            {/* Sheet Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--imd-primary)',
                color: '#ffffff',
              }}
            >
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#ffffff' }}>
                  Add Information to Dashboard
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                  Personalized recommendations for {activePersonaMeta.nameEn}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWidgetOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sheet Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* 1. RECOMMENDED FOR YOU (Persona-specific) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <ShieldCheck size={14} color="#0284c7" />
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    RECOMMENDED FOR YOU ({activePersonaMeta.nameEn.toUpperCase()})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {personaRecommendedWidgets.map((w) => {
                    const isAdded = widgetOrder.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isAdded ? '1.5px solid #bae6fd' : '1px solid #cbd5e1',
                          background: isAdded ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div style={{ paddingRight: '6px', minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {language === 'en' ? w.nameEn : w.nameHi}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {language === 'en' ? w.descEn : w.descHi}
                          </div>
                        </div>

                        {isAdded ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveWidget(w.id)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#e0f2fe',
                              borderRadius: '4px',
                              border: '1px solid #bae6fd',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                            title="Click to remove"
                          >
                            ✓ Added
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddWidget(w.id)}
                            className="btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              minHeight: '28px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. WEATHER */}
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--imd-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  WEATHER
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {AVAILABLE_SYSTEM_WIDGETS.filter((w) => w.category === 'weather').map((w) => {
                    const isAdded = widgetOrder.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isAdded ? '1.5px solid #bae6fd' : '1px solid #cbd5e1',
                          background: isAdded ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div style={{ paddingRight: '6px', minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {language === 'en' ? w.nameEn : w.nameHi}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {language === 'en' ? w.descEn : w.descHi}
                          </div>
                        </div>

                        {isAdded ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveWidget(w.id)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#e0f2fe',
                              borderRadius: '4px',
                              border: '1px solid #bae6fd',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                            title="Click to remove"
                          >
                            ✓ Added
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddWidget(w.id)}
                            className="btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              minHeight: '28px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. PERSONALIZED */}
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--imd-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {language === 'en' ? 'PERSONALIZED' : 'व्यक्तिगत जानकारी'}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {AVAILABLE_SYSTEM_WIDGETS.filter((w) => w.category === 'personalized').map((w) => {
                    const isAdded = widgetOrder.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isAdded ? '1.5px solid #bae6fd' : '1px solid #cbd5e1',
                          background: isAdded ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div style={{ paddingRight: '6px', minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {language === 'en' ? w.nameEn : w.nameHi}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {language === 'en' ? w.descEn : w.descHi}
                          </div>
                        </div>

                        {isAdded ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveWidget(w.id)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#e0f2fe',
                              borderRadius: '4px',
                              border: '1px solid #bae6fd',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                            title="Click to remove"
                          >
                            ✓ Added
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddWidget(w.id)}
                            className="btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              minHeight: '28px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. PLANS & OPPORTUNITIES */}
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--imd-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {language === 'en' ? 'PLANS & OPPORTUNITIES' : 'योजनाएं एवं अवसर'}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {AVAILABLE_SYSTEM_WIDGETS.filter((w) => w.category === 'planning').map((w) => {
                    const isAdded = widgetOrder.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isAdded ? '1.5px solid #bbf7d0' : '1px solid #cbd5e1',
                          background: isAdded ? '#f0fdf4' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div style={{ paddingRight: '6px', minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {language === 'en' ? w.nameEn : w.nameHi}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {language === 'en' ? w.descEn : w.descHi}
                          </div>
                        </div>

                        {isAdded ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveWidget(w.id)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#15803d',
                              background: '#dcfce7',
                              borderRadius: '4px',
                              border: '1px solid #bbf7d0',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                            }}
                            title="Click to remove"
                          >
                            ✓ Added
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddWidget(w.id)}
                            className="btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              minHeight: '28px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. OTHER PERSONA MODULES (Collapsible to keep interface uncluttered) */}
              {otherPersonaWidgets.length > 0 && (
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowOtherPersonas(!showOtherPersonas)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      background: 'none',
                      border: 'none',
                      color: 'var(--imd-secondary)',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <span>Other Profile Modules ({otherPersonaWidgets.length})</span>
                    {showOtherPersonas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showOtherPersonas && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                      {otherPersonaWidgets.map((w) => {
                        const isAdded = widgetOrder.includes(w.id);
                        return (
                          <div
                            key={w.id}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: isAdded ? '1.5px solid #bae6fd' : '1px solid #cbd5e1',
                              background: isAdded ? '#f0f9ff' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}
                          >
                            <div style={{ paddingRight: '6px', minWidth: 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {language === 'en' ? w.nameEn : w.nameHi}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                {language === 'en' ? w.descEn : w.descHi}
                              </div>
                            </div>

                            {isAdded ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveWidget(w.id)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: '#0284c7',
                                  background: '#e0f2fe',
                                  borderRadius: '4px',
                                  border: '1px solid #bae6fd',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                }}
                              >
                                ✓ Added
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddWidget(w.id)}
                                className="btn-primary"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.72rem',
                                  minHeight: '28px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Done Button */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #cbd5e1', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setIsAddWidgetOpen(false)}
                className="btn-primary"
                style={{ width: '100%', minHeight: '38px', fontSize: '0.84rem', fontWeight: 800 }}
              >
                Done Adding Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE CUSTOM WIDGET
          ========================================================= */}
      {isCreateCustomOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1400,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              maxHeight: '90%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={18} color="var(--imd-secondary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--imd-primary)' }}>
                  CREATE CUSTOM WIDGET
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCustomOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Widget Name */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Widget Name:
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Should I Go Outside?"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--border-light)',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              />
            </div>

            {/* Choose Information */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Choose Information:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                  <input
                    type="checkbox"
                    checked={customInfoSelected.temp}
                    onChange={(e) =>
                      setCustomInfoSelected((p) => ({ ...p, temp: e.target.checked }))
                    }
                    style={{ accentColor: 'var(--imd-primary)' }}
                  />
                  <span>☑ Temperature</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                  <input
                    type="checkbox"
                    checked={customInfoSelected.rain}
                    onChange={(e) =>
                      setCustomInfoSelected((p) => ({ ...p, rain: e.target.checked }))
                    }
                    style={{ accentColor: 'var(--imd-primary)' }}
                  />
                  <span>☑ Rain Probability</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                  <input
                    type="checkbox"
                    checked={customInfoSelected.aqi}
                    onChange={(e) =>
                      setCustomInfoSelected((p) => ({ ...p, aqi: e.target.checked }))
                    }
                    style={{ accentColor: 'var(--imd-primary)' }}
                  />
                  <span>☑ AQI</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                  <input
                    type="checkbox"
                    checked={customInfoSelected.wind}
                    onChange={(e) =>
                      setCustomInfoSelected((p) => ({ ...p, wind: e.target.checked }))
                    }
                    style={{ accentColor: 'var(--imd-primary)' }}
                  />
                  <span>☑ Wind</span>
                </label>
              </div>
            </div>

            {/* Threshold Conditions */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Conditions (Thresholds for Safe / Favorable):
              </label>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px',
                  marginTop: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.74rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Rain Probability &lt;</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={customConditions.maxRain}
                      onChange={(e) =>
                        setCustomConditions((p) => ({ ...p, maxRain: Number(e.target.value) }))
                      }
                      style={{ width: '50px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <span>%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Temperature &lt;</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={customConditions.maxTemp}
                      onChange={(e) =>
                        setCustomConditions((p) => ({ ...p, maxTemp: Number(e.target.value) }))
                      }
                      style={{ width: '50px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <span>°C</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>AQI &lt;</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={customConditions.maxAqi}
                      onChange={(e) =>
                        setCustomConditions((p) => ({ ...p, maxAqi: Number(e.target.value) }))
                      }
                      style={{ width: '50px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Wind &lt;</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={customConditions.maxWind}
                      onChange={(e) =>
                        setCustomConditions((p) => ({ ...p, maxWind: Number(e.target.value) }))
                      }
                      style={{ width: '50px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <span>km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Style */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Display Style:
              </label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {(['summary', 'metrics', 'timeline', 'gauge'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setCustomDisplayStyle(style)}
                    style={{
                      flex: 1,
                      padding: '5px 4px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: customDisplayStyle === style ? 800 : 600,
                      textTransform: 'capitalize',
                      background: customDisplayStyle === style ? '#002b5c' : '#f8fafc',
                      color: customDisplayStyle === style ? '#ffffff' : 'var(--text-main)',
                      border:
                        customDisplayStyle === style
                          ? '1px solid #002b5c'
                          : '1px solid #cbd5e1',
                      cursor: 'pointer',
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Preview */}
            {showCustomPreview && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534' }}>
                    Preview: {customName || 'Should I Go Outside?'}
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                    FAVORABLE
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '4px' }}>
                  Active rule: Rain &lt; {customConditions.maxRain}%, Temp &lt; {customConditions.maxTemp}°C, AQI &lt; {customConditions.maxAqi}.
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCreateCustomOpen(false)}
                style={{ width: '40%', fontSize: '0.78rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCreateCustomWidget}
                style={{ width: '60%', fontSize: '0.8rem', fontWeight: 800 }}
              >
                <span>Create Widget</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: RESTORE CONFIRMATION DIALOG
          ========================================================= */}
      {isConfirmRestoreOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1500,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '18px',
              width: '100%',
              maxWidth: '320px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <RotateCcw size={22} color="#d97706" />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>
              Restore recommended dashboard?
            </h3>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.45 }}>
              This will restore the standard widgets recommended for{' '}
              <strong>{activePersonaMeta.nameEn}</strong>. Your skin type, custom factor adjustments, and plans will not be affected.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsConfirmRestoreOpen(false)}
                style={{ flex: 1, fontSize: '0.78rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmRestore}
                style={{ flex: 1, fontSize: '0.78rem', background: '#d97706', fontWeight: 800 }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
