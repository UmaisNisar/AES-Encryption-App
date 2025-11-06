import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import AESVisualization from './AESVisualization';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [keySize, setKeySize] = useState(128);
  const [mode, setMode] = useState('CBC');
  const [ciphertext, setCiphertext] = useState('');
  const [iv, setIv] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [encryptionTime, setEncryptionTime] = useState(null);
  const [decryptionTime, setDecryptionTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visualizationSteps, setVisualizationSteps] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const generateKey = () => {
    const keyLength = keySize / 8;
    const randomBytes = new Uint8Array(keyLength);
    crypto.getRandomValues(randomBytes);
    const keyBase64 = btoa(String.fromCharCode(...randomBytes));
    setKey(keyBase64);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleEncrypt = async () => {
    if (!plaintext || !key) {
      setError('Please enter plaintext and key');
      return;
    }

    setLoading(true);
    setError('');
    setCiphertext('');
    setIv('');
    setDecryptionTime(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/encrypt`, {
        plaintext,
        key,
        key_size: keySize,
        mode,
      });

      setCiphertext(response.data.ciphertext);
      setIv(response.data.iv || '');
      setEncryptionTime(response.data.execution_time_ms.toFixed(2));
    } catch (err) {
      console.error('Encryption error:', err);
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('❌ Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000');
      } else if (err.response?.data?.detail) {
        setError(`❌ ${err.response.data.detail}`);
      } else if (err.message) {
        setError(`❌ Encryption failed: ${err.message}`);
      } else {
        setError('❌ Encryption failed. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext || !key) {
      setError('Please ensure ciphertext and key are available');
      return;
    }

    setLoading(true);
    setError('');
    setDecryptedText('');

    try {
      const response = await axios.post(`${API_BASE_URL}/decrypt`, {
        ciphertext,
        key,
        key_size: keySize,
        mode,
        iv: iv || null,
      });

      setDecryptedText(response.data.plaintext);
      setDecryptionTime(response.data.execution_time_ms.toFixed(2));
    } catch (err) {
      console.error('Decryption error:', err);
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('❌ Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000');
      } else if (err.response?.data?.detail) {
        setError(`❌ ${err.response.data.detail}`);
      } else if (err.message) {
        setError(`❌ Decryption failed: ${err.message}`);
      } else {
        setError('❌ Decryption failed. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!plaintext || !key) {
      setError('Please enter plaintext and key to visualize');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/visualize`, {
        plaintext,
        key,
        key_size: keySize,
      });

      setVisualizationSteps(response.data.steps);
      setShowVisualization(true);
    } catch (err) {
      console.error('Visualization error:', err);
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('❌ Cannot connect to backend server for visualization.');
      } else if (err.response?.data?.detail) {
        setError(`❌ ${err.response.data.detail}`);
      } else {
        setError('❌ Visualization failed. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    const results = {
      plaintext,
      ciphertext,
      key: key.substring(0, 20) + '...',
      key_size: keySize,
      mode,
      iv: iv || null,
      encryption_time_ms: encryptionTime,
      decryption_time_ms: decryptionTime,
      decrypted_text: decryptedText,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aes-encryption-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AES Encryption Demo
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-full ${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-yellow-400'} hover:scale-110 transition-transform`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Implementation and Demonstration of AES Encryption and Decryption
          </p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Configuration Panel */}
          <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              ⚙️ Configuration
            </h2>
            
            {/* Key Size */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Key Size (bits)
              </label>
              <div className="flex gap-2">
                {[128, 192, 256].map((size) => (
                  <button
                    key={size}
                    onClick={() => setKeySize(size)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      keySize === size
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Encryption Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Encryption Mode
              </label>
              <div className="flex gap-2">
                {['CBC', 'GCM', 'ECB'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      mode === m
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                AES Key (Base64)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter or generate a key"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={generateKey}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Plaintext Input */}
          <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              📝 Plaintext
            </h2>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter text to encrypt..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {plaintext.length} characters
              </span>
              {plaintext && (
                <button
                  onClick={() => copyToClipboard(plaintext)}
                  className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <button
            onClick={handleEncrypt}
            disabled={loading || !plaintext || !key}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '⏳ Encrypting...' : '🔒 Encrypt'}
          </button>
          <button
            onClick={handleDecrypt}
            disabled={loading || !ciphertext || !key}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '⏳ Decrypting...' : '🔓 Decrypt'}
          </button>
          <button
            onClick={handleVisualize}
            disabled={loading || !plaintext || !key}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 via-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-pulse"
          >
            {loading ? '⏳ Loading...' : '✨ Visualize AES'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Ciphertext */}
          <div className="glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              🔐 Ciphertext
            </h2>
            {ciphertext ? (
              <>
                <textarea
                  value={ciphertext}
                  readOnly
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {encryptionTime && `⏱️ ${encryptionTime} ms`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(ciphertext)}
                    className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                {iv && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                      IV (Initialization Vector)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={iv}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(iv)}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Encrypted text will appear here
              </p>
            )}
          </div>

          {/* Decrypted Text */}
          <div className="glass rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              ✨ Decrypted Text
            </h2>
            {decryptedText ? (
              <>
                <textarea
                  value={decryptedText}
                  readOnly
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {decryptionTime && `⏱️ ${decryptionTime} ms`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(decryptedText)}
                    className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
                {decryptedText === plaintext && (
                  <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg text-sm text-center">
                    ✅ Decryption successful! Text matches original.
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Decrypted text will appear here
              </p>
            )}
          </div>
        </div>

        {/* Download Button */}
        {(ciphertext || decryptedText) && (
          <div className="text-center">
            <button
              onClick={downloadResults}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              💾 Download Results (JSON)
            </button>
          </div>
        )}

        {/* Made by Group 2 Footer */}
        <footer className="mt-16 mb-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Group 2 Card */}
            <div className="glass rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-400/30 dark:hover:border-purple-500/30 group">
              {/* Header with Icon */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl animate-pulse-slow">🔐</span>
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Made with encrypted love by Group 2
                </h3>
                <span className="text-2xl">💻✨</span>
              </div>

              {/* Tagline */}
              <p className="text-lg md:text-xl text-center mb-6 text-gray-700 dark:text-gray-300 font-medium">
                Encrypting vibes, one byte at a time 💾✨
              </p>

              {/* Group Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Member Card 1 */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 hover:scale-105 transition-transform duration-200 border border-purple-200 dark:border-purple-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Umais Nisar</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: 0448650</p>
                </div>

                {/* Member Card 2 */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 hover:scale-105 transition-transform duration-200 border border-pink-200 dark:border-pink-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Muhammad Shaheryar Khalid</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: 0446240</p>
                </div>

                {/* Member Card 3 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 hover:scale-105 transition-transform duration-200 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Amna Kulsoom</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: 0464475</p>
                </div>

                {/* Member Card 4 */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 hover:scale-105 transition-transform duration-200 border border-indigo-200 dark:border-indigo-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Md Mohiuddin Chowdhury</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: 0448304</p>
                </div>

                {/* Member Card 5 */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-4 hover:scale-105 transition-transform duration-200 border border-rose-200 dark:border-rose-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Pooja Painter</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: 0466870</p>
                </div>
              </div>

              {/* Bottom Line */}
              <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                  Data safe. Vibes encrypted. © 2025 Group 2. ⚡
                </p>
              </div>
            </div>

            {/* Deployment Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 dark:border-purple-500/20">
              <p className="text-sm text-center font-semibold text-blue-600 dark:text-purple-400 mb-2">
                🚀 Deployed by Group 2 🚀
              </p>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Powered by React, FastAPI & Cryptography 🔒 | Live on Vercel & Render
              </p>
            </div>
          </div>
        </footer>

        {/* AES Visualization Modal */}
        {showVisualization && visualizationSteps && (
          <AESVisualization
            steps={visualizationSteps}
            onClose={() => setShowVisualization(false)}
            isOpen={showVisualization}
            autoPlay={false}
          />
        )}
      </div>
    </div>
  );
}

export default App;

