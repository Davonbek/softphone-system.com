import { useState } from 'react';
import { Phone, ChevronDown, Delete } from 'lucide-react';

interface DialerProps {
  onCall: (number: string) => void;
}

export default function Dialer({ onCall }: DialerProps) {
  const [number, setNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleNumberClick = (digit: string) => {
    if (digit === 'backspace') {
      setNumber(prev => prev.slice(0, -1));
    } else {
      setNumber(prev => prev + digit);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 1) return `+${cleaned}`;
    if (cleaned.length <= 4) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)})-${cleaned.slice(4)}`;
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)})-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleClear = () => {
    setNumber('');
  };

  const handleCall = () => {
    if (number.trim()) {
      onCall(number);
      setNumber('');
    }
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '+', '0', 'backspace'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <h3 className="text-xl font-bold text-slate-900">Dialer</h3>
        <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-6 pt-0 flex-1 flex flex-col">
          <input
            type="text"
            value={formatPhoneNumber(number)}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '');
              setNumber(cleaned);
            }}
            placeholder="+1 (234)-567-8900"
            className="w-full px-4 py-3 border-2 border-slate-900 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-center text-lg mb-4"
          />

          <div className="grid grid-cols-3 gap-3 mb-4">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => handleNumberClick(btn)}
                className="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center"
              >
                {btn === 'backspace' ? <Delete className="w-5 h-5" /> : btn}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-semibold"
            >
              Clear
            </button>
            <button
              onClick={handleCall}
              disabled={!number.trim()}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-5 h-5" />
              Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
