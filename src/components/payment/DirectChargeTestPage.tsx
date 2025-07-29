import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { createChargeDirect, debugPayJPResponse } from '../../services/api';

const DirectChargeTestPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useUser();
  const [card, setCard] = useState('tok_76e202b409f3da51a0706605ac81');
  const [amount, setAmount] = useState(3500);
  const [currency, setCurrency] = useState('jpy');
  const [tenant, setTenant] = useState('');
  const [includeUserInfo, setIncludeUserInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await createChargeDirect(
        card,
        amount,
        currency,
        tenant || undefined,
        includeUserInfo ? user?.id : undefined,
        includeUserInfo ? 'guest' : undefined
      );

      if (response.success) {
        setResult(response.charge);
      } else {
        setError(response.error || 'Charge creation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDebug = async () => {
    setLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      const response = await debugPayJPResponse(card, amount);

      if (response.success) {
        setDebugResult(response.debug);
      } else {
        setError(response.error || 'Debug failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during debug');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
      <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
        {onBack && (
          <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
        )}
        <span className="text-lg font-bold flex-1 text-center text-white">Direct Charge Test</span>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Card Token
            </label>
            <input
              type="text"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
              placeholder="tok_xxx"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Amount (in yen)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
              min="100"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
            >
              <option value="jpy">JPY</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Tenant (optional, for PAY.JP Platform)
            </label>
            <input
              type="text"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white"
              placeholder="ten_xxx"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeUserInfo"
              checked={includeUserInfo}
              onChange={(e) => setIncludeUserInfo(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeUserInfo" className="text-white text-sm">
              Include user info (add points to user)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Charge...' : 'Create Charge'}
          </button>

          <button
            type="button"
            onClick={handleDebug}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Debugging...' : 'Debug Response'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded-lg">
            <h3 className="text-green-200 font-bold mb-2">Charge Created Successfully!</h3>
            {result.points_added && (
              <div className="text-green-200 mb-2">
                <p>Points Added: {result.points_added}</p>
                <p>Total Points: {result.total_points}</p>
              </div>
            )}
            <pre className="text-green-200 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {debugResult && (
          <div className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
            <h3 className="text-blue-200 font-bold mb-2">Debug Response Structure:</h3>
            <pre className="text-blue-200 text-xs overflow-auto">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <h3 className="text-blue-200 font-bold mb-2">Example Usage:</h3>
          <pre className="text-blue-200 text-xs overflow-auto">
{`// Backend (PHP)
\\Payjp\\Charge::create([
    'card' => 'tok_76e202b409f3da51a0706605ac81',
    'amount' => 3500,
    'currency' => 'jpy',
    // 'tenant' => 'ten_xxx' // PAY.JP Platformでは必須
]);

// Frontend (TypeScript)
const result = await createChargeDirect(
  'tok_76e202b409f3da51a0706605ac81',
  3500,
  'jpy'
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DirectChargeTestPage; 