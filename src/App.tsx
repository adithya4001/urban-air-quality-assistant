import React from 'react';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <DashboardPage />
    </div>
  );
};

export default App;
