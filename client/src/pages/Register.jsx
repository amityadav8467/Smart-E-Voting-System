import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', voterID: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setUserId(data.userId);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { userId, otp });
      toast.success('Email verified! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                <p className="text-gray-500 mt-2">Register as a voter</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
                  { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+1234567890' },
                  { label: 'Voter ID', name: 'voterID', type: 'text', placeholder: 'VTR-12345678' },
                  { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' }
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-lg"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">✉️</div>
                <h2 className="text-3xl font-bold text-gray-800">Verify Email</h2>
                <p className="text-gray-500 mt-2">Enter the OTP sent to {form.email}</p>
              </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-lg"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
