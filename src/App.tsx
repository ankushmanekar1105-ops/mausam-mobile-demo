import React, { useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { Header } from './components/Header/Header';
import { BottomNav } from './components/Navigation/BottomNav';
import { HomeTab } from './components/Tabs/HomeTab';
import { TodayTab } from './components/Tabs/TodayTab';
import { PersonalizedTab } from './components/Tabs/PersonalizedTab';
import { WeeklyTab } from './components/Tabs/WeeklyTab';
import { NotificationsModal } from './components/Modals/NotificationsModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { CitySearchModal } from './components/Modals/CitySearchModal';
import { NewPlanModal } from './components/Modals/NewPlanModal';
import { CITIES_DATA } from './data/mockData';
import { TabId, PersonaId, UserSettings, PlanItem, DashboardConfig } from './types';
import { getCurrentUser, signOut, DemoUser } from './services/auth';
import { createDefaultDashboardConfig } from './data/dashboardPresets';
import { DashboardCustomizerModal } from './components/Modals/DashboardCustomizerModal';
import { TodayCitySearchModal } from './components/Modals/TodayCitySearchModal';

const INITIAL_SETTINGS: UserSettings = {
  language: 'en',
  selectedPersonas: ['commuter', 'health'],
  activePersonaId: 'commuter',
  activeCityId: 'delhi',
  savedCityIds: ['delhi', 'mumbai', 'bengaluru', 'shimla'],
  isAuthenticated: false,
  userEmail: '',
  userName: '',
  userPhone: '',
  hasCompletedOnboarding: false,
  hasGivenLocationConsent: true,
  offlineMode: false,
  notifications: {
    officialWarnings: true,
    proactiveOpportunityAlerts: true,
    arrivalAlerts: true,
    dailyForecastSummary: true,
    fatigueThreshold: 40,
    quietHoursEnabled: true,
    quietHoursRange: '22:00 – 06:00',
  },
  widgetOrder: ['score', 'plans', 'arrival', 'alerts', 'decisions', 'advice'],
};

export const App: React.FC = () => {
  // Check if returning authenticated user exists in persistent storage
  const [settings, setSettings] = useState<UserSettings>(() => {
    const activeAuthUser = getCurrentUser();
    if (activeAuthUser && activeAuthUser.hasCompletedOnboarding) {
      return {
        ...INITIAL_SETTINGS,
        isAuthenticated: true,
        userEmail: activeAuthUser.email,
        userName: activeAuthUser.name || 'Ankus Sharma',
        userPhone: activeAuthUser.phone || '',
        activeCityId: activeAuthUser.cityId || 'delhi',
        hasCompletedOnboarding: true,
      };
    }
    return INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isDashboardCustomizerOpen, setIsDashboardCustomizerOpen] = useState(false);

  // DASHBOARD CONFIGURATION STATE
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() =>
    createDefaultDashboardConfig('commuter', 'recommended')
  );

  // SHARED PLANS STATE — STARTS COMPLETELY EMPTY [] ON INITIAL LOGIN!
  const [plans, setPlans] = useState<PlanItem[]>([]);

  // ARRIVAL-AWARE OPPORTUNITY STATE
  const [opportunityPlanned, setOpportunityPlanned] = useState<boolean>(false);
  const [opportunityDismissed, setOpportunityDismissed] = useState<boolean>(false);

  // UNREAD ALERTS STATE (Initial state = 0, no red '!' badge)
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);

  // TODAY TAB TEMPORARY VIEWED CITY (Independent from global activeCity)
  const [todayViewedCityId, setTodayViewedCityId] = useState<string | null>(null);
  const [isTodayCitySearchOpen, setIsTodayCitySearchOpen] = useState<boolean>(false);

  // Active City
  const activeCity =
    CITIES_DATA.find((c) => c.id === settings.activeCityId) || CITIES_DATA[0];

  // Saved Cities for Home Tab
  const savedCities = CITIES_DATA.filter((c) =>
    settings.savedCityIds.includes(c.id)
  );

  // Returning user fast-track handler
  const handleLoginReturningUser = (user: DemoUser) => {
    setSettings((prev) => ({
      ...prev,
      isAuthenticated: true,
      userEmail: user.email,
      userName: user.name || 'Ankus Sharma',
      userPhone: user.phone || '',
      activeCityId: user.cityId || prev.activeCityId,
      hasCompletedOnboarding: true,
    }));
    setActiveTab('home');
  };

  // Onboarding completion handler after Profile -> Consent -> Personas -> Dashboard Setup
  const handleFinishOnboarding = (
    profileData: { name: string; phone: string; cityId: string },
    chosenPersonas: PersonaId[],
    targetTab: 'home' | 'personalized',
    newDashboardConfig?: DashboardConfig
  ) => {
    const currentUser = getCurrentUser();
    const hasChosen = chosenPersonas && chosenPersonas.length > 0;
    const activePersona = hasChosen ? chosenPersonas[0] : 'health';
    const finalConfig =
      newDashboardConfig || createDefaultDashboardConfig(activePersona, 'recommended');

    setDashboardConfig(finalConfig);

    setSettings((prev) => ({
      ...prev,
      isAuthenticated: true,
      userEmail: currentUser?.email || 'demo.user@imd.gov.in',
      userName: profileData.name,
      userPhone: profileData.phone,
      activeCityId: profileData.cityId,
      selectedPersonas: hasChosen ? chosenPersonas : ['health'],
      activePersonaId: activePersona,
      hasCompletedOnboarding: true,
      dashboardConfig: finalConfig,
    }));
    setActiveTab(targetTab);
  };

  // Logout handler (Authenticated session -> Logout -> Login screen)
  const handleLogout = async () => {
    await signOut();
    setSettings((prev) => ({
      ...prev,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    }));
    setIsSettingsOpen(false);
  };

  // Toggle Language between English and Hindi
  const handleToggleLanguage = () => {
    const nextLang = settings.language === 'en' ? 'hi' : 'en';
    setSettings((prev) => ({ ...prev, language: nextLang }));
  };

  // Switch City
  const handleSelectCity = (cityId: string) => {
    setSettings((prev) => ({ ...prev, activeCityId: cityId }));
  };

  // Add City to Saved List (up to 10 cities)
  const handleAddCity = (cityId: string) => {
    if (settings.savedCityIds.length >= 10) return;
    if (!settings.savedCityIds.includes(cityId)) {
      setSettings((prev) => ({
        ...prev,
        savedCityIds: [...prev.savedCityIds, cityId],
        activeCityId: cityId,
      }));
    }
  };

  // Remove City from Saved List
  const handleRemoveCity = (cityId: string) => {
    if (settings.savedCityIds.length <= 1) return;
    const updated = settings.savedCityIds.filter((id) => id !== cityId);
    setSettings((prev) => ({
      ...prev,
      savedCityIds: updated,
      activeCityId: prev.activeCityId === cityId ? updated[0] : prev.activeCityId,
    }));
  };

  // Switch Persona in Personalized Tab
  const handleSelectPersona = (personaId: PersonaId) => {
    setSettings((prev) => ({ ...prev, activePersonaId: personaId }));
  };

  // Reset to Defaults (Triggered after user confirms twice)
  const handleResetToDefault = async () => {
    await signOut();
    setSettings(INITIAL_SETTINGS);
    setDashboardConfig(createDefaultDashboardConfig('commuter', 'recommended'));
    setPlans([]);
    setOpportunityPlanned(false);
    setOpportunityDismissed(false);
    setUnreadAlerts(0);
    setActiveTab('home');
  };

  // Add newly created plan to shared state
  const handleAddPlan = (newPlan: PlanItem) => {
    setPlans((prev) => [newPlan, ...prev]);
  };

  // Plan opportunity from Arrival-Aware Weather
  const handlePlanOpportunity = (oppPlan: PlanItem) => {
    setPlans((prev) => [oppPlan, ...prev]);
    setOpportunityPlanned(true);
  };

  const handleDismissOpportunity = () => {
    setOpportunityDismissed(true);
  };

  const handleOpenNotifications = () => {
    setUnreadAlerts(0); // Mark alerts as read
    setIsNotificationsOpen(true);
  };

  const isUserAuthenticatedAndOnboarded =
    settings.isAuthenticated && settings.hasCompletedOnboarding;

  return (
    <PhoneFrame
      language={settings.language}
      onLanguageToggle={handleToggleLanguage}
      onResetDemo={handleResetToDefault}
    >
      {!isUserAuthenticatedAndOnboarded ? (
        <OnboardingFlow
          language={settings.language}
          onFinish={handleFinishOnboarding}
          onLanguageToggle={handleToggleLanguage}
          onLoginReturningUser={handleLoginReturningUser}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Header */}
          <Header
            city={activeCity}
            language={settings.language}
            onOpenCityModal={() => setIsCityModalOpen(true)}
            onOpenNotifications={handleOpenNotifications}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleLanguage={handleToggleLanguage}
            unreadAlerts={unreadAlerts}
          />

          {/* Main Tab Content View */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            {activeTab === 'home' && (
              <HomeTab
                activeCity={activeCity}
                savedCities={savedCities}
                plans={plans}
                onSelectCity={handleSelectCity}
                onRemoveCity={handleRemoveCity}
                onOpenAddCityModal={() => setIsCityModalOpen(true)}
                onNavigateToPersonalized={() => setActiveTab('personalized')}
                language={settings.language}
              />
            )}

            {activeTab === 'today' && (
              <TodayTab
                city={activeCity}
                language={settings.language}
                todayViewedCityId={todayViewedCityId}
                onSelectTodayCity={(newCityId) => setTodayViewedCityId(newCityId)}
                onOpenTodayCitySearch={() => setIsTodayCitySearchOpen(true)}
                onOpenCityModal={() => setIsCityModalOpen(true)}
              />
            )}

            {activeTab === 'personalized' && (
              <PersonalizedTab
                city={activeCity}
                activePersonaId={settings.activePersonaId}
                selectedPersonas={settings.selectedPersonas}
                plans={plans}
                onSelectPersona={handleSelectPersona}
                onOpenNewPlanModal={() => setIsNewPlanModalOpen(true)}
                onPlanOpportunity={handlePlanOpportunity}
                opportunityPlanned={opportunityPlanned}
                opportunityDismissed={opportunityDismissed}
                onDismissOpportunity={handleDismissOpportunity}
                language={settings.language}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyTab city={activeCity} language={settings.language} />
            )}
          </div>

          {/* Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            language={settings.language}
          />

          {/* Modals & Drawers */}
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            settings={settings}
            onUpdateNotifications={(updated) =>
              setSettings((prev) => ({ ...prev, notifications: updated }))
            }
            language={settings.language}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateLanguage={(lang) =>
              setSettings((prev) => ({ ...prev, language: lang }))
            }
            onResetToDefault={handleResetToDefault}
            onLogout={handleLogout}
            onOpenDashboardCustomizer={() => setIsDashboardCustomizerOpen(true)}
            language={settings.language}
          />

          <CitySearchModal
            isOpen={isCityModalOpen}
            onClose={() => setIsCityModalOpen(false)}
            savedCityIds={settings.savedCityIds}
            activeCityId={settings.activeCityId}
            onSelectAndSwitchCity={handleSelectCity}
            onAddCity={handleAddCity}
            language={settings.language}
          />

          <NewPlanModal
            isOpen={isNewPlanModalOpen}
            onClose={() => setIsNewPlanModalOpen(false)}
            activePersonaId={settings.activePersonaId}
            onAddPlan={handleAddPlan}
            language={settings.language}
          />

          {/* Adaptive Dashboard Customizer Modal */}
          <DashboardCustomizerModal
            isOpen={isDashboardCustomizerOpen}
            onClose={() => setIsDashboardCustomizerOpen(false)}
            personaId={settings.activePersonaId}
            currentConfig={dashboardConfig}
            onSave={(updatedConfig) => {
              setDashboardConfig(updatedConfig);
              setIsDashboardCustomizerOpen(false);
            }}
            language={settings.language}
          />

          {/* Today Tab Temporary City Search Modal */}
          <TodayCitySearchModal
            isOpen={isTodayCitySearchOpen}
            onClose={() => setIsTodayCitySearchOpen(false)}
            onSelectCity={(cityId) => {
              setTodayViewedCityId(cityId);
              setIsTodayCitySearchOpen(false);
            }}
            currentCityId={todayViewedCityId || activeCity.id}
            globalCity={activeCity}
            language={settings.language}
          />
        </div>
      )}
    </PhoneFrame>
  );
};

export default App;
