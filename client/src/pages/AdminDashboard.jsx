import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showElectionForm, setShowElectionForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const socketRef = useRef(null);

  const [electionForm, setElectionForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', party: '', symbol: '🗳️', manifesto: '' });

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch {
      toast.error('Failed to load stats');
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchStats();
      try {
        const { data } = await api.get('/admin/voters');
        setVoters(data);
      } catch {}
      setLoading(false);
    };
    fetchAll();
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('voteUpdate', fetchStats);
    return () => socketRef.current?.disconnect();
  }, []);

  const createElection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/elections', electionForm);
      toast.success('Election created!');
      setShowElectionForm(false);
      setElectionForm({ title: '', description: '', startDate: '', endDate: '' });
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create election');
    }
  };

  const changeStatus = async (electionId, status) => {
    try {
      await api.put(`/admin/elections/${electionId}/status`, { status });
      toast.success(`Election status changed to ${status}`);
      fetchStats();
    } catch {
      toast.error('Failed to change status');
    }
  };

  const deleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election?')) return;
    try {
      await api.delete(`/admin/elections/${electionId}`);
      toast.success('Election deleted');
      fetchStats();
    } catch {
      toast.error('Failed to delete election');
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/elections/${selectedElection}/candidates`, candidateForm);
      toast.success('Candidate added!');
      setShowCandidateForm(false);
      setCandidateForm({ name: '', party: '', symbol: '🗳️', manifesto: '' });
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add candidate');
    }
  };

  const exportCSV = async (electionId) => {
    try {
      const res = await api.get(`/admin/elections/${electionId}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${electionId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Manage elections, candidates, and voters</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit overflow-x-auto">
          {['overview', 'elections', 'voters'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'elections' ? '🗳️ Elections' : '👥 Voters'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '👥', label: 'Total Voters', value: stats?.totalVoters, color: 'blue' },
                { icon: '🗳️', label: 'Total Elections', value: stats?.totalElections, color: 'green' },
                { icon: '✅', label: 'Total Votes', value: stats?.totalVotes, color: 'purple' },
                { icon: '🟢', label: 'Active Elections', value: stats?.activeElections, color: 'amber' }
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className={`text-3xl font-bold text-${color}-600 mb-1`}>{value ?? 0}</div>
                  <div className="text-gray-500 text-sm">{label}</div>
                </div>
              ))}
            </div>

            {/* Recent Elections */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Elections</h2>
              {stats?.recentElections?.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No elections created yet</p>
              ) : (
                <div className="space-y-3">
                  {stats?.recentElections?.map(e => (
                    <div key={e._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{e.title}</p>
                        <p className="text-sm text-gray-400">{e.candidates?.length || 0} candidates · {e.totalVotes} votes</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        e.status === 'active' ? 'bg-green-100 text-green-700' :
                        e.status === 'ended' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{e.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'elections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Manage Elections</h2>
              <button
                onClick={() => setShowElectionForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm font-medium"
              >
                + Create Election
              </button>
            </div>

            {showElectionForm && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Election</h3>
                <form onSubmit={createElection} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={electionForm.title}
                      onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Election title"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={electionForm.description}
                      onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Election description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={electionForm.startDate}
                      onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={electionForm.endDate}
                      onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">Create</button>
                    <button type="button" onClick={() => setShowElectionForm(false)} className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {showCandidateForm && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Candidate</h3>
                <form onSubmit={addCandidate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={candidateForm.name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                    <input
                      type="text"
                      value={candidateForm.party}
                      onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symbol (Emoji)</label>
                    <input
                      type="text"
                      value={candidateForm.symbol}
                      onChange={(e) => setCandidateForm({ ...candidateForm, symbol: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manifesto</label>
                    <input
                      type="text"
                      value={candidateForm.manifesto}
                      onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700">Add Candidate</button>
                    <button type="button" onClick={() => setShowCandidateForm(false)} className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Candidates</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.recentElections?.map(election => (
                    <tr key={election._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{election.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          election.status === 'active' ? 'bg-green-100 text-green-700' :
                          election.status === 'ended' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{election.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{election.candidates?.length || 0}</td>
                      <td className="px-6 py-4 text-gray-500">{election.totalVotes}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {election.status === 'upcoming' && (
                            <button onClick={() => changeStatus(election._id, 'active')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Start</button>
                          )}
                          {election.status === 'active' && (
                            <button onClick={() => changeStatus(election._id, 'ended')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">End</button>
                          )}
                          <button
                            onClick={() => { setSelectedElection(election._id); setShowCandidateForm(true); }}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            + Candidate
                          </button>
                          <button onClick={() => exportCSV(election._id)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">CSV</button>
                          <button onClick={() => deleteElection(election._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'voters' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Registered Voters ({voters.length})</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Voter ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Votes Cast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {voters.map(voter => (
                  <tr key={voter._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{voter.name}</td>
                    <td className="px-6 py-4 text-gray-500">{voter.email}</td>
                    <td className="px-6 py-4 text-gray-500">{voter.phone}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{voter.voterID}</td>
                    <td className="px-6 py-4">{voter.isVerified ? '✅' : '❌'}</td>
                    <td className="px-6 py-4 text-gray-500">{voter.hasVoted?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
