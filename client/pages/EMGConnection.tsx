import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEMG } from '@/hooks/useEMG';
import { Usb, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EMGConnection() {
  const { device, availablePorts, connectDevice, disconnectDevice, isConnecting, getAvailablePorts, emgData } = useEMG();
  const [selectedPort, setSelectedPort] = useState<string>('');

  useEffect(() => {
    getAvailablePorts();
  }, [getAvailablePorts]);

  const handleConnect = async () => {
    if (selectedPort) {
      try {
        await connectDevice(selectedPort);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Arduino EMG Connection</h1>
        <p className="text-muted-foreground">Connect your Arduino Uno EMG sensor for real-time monitoring</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Usb className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {device.connected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Connected to {device.port}</div>
                    <div className="text-sm text-muted-foreground">Arduino EMG sensor is active</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Not Connected</div>
                    <div className="text-sm text-muted-foreground">Select a port and connect your Arduino</div>
                  </div>
                </>
              )}
            </div>
            <Badge variant={device.connected ? 'default' : 'secondary'}>
              {device.connected ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Port Selection */}
      {!device.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Select Arduino Port</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedPort} onValueChange={setSelectedPort}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select COM port" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COM5">COM5 - Arduino Uno</SelectItem>
                  <SelectItem value="COM3">COM3 - Arduino</SelectItem>
                  <SelectItem value="COM4">COM4 - Arduino</SelectItem>
                  {availablePorts.map((port) => (
                    <SelectItem key={port.path} value={port.path}>
                      {port.path} - {port.manufacturer || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={getAvailablePorts}
                size="icon"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {availablePorts.length === 0 && (
              <div className="text-sm text-muted-foreground p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                No Arduino ports found. Make sure your Arduino is connected via USB.
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleConnect}
                disabled={!selectedPort || isConnecting}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : 'Connect Arduino'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live EMG Data */}
      {device.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live EMG Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{emgData.muscleActivity.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Activity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{emgData.fatigue.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Fatigue</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${emgData.activated ? 'text-green-500' : 'text-gray-500'}`}>
                  {emgData.activated ? 'ACTIVE' : 'REST'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">LIVE</div>
                <div className="text-sm text-muted-foreground">Signal</div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button asChild>
                <Link to="/emg">View Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={disconnectDevice}>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</div>
              <div>Upload <code>arduino_uno_usb_firmware.ino</code> to your Arduino Uno</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</div>
              <div>Wire Muscle BioAmp Patchy: VCC→5V, GND→GND, OUT→A0</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</div>
              <div>Connect Arduino to computer via USB cable</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">4</div>
              <div>Place EMG electrodes on muscle and select port above</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}