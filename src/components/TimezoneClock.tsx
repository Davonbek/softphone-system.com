import { useState, useEffect } from 'react';

interface TimezoneClockProps {
  timezone: string;
  label: string;
  color: string;
}

export default function TimezoneClock({ timezone, label, color }: TimezoneClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(time);
  };

  const getTimeParts = () => {
    const timeString = formatTime();
    const parts = timeString.split(' ');
    const timePart = parts[0];
    const period = parts[1];
    return { time: timePart, period };
  };

  const getDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(time).toUpperCase();
  };

  const { time: timeValue, period } = getTimeParts();

  return (
    <div className={`${color} rounded-lg overflow-hidden shadow-md`}>
      <div className="bg-white bg-opacity-20 px-3 py-1.5 text-center">
        <h3 className="text-xs font-semibold text-white">{label}</h3>
      </div>
      <div className="bg-white p-4 text-center">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-2xl font-bold text-slate-900">{timeValue}</span>
          <span className="text-sm font-medium text-slate-600">{period}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{getDate()}</p>
      </div>
    </div>
  );
}
