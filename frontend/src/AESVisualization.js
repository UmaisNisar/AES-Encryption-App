import React, { useState, useEffect } from 'react';

const AESVisualization = ({ steps, onClose, isOpen, autoPlay = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isOpen || !steps || steps.length === 0) return;
    setCurrentStep(0);
  }, [isOpen, steps]);

  useEffect(() => {
    if (isPlaying && steps && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      }, 2000); // Auto-advance every 2 seconds
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps]);

  if (!isOpen || !steps || steps.length === 0) return null;

  const step = steps[currentStep] || {};
  const colorClasses = {
    blue: 'border-cyan-400 bg-cyan-500/10 text-cyan-300',
    purple: 'border-purple-400 bg-purple-500/10 text-purple-300',
    green: 'border-green-400 bg-green-500/10 text-green-300',
    red: 'border-red-400 bg-red-500/10 text-red-300',
    gray: 'border-gray-400 bg-gray-500/10 text-gray-300',
    cyan: 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
  };

  const getColorGlow = (color) => {
    const glows = {
      blue: 'shadow-cyan-500/50',
      purple: 'shadow-purple-500/50',
      green: 'shadow-green-500/50',
      red: 'shadow-red-500/50',
      gray: 'shadow-gray-500/50',
      cyan: 'shadow-cyan-500/70'
    };
    return glows[color] || 'shadow-cyan-500/50';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              🔐 Step inside AES — where data dances through rounds of encryption ✨
            </h2>
            <p className="text-sm text-gray-400 font-mono">
              Round {step.round || 0} of {steps[steps.length - 1]?.round || 10} | Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 rounded-full hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Current Step Info */}
        <div className={`mb-6 p-6 rounded-xl border-2 ${colorClasses[step.color || 'gray']} ${getColorGlow(step.color || 'gray')} shadow-lg transition-all duration-300`}>
          <h3 className="text-2xl font-bold mb-2">{step.operation || 'Processing...'}</h3>
          <p className="text-sm opacity-80">{step.description || ''}</p>
        </div>

        {/* State Matrix */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">State Matrix (4×4)</h4>
          <div className="grid grid-cols-4 gap-2">
            {step.state && step.state.map((row, rowIndex) =>
              row.map((byte, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    p-4 rounded-lg font-mono text-sm text-center
                    ${colorClasses[step.color]}
                    border-2
                    transition-all duration-500
                    hover:scale-110 hover:shadow-lg
                    animate-pulse
                  `}
                  style={{
                    animationDelay: `${(rowIndex * 4 + colIndex) * 50}ms`
                  }}
                >
                  {byte.toUpperCase()}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
              } hover:scale-105`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>

          <button
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
          >
            Next →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Start</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            <span>Ciphertext</span>
          </div>
        </div>

        {/* Step List (Mini Overview) */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">All Steps:</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setIsPlaying(false);
                }}
                className={`
                  px-3 py-1 rounded-lg text-xs font-mono transition-all
                  ${currentStep === idx 
                    ? `${colorClasses[s.color]} border-2 font-bold scale-110` 
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {s.operation.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AESVisualization;

