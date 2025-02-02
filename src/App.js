import React from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import './assets/css/app.css';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/auth/LoginPage';
import ResetPassword from './pages/auth/ResetPassword';
import ProfilePage from './pages/profile/ProfilePage';
import ChangePasswordPage from './pages/profile/ChangePasswordPage';
import UserPreferencesPage from './pages/profile/UserPreferencesPage';
import RealTimeTracking from './pages/RealTimeTracking';
import Analytics from './pages/Analytics';
import TimeSpent from './pages/TimeSpent';
import FieldAgentManagement from './pages/FieldAgentManagement';
import FieldAgentAdd from './pages/FieldAgentAdd';
import FieldAgentList from './pages/FieldAgentList';
import AgentPrivileges from './pages/AgentPrivileges';
import AgentTeamPrivileges from './pages/AgentTeamPrivileges';
import AgentTeamAdd from './pages/AgentTeamAdd';
import AgentTeamList from './pages/AgentTeamList';
import TimeSpentReport from './pages/TimeSpentReport';
import ScheduleAdd from './pages/ScheduleAdd';
import ScheduleList from './pages/ScheduleList';
import SosList from './pages/SosList';

// Function to check if the user is logged in (e.g., checking if token exists)
const isAuthenticated = () => {
  return !!localStorage.getItem('token');  // Replace this with your actual authentication check logic
};

// Create a ProtectedRoute component to guard routes that require login
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect to Login if not authenticated */}
        <Route exact path='/' element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
        
        {/* Public Routes */}
        <Route exact path='/login' element={<LoginPage/>} />
        <Route exact path='/reset-password' element={<ResetPassword/>} />

        {/* Protected Routes */}
        <Route exact path='/dashboard' element={<ProtectedRoute element={<DashboardPage />} />} />
        <Route exact path='/profile' element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route exact path='/change-password' element={<ProtectedRoute element={<ChangePasswordPage />} />} />
        <Route exact path='/preferences' element={<ProtectedRoute element={<UserPreferencesPage />} />} />
        {/* <Route exact path='/typography' element={<ProtectedRoute element={<TypographyPage />} />} /> */}
        <Route exact path='/realtime-tracking' element={<ProtectedRoute element={<RealTimeTracking />} />} />
        <Route exact path='/analytics' element={<ProtectedRoute element={<Analytics />} />} />
        <Route exact path='/timespent' element={<ProtectedRoute element={<TimeSpent />} />} />
        <Route exact path='/field-agent-management' element={<ProtectedRoute element={<FieldAgentManagement />} />} />
        <Route exact path='/field-agent/field-agent-add' element={<ProtectedRoute element={<FieldAgentAdd />} />} />
        <Route exact path='/field-agent/field-agent-list' element={<ProtectedRoute element={<FieldAgentList />} />} />
        <Route exact path='/field-agent/agent-privileges' element={<ProtectedRoute element={<AgentPrivileges />} />} />
        <Route exact path='/field-agent/agent-team-privileges' element={<ProtectedRoute element={<AgentTeamPrivileges />} />} />
        <Route exact path='/field-agent/agent-team-add' element={<ProtectedRoute element={<AgentTeamAdd />} />} />
        <Route exact path='/field-agent/agent-team-list' element={<ProtectedRoute element={<AgentTeamList />} />} />
        <Route exact path='/timespent-report' element={<ProtectedRoute element={<TimeSpentReport />} />} />
        <Route exact path='/schedule-list' element={<ProtectedRoute element={<ScheduleList />} />} />
        <Route exact path='/schedule-add' element={<ProtectedRoute element={<ScheduleAdd />} />} />
        <Route exact path='/Soslist' element={<ProtectedRoute element={<SosList />} />} />
      </Routes>
    </Router>
  );
}

export default App;
