import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/elections/${id}`)
      .then(({ data }) => setElection(data))
      .catch(() => toast.error('Failed to load election'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/voter/vote', { electionId: id, candidateId: selected });
      setReceipt(data.receiptCode);
      setShowConfirm(false);
      toast.success('Vote cast successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Vote Cast Successfully!</h2>
          <p className="text-gray-600 mb-6">Your vote has been recorded. Here is your receipt:</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Receipt Code</p>
            <p className="font-mono text-sm text-green-800 break-all font-bold">{receipt}</p>
          </div>
          <p className="text-gray-400 text-sm mb-6">Save this code to verify your vote later.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/verify-receipt', { state: { code: receipt } })}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium"
            >
              🧾 Verify My Vote
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{election?.title}</h1>
          <p className="text-gray-500 mt-2">{election?.description}</p>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-700">Select a Candidate</h2>
          {election?.candidates?.map(candidate => (
            <div
              key={candidate._id}
              onClick={() => setSelected(candidate._id)}
              className={`bg-white rounded-2xl shadow-sm p-5 cursor-pointer border-2 transition-all ${
                selected === candidate._id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-blue-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{candidate.symbol || '🗳️'}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{candidate.name}</h3>
                  <p className="text-blue-600 font-medium">{candidate.party}</p>
                  {candidate.manifesto && <p className="text-gray-500 text-sm mt-1">{candidate.manifesto}</p>}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selected === candidate._id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selected === candidate._id && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={!selected}
          className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Vote
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold text-gray-800">Confirm Your Vote</h3>
              <p className="text-gray-500 mt-2">
                You're voting for:{' '}
                <strong>{election?.candidates?.find(c => c._id === selected)?.name}</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleVote}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Confirm Vote'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
