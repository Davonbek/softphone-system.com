import { Phone, PhoneOff } from 'lucide-react';

interface IncomingCallProps {
  phoneNumber: string;
  onAnswer: () => void;
  onDecline: () => void;
}

export default function IncomingCall({ phoneNumber, onAnswer, onDecline }: IncomingCallProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 h-full flex flex-col justify-between">
      <div className="text-center">
        <div className="inline-block p-4 bg-green-100 rounded-full mb-4 animate-pulse">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-2">{phoneNumber}</h3>
        <p className="text-slate-600">Incoming call...</p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onDecline}
          className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <PhoneOff className="w-5 h-5" />
          Decline
        </button>
        <button
          onClick={onAnswer}
          className="flex-1 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          Answer
        </button>
      </div>
    </div>
  );
}
