# 🔧 Complete Hardware Setup Guide

## 📦 What You Need to Install

### 1. **Node.js Dependencies** (Already Done ✅)
```bash
# These are already installed with pnpm install
serialport: "^12.0.0"
@serialport/parser-readline: "^12.0.0"
```

### 2. **System Requirements**
- **Windows**: Arduino drivers (auto-install when plugging Arduino)
- **Arduino IDE**: For uploading firmware
- **Chrome/Edge Browser**: For web app (Firefox doesn't support some features)

## 🔌 Hardware Components
- Arduino Uno R3
- Muscle BioAmp Patchy v0.2
- 3x EMG Electrodes (Ag/AgCl)
- USB A to B cable
- 3x Jumper wires (Male-Female)

## ⚡ Quick Setup Steps

### Step 1: Arduino Firmware
```bash
# 1. Open Arduino IDE
# 2. Load: hardware/arduino_uno_usb_firmware.ino
# 3. Select: Tools > Board > Arduino Uno
# 4. Select: Tools > Port > COM3 (or your port)
# 5. Click Upload
```

### Step 2: Hardware Wiring
```
Muscle BioAmp Patchy → Arduino Uno
VCC (Red)    → 5V
GND (Black)  → GND
OUT (White)  → A0
```

### Step 3: Start AthletiX
```bash
# In project directory
pnpm approve-builds  # Approve serialport builds
pnpm run            # Start both frontend and backend
```

### Step 4: Connect in Web App
1. Open browser: `http://localhost:5173`
2. Login to AthletiX
3. Go to **EMG Dashboard** or **Arduino Setup**
4. Click **"Arduino Setup"**
5. Select your COM port (usually COM3, COM4, etc.)
6. Click **"Connect Arduino"**

## 🔄 Real-time Data Flow

```
Arduino → USB Serial → Node.js Server → HTTP API → React Frontend
   ↓         ↓            ↓              ↓           ↓
EMG Data → JSON → serialport → Express → useEMG → UI Updates
```

### Data Format:
```json
{
  "emg": 245,
  "muscleActivity": 67.2,
  "fatigue": 23.1,
  "activated": true
}
```

## 🎯 Testing Your Setup

### 1. **Arduino Test**
```bash
# Open Arduino Serial Monitor (9600 baud)
# Should see: "AthletiX EMG Ready"
# Contract muscle → LED turns ON
# Relax muscle → LED turns OFF
```

### 2. **Web App Test**
```bash
# In AthletiX web app:
# 1. Go to EMG Connection page
# 2. Select Arduino port
# 3. Click Connect
# 4. Should see live EMG data updating
```

### 3. **Electrode Placement**
```
For Bicep Monitoring:
- Red (+): Center of bicep muscle
- Black (-): 2-3cm away on same bicep
- Blue (Ground): Elbow bone or forearm
```

## 🚨 Troubleshooting

### Arduino Not Found
```bash
# Check Device Manager (Windows)
# Look for "Ports (COM & LPT)"
# Arduino should appear as COM3, COM4, etc.
```

### No EMG Signal
```bash
# 1. Check electrode placement
# 2. Clean skin with alcohol
# 3. Ensure good electrode contact
# 4. Verify wiring connections
```

### Connection Failed
```bash
# 1. Close Arduino Serial Monitor
# 2. Refresh available ports
# 3. Try different COM port
# 4. Restart Arduino (unplug/plug USB)
```

### Build Errors
```bash
# If serialport build fails:
pnpm approve-builds
# Or install build tools:
npm install -g windows-build-tools  # Windows only
```

## 📊 Features Available

### Real-time Monitoring
- ✅ Muscle activity percentage
- ✅ Fatigue level detection
- ✅ Activation status (Active/Rest)
- ✅ Live data charts
- ✅ Smart recommendations

### Integration with AthletiX
- ✅ Athletic test monitoring
- ✅ Performance analytics
- ✅ Injury prevention alerts
- ✅ Training optimization

## 🔧 Advanced Configuration

### Custom Threshold
```cpp
// In Arduino code, adjust:
const int THRESHOLD = 100;  // Change based on your muscle
```

### Sampling Rate
```cpp
// In Arduino code:
const int SAMPLE_RATE = 50;  // 50Hz (20ms intervals)
```

### Port Configuration
```javascript
// Server will auto-detect Arduino ports
// Manual override in serial-emg.ts if needed
```

## ✅ Success Checklist

- [ ] Arduino firmware uploaded successfully
- [ ] Hardware wired correctly (3 connections)
- [ ] EMG electrodes placed on muscle
- [ ] Arduino LED blinks when muscle contracts
- [ ] AthletiX web app running (`pnpm run`)
- [ ] Arduino port detected in web app
- [ ] Connection established successfully
- [ ] Live EMG data visible in dashboard
- [ ] Real-time updates working

## 🎉 You're Ready!

Once all items are checked, your Arduino EMG sensor is fully integrated with AthletiX for real-time athletic performance monitoring!

### Quick Links:
- **EMG Dashboard**: `/emg`
- **Arduino Setup**: `/emg-connection`
- **Athletic Tests**: `/tests`
- **Analytics**: `/analytics`