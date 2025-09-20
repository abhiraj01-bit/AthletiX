import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export interface EMGData {
  emg: number;
  muscleActivity: number;
  fatigue: number;
  activated: boolean;
  timestamp: number;
}

export interface EMGDevice {
  connected: boolean;
  port: string | null;
  type: 'bluetooth' | 'usb';
}

export interface EMGAnalysis {
  avgMuscleActivity: number;
  avgFatigue: number;
  maxMuscleActivity: number;
  maxFatigue: number;
  totalActiveTime: number;
  totalSessionTime: number;
  activationRate: number;
  dataPoints: number;
}

interface EMGContextType {
  emgData: EMGData;
  emgHistory: EMGData[];
  device: EMGDevice;
  isConnecting: boolean;
  availablePorts: any[];
  sessionAnalysis: EMGAnalysis | null;
  connectDevice: (port?: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  getAvailablePorts: () => Promise<void>;
  clearAnalysis: () => void;
}

const EMGContext = createContext<EMGContextType | undefined>(undefined);

export const useEMG = () => {
  const context = useContext(EMGContext);
  if (!context) {
    throw new Error('useEMG must be used within EMGProvider');
  }
  return context;
};

interface EMGProviderProps {
  children: ReactNode;
}

export const EMGProvider: React.FC<EMGProviderProps> = ({ children }) => {
  const [emgData, setEmgData] = useState<EMGData>({
    emg: 0,
    muscleActivity: 0,
    fatigue: 0,
    activated: false,
    timestamp: Date.now()
  });
  
  const [emgHistory, setEmgHistory] = useState<EMGData[]>([]);
  const [device, setDevice] = useState<EMGDevice>({
    connected: false,
    port: null,
    type: 'usb'
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [availablePorts, setAvailablePorts] = useState<any[]>([]);
  const [sessionAnalysis, setSessionAnalysis] = useState<EMGAnalysis | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  const connectDevice = async (port?: string) => {
    setIsConnecting(true);
    
    try {
      const response = await fetch('/api/serial-emg/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: port || availablePorts[0]?.path })
      });
      
      if (!response.ok) throw new Error('Failed to connect');
      
      setDevice({
        connected: true,
        port: port || availablePorts[0]?.path || null,
        type: 'usb'
      });
      
      sessionStartRef.current = Date.now();
      setEmgHistory([]);
      setSessionAnalysis(null);
      
    } catch (error) {
      console.error('Failed to connect to Arduino:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const calculateAnalysis = (history: EMGData[]): EMGAnalysis => {
    if (history.length === 0) {
      return {
        avgMuscleActivity: 0,
        avgFatigue: 0,
        maxMuscleActivity: 0,
        maxFatigue: 0,
        totalActiveTime: 0,
        totalSessionTime: 0,
        activationRate: 0,
        dataPoints: 0
      };
    }

    const totalActivity = history.reduce((sum, data) => sum + data.muscleActivity, 0);
    const totalFatigue = history.reduce((sum, data) => sum + data.fatigue, 0);
    const activeCount = history.filter(data => data.activated).length;
    const maxActivity = Math.max(...history.map(data => data.muscleActivity));
    const maxFatigue = Math.max(...history.map(data => data.fatigue));
    
    const sessionTime = sessionStartRef.current ? 
      (Date.now() - sessionStartRef.current) / 1000 : 0;
    const activeTime = (activeCount / history.length) * sessionTime;

    return {
      avgMuscleActivity: totalActivity / history.length,
      avgFatigue: totalFatigue / history.length,
      maxMuscleActivity: maxActivity,
      maxFatigue: maxFatigue,
      totalActiveTime: activeTime,
      totalSessionTime: sessionTime,
      activationRate: (activeCount / history.length) * 100,
      dataPoints: history.length
    };
  };

  const disconnectDevice = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Calculate final analysis
    if (emgHistory.length > 0) {
      const analysis = calculateAnalysis(emgHistory);
      setSessionAnalysis(analysis);
    }
    
    try {
      await fetch('/api/serial-emg/disconnect', { method: 'POST' });
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
    
    setDevice({
      connected: false,
      port: null,
      type: 'usb'
    });
  };

  const getAvailablePorts = async () => {
    try {
      const response = await fetch('/api/serial-emg/ports');
      const result = await response.json();
      if (result.success) {
        setAvailablePorts(result.ports);
      }
    } catch (error) {
      console.error('Failed to get serial ports:', error);
    }
  };

  const clearAnalysis = () => {
    setSessionAnalysis(null);
  };

  // Start polling when connected
  useEffect(() => {
    if (device.connected && !intervalRef.current) {
      intervalRef.current = setInterval(async () => {
        try {
          const response = await fetch('/api/serial-emg/data');
          const result = await response.json();
          
          if (result.success && result.data) {
            const newData: EMGData = {
              emg: result.data.emg || 0,
              muscleActivity: result.data.muscleActivity || 0,
              fatigue: result.data.fatigue || 0,
              activated: result.data.activated || false,
              timestamp: result.data.timestamp || Date.now()
            };
            
            setEmgData(newData);
            setEmgHistory(prev => {
              const updated = [...prev, newData].slice(-200); // Keep last 200 readings
              return updated;
            });
          }
        } catch (error) {
          console.error('EMG polling error:', error);
        }
      }, 100); // 10Hz polling
    } else if (!device.connected && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [device.connected]);

  useEffect(() => {
    getAvailablePorts();
  }, []);

  return (
    <EMGContext.Provider value={{
      emgData,
      emgHistory,
      device,
      isConnecting,
      availablePorts,
      sessionAnalysis,
      connectDevice,
      disconnectDevice,
      getAvailablePorts,
      clearAnalysis
    }}>
      {children}
    </EMGContext.Provider>
  );
};