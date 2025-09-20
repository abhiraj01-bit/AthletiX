# Hardware Integration Troubleshooting Guide

## Common Issues & Solutions

### 1. Arduino Not Detected
**Problem**: No COM ports showing up or Arduino not found

**Solutions**:
- Check USB cable connection
- Install Arduino drivers (usually auto-installs)
- Try different USB ports
- Check Device Manager for COM ports
- Use common ports: COM3, COM4, COM5, COM6

### 2. Connection Fails
**Problem**: "Failed to connect Arduino" error

**Solutions**:
- Close Arduino Serial Monitor if open
- Restart Arduino (unplug/plug USB)
- Try different COM port
- Check if another app is using the port
- Run as administrator

### 3. No EMG Signal
**Problem**: Connected but no muscle activity detected

**Solutions**:
- Check electrode placement (see assembly guide)
- Clean skin with alcohol before placing electrodes
- Ensure good electrode contact
- Verify wiring: VCC→5V, GND→GND, OUT→A0
- Test with Python script: `python test_arduino_connection.py`

### 4. Noisy Signal
**Problem**: EMG readings are erratic or noisy

**Solutions**:
- Improve electrode contact
- Keep electrode cables short
- Avoid movement during recording
- Check grounding electrode placement
- Adjust threshold in Arduino code

### 5. Connection Drops
**Problem**: Arduino disconnects randomly

**Solutions**:
- Check USB cable quality
- Ensure stable power supply
- Close other serial applications
- Update Arduino drivers
- Try different USB port

### 6. Build Errors
**Problem**: `serialport` module build fails

**Solutions**:
```bash
# Approve builds
pnpm approve-builds

# Or install build tools (Windows)
npm install -g windows-build-tools

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 7. Port Permission Issues (Linux/Mac)
**Problem**: Permission denied accessing serial port

**Solutions**:
```bash
# Add user to dialout group (Linux)
sudo usermod -a -G dialout $USER

# Set port permissions (Mac)
sudo chmod 666 /dev/ttyUSB0
```

## Quick Diagnostic Steps

### 1. Hardware Test
```bash
# Open Arduino Serial Monitor (9600 baud)
# Should see: "AthletiX EMG Ready"
# LED should blink 3 times on startup
# Contract muscle → LED turns ON
```

### 2. Python Test
```bash
cd hardware
python test_arduino_connection.py
# Select option 2 to monitor EMG data
```

### 3. Web App Test
```bash
# Start AthletiX
pnpm run

# Go to: http://localhost:5173/emg-connection
# Select COM port and connect
# Should see live EMG data
```

## Hardware Specifications

### Required Components
- Arduino Uno R3
- Muscle BioAmp Patchy v0.2
- 3x EMG Electrodes (Ag/AgCl)
- USB A to B cable
- 3x Jumper wires

### Wiring Diagram
```
Muscle BioAmp → Arduino Uno
VCC (Red)     → 5V
GND (Black)   → GND
OUT (White)   → A0
```

### Electrode Placement (Bicep Example)
- **Red (+)**: Center of bicep muscle
- **Black (-)**: 2-3cm away on same muscle
- **Blue (Ground)**: Elbow bone or inactive tissue

## Advanced Configuration

### Adjust Sensitivity
Edit `arduino_uno_usb_firmware.ino`:
```cpp
const int THRESHOLD = 100;  // Lower = more sensitive
```

### Change Sample Rate
```cpp
const int SAMPLE_RATE = 50;  // 50Hz (20ms intervals)
```

### Custom Port Detection
Edit `serial-emg.ts` to add your specific port:
```typescript
const commonPorts = ['COM3', 'COM4', 'COM5', 'YOUR_PORT'];
```

## Getting Help

1. **Check Arduino Serial Monitor** first
2. **Run Python test script** for diagnostics
3. **Check browser console** for JavaScript errors
4. **Verify all connections** are secure
5. **Try different COM ports** systematically

## Success Indicators

✅ Arduino LED blinks 3 times on startup
✅ Serial Monitor shows "AthletiX EMG Ready"
✅ LED turns ON when muscle contracts
✅ Web app shows "Connected" status
✅ Live EMG data updates in dashboard
✅ Real-time muscle activity percentage

Your hardware integration is working when all indicators are green!