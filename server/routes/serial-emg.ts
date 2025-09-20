import { Request, Response } from 'express';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

let serialPort: SerialPort | null = null;
let emgData: any = {};
let isConnected = false;

export const connectArduino = async (req: Request, res: Response) => {
  try {
    const { port } = req.body;
    
    // Close existing connection
    if (serialPort && serialPort.isOpen) {
      await serialPort.close();
      isConnected = false;
    }
    
    serialPort = new SerialPort({
      path: port,
      baudRate: 9600
    });
    
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
    
    parser.on('data', (data: string) => {
      try {
        const cleanData = data.trim();
        if (cleanData.startsWith('{')) {
          emgData = JSON.parse(cleanData);
          emgData.timestamp = Date.now();
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    });
    
    serialPort.on('open', () => {
      isConnected = true;
      console.log(`Arduino connected on ${port}`);
      // Wait for Arduino to initialize, then request data
      setTimeout(() => {
        if (serialPort && serialPort.isOpen) {
          serialPort.write('STATUS\n');
        }
      }, 2000);
    });
    
    serialPort.on('error', (err) => {
      console.error('Serial error:', err);
      isConnected = false;
    });
    
    serialPort.on('close', () => {
      console.log('Arduino disconnected');
      isConnected = false;
    });
    
    res.json({ success: true, message: 'Arduino connected' });
  } catch (error) {
    console.error('Arduino connection error:', error);
    isConnected = false;
    res.status(500).json({ error: 'Failed to connect Arduino' });
  }
};

export const getEMGData = async (req: Request, res: Response) => {
  if (!isConnected || !serialPort?.isOpen) {
    return res.json({ success: false, error: 'Arduino not connected' });
  }
  res.json({ success: true, data: emgData, connected: isConnected });
};

export const listSerialPorts = async (req: Request, res: Response) => {
  try {
    const ports = await SerialPort.list();
    
    // Filter for likely Arduino ports and add common ones
    const arduinoPorts = ports.filter(port => 
      port.manufacturer?.includes('Arduino') ||
      port.manufacturer?.includes('CH340') ||
      port.manufacturer?.includes('FTDI') ||
      port.path.includes('COM')
    );
    
    // Add common COM ports even if not detected
    const commonPorts = ['COM3', 'COM4', 'COM5', 'COM6'];
    commonPorts.forEach(comPort => {
      if (!arduinoPorts.find(p => p.path === comPort)) {
        arduinoPorts.push({
          path: comPort,
          manufacturer: 'Arduino (Common)',
          serialNumber: 'Unknown',
          vendorId: 'Unknown',
          productId: 'Unknown'
        });
      }
    });
    
    const allPorts = arduinoPorts.map(port => ({
      path: port.path,
      manufacturer: port.manufacturer || 'Unknown',
      serialNumber: port.serialNumber || 'Unknown',
      vendorId: port.vendorId || 'Unknown',
      productId: port.productId || 'Unknown'
    }));
    
    res.json({ success: true, ports: allPorts });
  } catch (error) {
    console.error('Serial port error:', error);
    res.status(500).json({ error: 'Failed to list ports' });
  }
};

// Add disconnect endpoint
export const disconnectArduino = async (req: Request, res: Response) => {
  try {
    if (serialPort) {
      if (serialPort.isOpen) {
        await serialPort.close();
      }
      serialPort.removeAllListeners();
      serialPort = null;
    }
    isConnected = false;
    emgData = {};
    console.log('Arduino fully disconnected - no more data');
    res.json({ success: true, message: 'Arduino disconnected' });
  } catch (error) {
    console.error('Disconnect error:', error);
    serialPort = null;
    isConnected = false;
    emgData = {};
    res.json({ success: true, message: 'Arduino force disconnected' });
  }
};

// Add connection status endpoint
export const getConnectionStatus = async (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    connected: isConnected && serialPort?.isOpen,
    port: serialPort?.path || null
  });
};