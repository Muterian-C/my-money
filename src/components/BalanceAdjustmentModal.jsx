import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { balanceService } from '../services/balanceService';

export default function BalanceAdjustmentModal({ isOpen, onClose, onSuccess, currentBalance }) {
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    type: 'add',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Review, 3: Confirmation
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load adjustment history
  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory]);

  const loadHistory = async () => {
    try {
      const data = await balanceService.getAdjustments(20);
      setAdjustmentHistory(data.adjustments || []);
    } catch (err) {
      console.error('Failed to load adjustment history:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      reason: '',
      type: 'add',
      reference: '',
      date: new Date().toISOString().split('T')[0],
    });
    setError('');
    setSuccess('');
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (parseFloat(formData.amount) > 10000000) {
      setError('Amount exceeds maximum limit (KES 10,000,000)');
      return false;
    }

    if (!formData.reason.trim() || formData.reason.trim().length < 3) {
      setError('Please provide a detailed reason (minimum 3 characters)');
      return false;
    }

    if (formData.reason.trim().length > 500) {
      setError('Reason is too long (maximum 500 characters)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await balanceService.adjust({
        amount: parseFloat(formData.amount),
        reason: formData.reason.trim(),
        type: formData.type,
        reference: formData.reference.trim(),
        date: formData.date,
      });

      if (response.success) {
        setSuccess(`✅ Balance ${formData.type}ed successfully!`);
        setStep(3);
        setTimeout(() => {
          onSuccess(response);
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to adjust balance');
    } finally {
      setLoading(false);
    }
  };

  const QuickReasonButtons = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {['Cash Gift', 'Refund', 'Bank Transfer', 'M-Pesa Adjustment', 'Found Money', 'Salary Advance'].map((preset) => (
        <button
          key={preset}
          onClick={() => setFormData({ ...formData, reason: preset })}
          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-105"
        >
          {preset}
        </button>
      ))}
    </div>
  );

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>💰</span> Adjust Balance
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current Balance: <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatAmount(currentBalance || 0)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Step 1: Form */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Adjustment Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Adjustment Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFormData({ ...formData, type: 'add' })}
                        className={`p-3 rounded-xl text-center transition-all ${
                          formData.type === 'add'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">➕</div>
                        <div className="text-sm font-semibold">Add Balance</div>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, type: 'subtract' })}
                        className={`p-3 rounded-xl text-center transition-all ${
                          formData.type === 'subtract'
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-2xl mb-1">➖</div>
                        <div className="text-sm font-semibold">Subtract Balance</div>
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Amount (KES)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 font-semibold">KES</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      {[500, 1000, 2000, 5000, 10000].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setFormData({ ...formData, amount: preset.toString() })}
                          className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                          {formatAmount(preset)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transaction Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reason / Justification <span className="text-xs text-gray-500">(Required)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Cash gift from family, M-Pesa adjustment"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <QuickReasonButtons />
                  </div>

                  {/* Reference (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reference Number <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., M-PESA: B2C3X4Y5Z"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (validateForm()) setStep(2);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Review →
                    </button>
                  </div>

                  {/* View History Link */}
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full text-center text-xs text-gray-500 hover:text-emerald-600 transition-all"
                  >
                    {showHistory ? '▲ Hide History' : '▼ View Adjustment History'}
                  </button>

                  {/* Adjustment History */}
                  {showHistory && (
                    <div className="mt-4 max-h-60 overflow-y-auto">
                      {adjustmentHistory.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-4">No adjustment history</p>
                      ) : (
                        <div className="space-y-2">
                          {adjustmentHistory.map((adj, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {adj.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {adj.note}
                                  </div>
                                </div>
                                <div className={`text-sm font-semibold ${
                                  adj.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                  {adj.amount > 0 ? '+' : ''}{formatAmount(adj.amount)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {adj.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-center">
                      Review Adjustment
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Type</span>
                        <span className={`font-semibold ${
                          formData.type === 'add' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {formData.type === 'add' ? 'Add Balance' : 'Subtract Balance'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatAmount(formData.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Reason</span>
                        <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">
                          {formData.reason}
                        </span>
                      </div>
                      {formData.reference && (
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Reference</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formData.reference}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Date</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(formData.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        ⚠️ {error}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Confirm Adjustment'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Adjustment Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your balance has been updated successfully.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
