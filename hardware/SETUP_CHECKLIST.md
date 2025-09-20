# AthletiX EMG Setup Checklist

## ✅ Hardware Setup

### Components Needed:
- [ ] Arduino Uno R3
- [ ] Muscle BioAmp Patchy v0.2
- [ ] HC-05 Bluetooth Module
- [ ] 3x EMG Electrodes (Ag/AgCl)
- [ ] Jumper wires
- [ ] Breadboard
- [ ] 9V Battery or USB cable

### Wiring Connections:
- [ ] Muscle BioAmp VCC → Arduino 5V
- [ ] Muscle BioAmp GND → Arduino GND  
- [ ] Muscle BioAmp OUT → Arduino A0
- [ ] HC-05 VCC → Arduino 3.3V (NOT 5V!)
- [ ] HC-05 GND → Arduino GND
- [ ] HC-05 RX → Arduino Pin 3
- [ ] HC-05 TX → Arduino Pin 2

## ✅ Software Setup

### Arduino IDE:
- [ ] Install Arduino IDE
- [ ] Open `arduino_uno_emg_firmware.ino`
- [ ] Select Board: Arduino Uno
- [ ] Select correct COM port
- [ ] Upload firmware
- [ ] Verify "AthletiX EMG Sensor Ready" in Serial Monitor

### Bluetooth Configuration:
- [ ] Power on Arduino
- [ ] Find HC-05 in Bluetooth devices
- [ ] Pair with code: 1234 or 0000
- [ ] Optional: Rename to "AthletiX-EMG" using AT commands

## ✅ Testing

### Basic Functionality:
- [ ] Open Serial Monitor (9600 baud)
- [ ] Type "STATUS" - should show EMG readings
- [ ] LED should blink when muscle contracts

### Electrode Testing:
- [ ] Clean skin with alcohol
- [ ] Place electrodes on muscle (see assembly guide)
- [ ] Check for signal when contracting muscle
- [ ] Run calibration: type "CALIBRATE" in Serial Monitor

### Bluetooth Testing:
- [ ] Use Python test script: `python test_arduino_connection.py`
- [ ] Or open `emg_web_monitor.html` in Chrome/Edge
- [ ] Connect to device and verify data stream

## ✅ Integration with AthletiX

### Web App Setup:
- [ ] Ensure AthletiX web app is running (`pnpm run`)
- [ ] Go to Tests page
- [ ] Click "Pair EMG Sensor"
- [ ] Select your Arduino device
- [ ] Verify real-time data display

### Troubleshooting:
- [ ] If no Bluetooth: Check HC-05 power (3.3V not 5V!)
- [ ] If no EMG signal: Check electrode placement and connections
- [ ] If noisy signal: Improve electrode contact, check grounding
- [ ] If connection drops: Check power supply stability

## ✅ Usage Tips

### Best Practices:
- [ ] Use fresh electrodes for best signal quality
- [ ] Calibrate before each session
- [ ] Keep electrode cables short and secure
- [ ] Avoid movement during recording
- [ ] Clean electrodes after use

### Electrode Placement (Example - Bicep):
- [ ] Positive (+): Center of bicep muscle
- [ ] Negative (-): 2-3cm away on same muscle
- [ ] Ground: Elbow bone or inactive tissue

## ✅ Safety

### Important Notes:
- [ ] Use only medical-grade electrodes
- [ ] Don't use on damaged skin
- [ ] Remove electrodes gently
- [ ] Never use near heart if you have pacemaker
- [ ] Clean hands before handling electrodes

## 🚀 Ready to Use!

Once all items are checked, your EMG sensor should be fully integrated with AthletiX and ready for athletic performance monitoring!

### Quick Test:
1. Power on Arduino
2. Open AthletiX web app
3. Go to Tests → Pair EMG Sensor
4. Place electrodes on muscle
5. Start a test and watch real-time EMG data!

### Need Help?
- Check `arduino_uno_assembly_guide.md` for detailed instructions
- Run `test_arduino_connection.py` for diagnostics
- Use `emg_web_monitor.html` for standalone testing