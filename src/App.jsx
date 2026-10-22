import React, { useState } from 'react';
import { AppProvider, useYraApp } from './context/AppContext';
import { NavigationHeader, Footer } from './components/Navigation';
import { CinematicIntro } from './components/CinematicIntro';
import { LandingPage } from './pages/LandingPage';
import { WorkspaceDashboard } from './pages/WorkspaceDashboard';
import { ResumeIntelligence } from './pages/ResumeIntelligence';
import { ApplicationStudio } from './pages/ApplicationStudio';
import { AIInterviewRoom } from './pages/AIInterviewRoom';
import { AnswerReview } from './pages/AnswerReview';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

function MainAppShell() {
  const { currentRoute, settings, updateSetting } = useYraApp();
  const [showCinematicIntro, setShowCinematicIntro] = useState(() => {
    // Show intro on first visit or if replayed
    return !settings.hasSeenIntro;
  });

  const handleCompleteIntro = () => {
    setShowCinematicIntro(false);
    updateSetting('hasSeenIntro', true);
  };

  const handleReplayIntro = () => {
    setShowCinematicIntro(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showCinematicIntro && <CinematicIntro onComplete={handleCompleteIntro} />}

      <NavigationHeader />

      <main style={{ flex: 1 }}>
        {currentRoute === 'landing' && <LandingPage />}
        {currentRoute === 'workspace' && <WorkspaceDashboard />}
        {currentRoute === 'resume' && <ResumeIntelligence />}
        {currentRoute === 'applications_new' && <ApplicationStudio />}
        {currentRoute === 'interview' && <AIInterviewRoom />}
        {currentRoute === 'review' && <AnswerReview />}
        {currentRoute === 'history' && <HistoryPage />}
        {currentRoute === 'settings' && <SettingsPage onReplayIntro={handleReplayIntro} />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
