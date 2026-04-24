import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const Home = () => {
  const [elections, setElections] = useState([]);

  useEffect(() => {
    api.get('/elections').then(({ data }) => setElections(data.filter(e => e.status === 'active'))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🗳️</div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Smart E-Voting System</h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Secure, transparent, and real-time digital voting platform. Your vote matters — cast it safely from anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all text-lg shadow-lg"
            >
              🚀 Get Started
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-700 transition-all text-lg"
            >
              Vote Now
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📝', title: 'Register & Verify', desc: 'Create your account with your Voter ID and verify via email OTP.' },
              { step: '2', icon: '🔐', title: 'Login Securely', desc: 'Login with your credentials protected by JWT authentication.' },
              { step: '3', icon: '✅', title: 'Cast Your Vote', desc: 'Choose your candidate and receive an instant vote confirmation receipt.' }
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center p-8 rounded-2xl bg-blue-50 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{step}</div>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Elections */}
      {elections.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Active Elections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map(election => (
                <div key={election._id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">🟢 ACTIVE</span>
                    <span className="text-gray-400 text-sm">{election.candidates?.length || 0} candidates</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{election.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{election.description}</p>
                  <div className="flex gap-2">
                    <Link
                      to={`/vote/${election._id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Vote Now
                    </Link>
                    <Link
                      to={`/results/${election._id}`}
                      className="flex-1 border border-blue-600 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      Results
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>© 2024 Smart E-Voting System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
