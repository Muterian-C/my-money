import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/api';

export default function BalanceReconciliationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentBalance 
}) {
  const [formData, setFormData] = useState({
    new_balance: '',
    reason: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Form, 2: Review, 3: Confirmation
  const [difference, setDifference] = useState(0);
  const [calculatedNewBalance, setCalculatedNewBalance] = useState(currentBalance);

  const resetForm = () => {
    setFormData({
      new_balance: '',
      reason: '',
      reference: '',
      date: new Date().toISOString().split('T')[0],
    });
    setError('');
    setStep(1);
    setDifference(0);
    setCalculatedNewBalance(currentBalance);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Preview what the adjustment will look like
  const previewAdjustment = (newBalance) => {
    if (newBalance && !isNaN(parseFloat(newBalance))) {
      const val = parseFloat(newBalance);
      setCalculatedNewBalance(val);
      setDifference(val - currentBalance);
    } else {
      setCalculatedNewBalance(currentBalance);
      setDifference(0);
    }
  };

  const validateForm = () => {
    if (!formData.new_balance || isNaN(parseFloat(formData.new_balance))) {
      setError('Please enter a valid balance amount');
      return false;
    }

    const newBalance = parseFloat(formData.new_balance);
    if (newBalance < 0) {
      setError('Balance cannot be negative');
      return false;
    }

    if (Math.abs(newBalance - currentBalance) < 0.01) {
      setError('Balance is already correct. No adjustment needed.');
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

    try {
      const response = await API.post('/balance/reconcile', {
        new_balance: parseFloat(formData.new_balance),
        reason: formData.reason.trim(),
        reference: formData.reference.trim(),
        date: formData.date,
      });

      if (response.data.success) {
        setStep(3);
        setTimeout(() => {
          onSuccess(response.data);
          handleClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };

  const QuickReasonButtons = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {[
        'Cash withdrawal', 
        'Cash deposit', 
        'M-Pesa adjustment', 
        'Bank transfer', 
        'Found money', 
        'Forgot to record expense',
        'Correcting previous entry'
      ].map((preset) => (
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getDifferenceDisplay = () => {
    if (difference === 0) return null;
    const isPositive = difference > 0;
    return (
      <div className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isPositive ? '➕' : '➖'} {formatCurrency(Math.abs(difference))}
        <span className="text-xs text-gray-500 font-normal ml-2">
          ({isPositive ? 'Add' : 'Subtract'} from balance)
        </span>
      </div>
    );
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
                    <span>🔄</span> Reconcile Balance
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current: <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(currentBalance)}
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
              {/* Step 1: Enter New Balance */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      💡 Enter the actual balance you have in hand. 
                      The system will calculate the difference and create an adjustment record.
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* New Balance Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      What is your actual balance? (KES)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 font-semibold">KES</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 750"
                        value={formData.new_balance}
                        onChange={(e) => {
                          setFormData({ ...formData, new_balance: e.target.value });
                          previewAdjustment(e.target.value);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-semibold"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[currentBalance - 500, currentBalance - 200, currentBalance - 100, currentBalance + 100, currentBalance + 200, currentBalance + 500].map((preset) => (
                        preset > 0 && (
                          <button
                            key={preset}
                            onClick={() => {
                              setFormData({ ...formData, new_balance: preset.toString() });
                              previewAdjustment(preset.toString());
                            }}
                            className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                          >
                            {formatCurrency(preset)}
                          </button>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Preview Adjustment */}
                  {difference !== 0 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                        <span className="font-semibold">{formatCurrency(currentBalance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">New Balance</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(calculatedNewBalance)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                        {getDifferenceDisplay()}
                      </div>
                    </div>
                  )}

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
                      Why is your balance different? <span className="text-xs text-gray-500">(Required)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Withdrew cash for shopping"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <QuickReasonButtons />
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reference Number <span className="text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., M-PESA receipt number"
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
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all ${
                        difference !== 0 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                      disabled={difference === 0}
                    >
                      Review →
                    </button>
                  </div>
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
                      Review Balance Update
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                        <span className="font-semibold">{formatCurrency(currentBalance)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">New Balance</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(calculatedNewBalance)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Adjustment</span>
                        {getDifferenceDisplay()}
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
                      {loading ? 'Processing...' : 'Confirm Update'}
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
                    Balance Updated Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your balance has been reconciled.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-w-xs mx-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">New Balance</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(calculatedNewBalance)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Adjustment: {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
