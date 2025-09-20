import { useState, useEffect, useCallback, useRef } from 'react';

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

export const useEMG = () => {
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectDevice = useCallback(async (port?: string) => {
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
      
    } catch (error) {
      console.error('Failed to connect to Arduino:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [availablePorts]);

  const disconnectDevice = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
  }, []);

  const getAvailablePorts = useCallback(async () => {
    try {
      const response = await fetch('/api/serial-emg/ports');
      const result = await response.json();
      if (result.success) {
        setAvailablePorts(result.ports);
      }
    } catch (error) {
      console.error('Failed to get serial ports:', error);
    }
  }, []);

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
              const updated = [...prev, newData].slice(-50); // Keep last 50 readings
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
  }, [getAvailablePorts]);

  const saveEMGReading = useCallback(async (testId: string) => {
    if (!device.connected) return;

    try {
      const response = await fetch('/api/emg/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          emgData,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save EMG data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving EMG data:', error);
      throw error;
    }
  }, [device.connected, emgData]);

  return {
    emgData,
    emgHistory,
    device,
    isConnecting,
    availablePorts,
    connectDevice,
    disconnectDevice,
    saveEMGReading,
    getAvailablePorts
  };
};