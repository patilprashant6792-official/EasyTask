import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import Preferences from './pages/Preferences';
import { PreferencesProvider } from './context/PreferenceContext';
import MasterLayout from './components/MasterLayout';
import ForgotPassword from './pages/ForgotPassword';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={
          <PreferencesProvider>
            <MasterLayout>
              <Dashboard />
            </MasterLayout>
          </PreferencesProvider>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <PreferencesProvider>
            <MasterLayout>
              <UserProfile />
            </MasterLayout>
          </PreferencesProvider>
        } />
        <Route path="/preferences" element={
          <PreferencesProvider>
            <MasterLayout>
              <Preferences />
            </MasterLayout>
          </PreferencesProvider>
        } />
        <Route path="/forgot" element={
              <ForgotPassword />
        } />
      </Routes>
    </Router>
  );
};

export default App;
