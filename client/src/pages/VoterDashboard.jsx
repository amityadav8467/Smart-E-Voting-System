import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

const VoterDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [activeTab, setActiveTab] = useState('elections');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionsRes, profileRes] = await Promise.all([
          api.get('/voter/elections'),
          api.get('/voter/profile')
        ]);
        setElections(electionsRes.data);
        setProfile(profileRes.data);
        setProfileForm({ name: profileRes.data.name, phone: profileRes.data.phone });
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/voter/profile', profileForm);
      setProfile(data);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Voter Dashboard</h1>
          <p className="text-gray-500">Welcome, {user?.name}</p>
        </div>

        <div className="flex space-x-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
          {['elections', 'history', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab === 'elections' ? '🗳️ Elections' : tab === 'history' ? '📜 History' : '👤 Profile'}
            </button>
          ))}
        </div>

        {activeTab === 'elections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">🗳️</div>
                <p className="text-xl">No active elections at the moment</p>
              </div>
            ) : elections.map(election => {
              const hasVoted = profile?.hasVoted?.some(v => v.electionId?.toString() === election._id?.toString());
              return (
                <div key={election._id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">🟢 ACTIVE</span>
                    {hasVoted && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">✅ Voted</span>}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{election.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{election.description}</p>
                  <p className="text-gray-400 text-xs mb-4">{election.candidates?.length || 0} candidates</p>
                  <div className="flex gap-2">
                    {!hasVoted && (
                      <Link to={`/vote/${election._id}`} className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Vote Now
                      </Link>
                    )}
                    <Link to={`/results/${election._id}`} className="flex-1 border border-blue-600 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-50 text-sm font-medium">
                      Results
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Voting History</h2>
              <Link
                to="/verify-receipt"
                className="text-sm bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                🧾 Verify Receipt
              </Link>
            </div>
            {profile?.hasVoted?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">You haven't voted in any elections yet.</p>
            ) : (
              <div className="space-y-3">
                {profile?.hasVoted?.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Election ID: {v.electionId}</span>
                    <span className="text-green-600 font-medium">✅ Voted</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Profile</h2>
            {!editMode ? (
              <div className="space-y-4">
                {[
                  { label: 'Name', value: profile?.name },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone },
                  { label: 'Voter ID', value: profile?.voterID },
                  { label: 'Role', value: profile?.role },
                  { label: 'Verified', value: profile?.isVerified ? '✅ Yes' : '❌ No' }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">{label}</span>
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))}
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">Save</button>
                  <button type="button" onClick={() => setEditMode(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterDashboard;
