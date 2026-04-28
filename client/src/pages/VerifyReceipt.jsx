import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';

const VerifyReceipt = () => {
  const location = useLocation();
  const [code, setCode] = useState(location.state?.code || '');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReceipt(null);
    setNotFound(false);
    try {
      const { data } = await api.get(`/voter/receipt/${code.trim()}`);
      setReceipt(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(err.response?.data?.message || 'Failed to verify receipt');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧾</div>
            <h2 className="text-3xl font-bold text-gray-800">Verify Your Vote</h2>
            <p className="text-gray-500 mt-2">Enter your receipt code to verify your vote was recorded</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="Paste your receipt code here"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-lg"
            >
              {loading ? 'Verifying...' : 'Verify Receipt'}
            </button>
          </form>

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {notFound && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">❌</div>
              <p className="text-red-700 font-medium">Receipt not found</p>
              <p className="text-red-500 text-sm mt-1">The code you entered does not match any recorded vote.</p>
            </div>
          )}

          {receipt && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">✅</div>
                <div>
                  <p className="font-bold text-green-700 text-lg">Vote Verified!</p>
                  <p className="text-green-600 text-sm">Your vote has been recorded in the system.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-green-100">
                  <span className="text-gray-500 font-medium">Election</span>
                  <span className="text-gray-800 font-semibold">{receipt.electionId?.title || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-100">
                  <span className="text-gray-500 font-medium">Candidate</span>
                  <span className="text-gray-800 font-semibold">{receipt.candidateId?.name || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-100">
                  <span className="text-gray-500 font-medium">Party</span>
                  <span className="text-gray-800">{receipt.candidateId?.party || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-100">
                  <span className="text-gray-500 font-medium">Timestamp</span>
                  <span className="text-gray-800">{new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 font-medium">Receipt Code</span>
                  <span className="text-gray-600 font-mono text-xs break-all max-w-xs text-right">{receipt.receiptCode}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyReceipt;
