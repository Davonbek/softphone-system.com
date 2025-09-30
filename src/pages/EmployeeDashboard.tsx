import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import EmployeeLayout from '../components/EmployeeLayout';
import TimezoneClock from '../components/TimezoneClock';
import StatusDropdown, { StatusType } from '../components/StatusDropdown';
import IncomingCall from '../components/IncomingCall';
import ActiveCall from '../components/ActiveCall';
import ActivityLog from '../components/ActivityLog';
import Dialer from '../components/Dialer';

interface EmployeeDashboardProps {
  onSignOut: () => void;
}

interface CallLog {
  id: string;
  phone_number: string;
  call_type: 'inbound' | 'outbound';
  call_status: 'answered' | 'declined' | 'missed';
  time_received: string;
  duration_seconds: number;
}

const generateUSAPhoneNumber = (): string => {
  const areaCodes = [212, 213, 214, 215, 216, 305, 312, 323, 347, 404, 415, 469, 510, 562, 602, 619, 626, 702, 714, 718, 760, 805, 818, 832, 917];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const exchange = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `+1 ${areaCode}-${exchange}-${lineNumber}`;
};

export default function EmployeeDashboard({ onSignOut }: EmployeeDashboardProps) {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<StatusType>('available');
  const [statusDuration, setStatusDuration] = useState(0);
  const [currentStatusId, setCurrentStatusId] = useState<string | null>(null);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [incomingNumber, setIncomingNumber] = useState('');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const incomingCallTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      initializeStatus();
      fetchCallLogs();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStatus]);

  useEffect(() => {
    if (currentStatus === 'available' && !hasIncomingCall && !isOnCall) {
      const delay = Math.floor(Math.random() * 6000) + 5000;
      incomingCallTimerRef.current = setTimeout(() => {
        scheduleIncomingCall();
      }, delay);
    }

    return () => {
      if (incomingCallTimerRef.current) {
        clearTimeout(incomingCallTimerRef.current);
      }
    };
  }, [currentStatus, hasIncomingCall, isOnCall]);

  useEffect(() => {
    if (currentStatus === 'gone_home' && hasIncomingCall) {
      setHasIncomingCall(false);
    }
  }, [currentStatus, hasIncomingCall]);

  useEffect(() => {
    if (isOnCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      if (currentStatus !== 'on_call') {
        handleStatusChange('on_call');
      }
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isOnCall]);

  const scheduleIncomingCall = () => {
    const randomNumber = generateUSAPhoneNumber();
    setIncomingNumber(randomNumber);
    setHasIncomingCall(true);
  };

  const initializeStatus = async () => {
    if (!user) return;

    const { data: existingStatus } = await supabase
      .from('employee_status_log')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .maybeSingle();

    if (existingStatus) {
      setCurrentStatus(existingStatus.status as StatusType);
      setCurrentStatusId(existingStatus.id);
      const startedAt = new Date(existingStatus.started_at);
      const now = new Date();
      const durationInSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setStatusDuration(durationInSeconds);
    } else {
      createNewStatus('available');
    }
  };

  const createNewStatus = async (status: StatusType) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('employee_status_log')
      .insert({
        user_id: user.id,
        status: status,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentStatusId(data.id);
      setStatusDuration(0);
    }
  };

  const handleStatusChange = async (newStatus: StatusType) => {
    if (!user || !currentStatusId) return;

    const now = new Date().toISOString();

    await supabase
      .from('employee_status_log')
      .update({
        ended_at: now,
        duration_seconds: statusDuration,
      })
      .eq('id', currentStatusId);

    setCurrentStatus(newStatus);
    await createNewStatus(newStatus);
  };

  const fetchCallLogs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('time_received', { ascending: false })
      .limit(10);

    if (!error && data) {
      setCallLogs(data);
    }
  };

  const simulateIncomingCall = () => {
    const randomNumber = '+1 234-567-8900';
    setIncomingNumber(randomNumber);
    setHasIncomingCall(true);
  };

  const handleAnswerCall = async () => {
    if (!user) return;

    const { data, error } = await supabase.from('call_logs').insert({
      user_id: user.id,
      phone_number: incomingNumber,
      call_type: 'inbound',
      call_status: 'answered',
      time_received: new Date().toISOString(),
      duration_seconds: 0,
    }).select().single();

    if (!error && data) {
      setCurrentCallId(data.id);
    }

    setHasIncomingCall(false);
    setIsOnCall(true);
    setCallDuration(0);
    await fetchCallLogs();
  };

  const handleDeclineCall = async () => {
    if (!user) return;

    await supabase.from('call_logs').insert({
      user_id: user.id,
      phone_number: incomingNumber,
      call_type: 'inbound',
      call_status: 'declined',
      time_received: new Date().toISOString(),
      duration_seconds: 0,
    });

    setHasIncomingCall(false);
    await fetchCallLogs();
  };

  const handleEndCall = async () => {
    if (!user || !currentCallId) return;

    await supabase
      .from('call_logs')
      .update({ duration_seconds: callDuration })
      .eq('id', currentCallId);

    setIsOnCall(false);
    setCallDuration(0);
    setCurrentCallId(null);
    await handleStatusChange('after_call');
    await fetchCallLogs();
  };

  const handleOutboundCall = async (number: string) => {
    if (!user) return;

    const { data, error } = await supabase.from('call_logs').insert({
      user_id: user.id,
      phone_number: number,
      call_type: 'outbound',
      call_status: 'answered',
      time_received: new Date().toISOString(),
      duration_seconds: 0,
    }).select().single();

    if (!error && data) {
      setCurrentCallId(data.id);
      setIncomingNumber(number);
      setIsOnCall(true);
      setCallDuration(0);
    }

    await fetchCallLogs();
  };

  return (
    <EmployeeLayout onSignOut={onSignOut} canSignOut={currentStatus === 'gone_home'}>
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white py-3">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-4 gap-4">
              <TimezoneClock
                timezone="America/New_York"
                label="Eastern time"
                color="bg-teal-500"
              />
              <TimezoneClock
                timezone="America/Chicago"
                label="Central time"
                color="bg-yellow-500"
              />
              <TimezoneClock
                timezone="America/Denver"
                label="Mountain time"
                color="bg-red-400"
              />
              <TimezoneClock
                timezone="America/Los_Angeles"
                label="Pacific time"
                color="bg-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">SoftPhone System</h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-600">
                {user?.username}
              </span>
              <div className={`w-10 h-10 ${
                currentStatus === 'available' ? 'bg-green-500' :
                currentStatus === 'on_call' ? 'bg-blue-500' :
                currentStatus === 'break' ? 'bg-yellow-500' :
                currentStatus === 'lunch' ? 'bg-orange-500' :
                currentStatus === 'personal' ? 'bg-purple-500' :
                currentStatus === 'tech_issues' ? 'bg-red-500' :
                currentStatus === 'gone_home' ? 'bg-slate-500' :
                currentStatus === 'after_call' ? 'bg-pink-500' :
                currentStatus === 'out_bound' ? 'bg-amber-700' :
                'bg-green-500'
              } text-white rounded-full flex items-center justify-center font-semibold`}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6 items-start">
            <div className="col-span-2 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Interactions</h2>

              <div className="flex-1">
                {isOnCall ? (
                  <ActiveCall
                    phoneNumber={incomingNumber}
                    duration={callDuration}
                    onEndCall={handleEndCall}
                  />
                ) : hasIncomingCall ? (
                  <IncomingCall
                    phoneNumber={incomingNumber}
                    onAnswer={handleAnswerCall}
                    onDecline={handleDeclineCall}
                  />
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center h-full flex items-center justify-center">
                    <p className="text-slate-600">No active calls</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6 h-full">
              <StatusDropdown
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
                duration={statusDuration}
              />

              <div className="flex-1">
                <Dialer onCall={handleOutboundCall} />
              </div>
            </div>
          </div>

          <ActivityLog logs={callLogs} />
        </div>
      </div>
    </EmployeeLayout>
  );
}
