import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Results = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchResults = async () => {
    try {
      const { data: resData } = await api.get(`/elections/${id}/results`);
      setData(resData);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');
    socketRef.current.on('voteUpdate', ({ electionId }) => {
      if (electionId === id) fetchResults();
    });
    return () => socketRef.current?.disconnect();
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return <div className="text-center py-20 text-gray-400">No data available</div>;

  const { election, results, winner } = data;
  const labels = results.map(c => c.name);
  const votes = results.map(c => c.voteCount);
  const total = votes.reduce((a, b) => a + b, 0);

  const barData = {
    labels,
    datasets: [{
      label: 'Votes',
      data: votes,
      backgroundColor: COLORS.slice(0, labels.length),
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  const pieData = {
    labels,
    datasets: [{
      data: votes,
      backgroundColor: COLORS.slice(0, labels.length),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{election.title}</h1>
          <p className="text-gray-500 mt-2">{election.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              election.status === 'active' ? 'bg-green-100 text-green-700' :
              election.status === 'ended' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {election.status?.toUpperCase()}
            </span>
            <span className="text-gray-500">Total Votes: <strong>{total}</strong></span>
          </div>
        </div>

        {/* Winner */}
        {winner && election.status === 'ended' && (
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <p className="text-yellow-100 text-sm font-medium">Winner</p>
                <h2 className="text-2xl font-bold">{winner.name}</h2>
                <p className="text-yellow-100">{winner.party} — {winner.voteCount} votes</p>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {results.map((candidate, i) => (
            <div key={candidate._id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{candidate.symbol || '🗳️'}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{candidate.name}</h3>
                  <p className="text-sm text-blue-600">{candidate.party}</p>
                </div>
                {i === 0 && election.status === 'ended' && <span className="ml-auto text-2xl">🥇</span>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-800">{candidate.voteCount} votes</span>
                <span className="text-gray-400">{total > 0 ? ((candidate.voteCount / total) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="mt-2 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: total > 0 ? `${(candidate.voteCount / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Vote Distribution (Bar)</h3>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Vote Percentage (Pie)</h3>
              <Pie data={pieData} options={{ responsive: true }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
