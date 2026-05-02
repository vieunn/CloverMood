import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Register } from './features/auth/components';
import { Dashboard } from './features/dashboard/components';
import { Profile } from './features/profile/components';
import { ActivityHistory } from './features/activity/components';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<ActivityHistory />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}