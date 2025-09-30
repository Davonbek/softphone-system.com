import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export type StatusType = 'available' | 'break' | 'lunch' | 'personal' | 'tech_issues' | 'gone_home' | 'after_call' | 'out_bound' | 'on_call';

interface StatusOption {
  id: StatusType;
  label: string;
  color: string;
  textColor: string;
  dropdownTextColor: string;
}

interface StatusDropdownProps {
  currentStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
  duration: number;
}

const statusOptions: StatusOption[] = [
  { id: 'available', label: 'Available', color: 'bg-green-500', textColor: 'text-white', dropdownTextColor: 'text-green-500' },
  { id: 'on_call', label: 'On Call', color: 'bg-blue-500', textColor: 'text-white', dropdownTextColor: 'text-blue-500' },
  { id: 'break', label: 'Break', color: 'bg-yellow-500', textColor: 'text-white', dropdownTextColor: 'text-yellow-500' },
  { id: 'lunch', label: 'Lunch', color: 'bg-orange-500', textColor: 'text-white', dropdownTextColor: 'text-orange-500' },
  { id: 'personal', label: 'Personal Time', color: 'bg-purple-500', textColor: 'text-white', dropdownTextColor: 'text-purple-500' },
  { id: 'tech_issues', label: 'Tech Issues', color: 'bg-red-500', textColor: 'text-white', dropdownTextColor: 'text-red-500' },
  { id: 'gone_home', label: 'Gone Home', color: 'bg-slate-500', textColor: 'text-white', dropdownTextColor: 'text-slate-500' },
  { id: 'after_call', label: 'After Call Work', color: 'bg-pink-500', textColor: 'text-white', dropdownTextColor: 'text-pink-500' },
  { id: 'out_bound', label: 'Out Bound', color: 'bg-amber-700', textColor: 'text-white', dropdownTextColor: 'text-amber-700' },
];

export default function StatusDropdown({ currentStatus, onStatusChange, duration }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = statusOptions.find(opt => opt.id === currentStatus) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStatusSelect = (status: StatusType) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${currentOption.color} ${currentOption.textColor} w-full px-6 py-4 rounded-xl shadow-lg font-bold text-lg flex items-center justify-between hover:opacity-90 transition-colors`}
      >
        <span className="flex items-center gap-3">
          {currentOption.label}
          <span className="text-sm font-mono">{formatDuration(duration)}</span>
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-slate-200">
          {statusOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleStatusSelect(option.id)}
              className={`w-full px-6 py-4 text-left font-semibold transition-colors bg-white ${option.dropdownTextColor} hover:bg-slate-50`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}