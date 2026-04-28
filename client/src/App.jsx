import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import VoterDashboard from './pages/VoterDashboard.jsx';
import VotingPage from './pages/VotingPage.jsx';
import Results from './pages/Results.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import VerifyReceipt from './pages/VerifyReceipt.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/results/:id" element={<Results />} />
          <Route
            path="/verify-receipt"
            element={
              <ProtectedRoute roles={['voter', 'admin', 'candidate']}>
                <VerifyReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['voter', 'admin', 'candidate']}>
                <VoterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote/:id"
            element={
              <ProtectedRoute roles={['voter']}>
                <VotingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
