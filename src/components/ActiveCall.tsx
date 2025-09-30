import { useState } from 'react';
import { Mic, MicOff, Pause, Play, PhoneOff } from 'lucide-react';

interface ActiveCallProps {
  phoneNumber: string;
  duration: number;
  onEndCall: () => void;
}

export default function ActiveCall({ phoneNumber, duration, onEndCall }: ActiveCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleHold = () => {
    setIsOnHold(!isOnHold);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 h-full flex flex-col justify-between">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-slate-900 mb-2">{phoneNumber}</h3>
        <p className="text-2xl font-mono text-slate-600">{formatDuration(duration)}</p>
        {isOnHold && (
          <p className="text-orange-500 font-semibold mt-2">On Hold</p>
        )}
      </div>

      <div>
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={toggleHold}
            className={`p-4 rounded-full transition-colors ${
              isOnHold
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isOnHold ? 'Resume' : 'Hold'}
          >
            {isOnHold ? (
              <Play className="w-6 h-6" />
            ) : (
              <Pause className="w-6 h-6" />
            )}
          </button>
        </div>

        <button
          onClick={onEndCall}
          className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </button>
      </div>
    </div>
  );
}
