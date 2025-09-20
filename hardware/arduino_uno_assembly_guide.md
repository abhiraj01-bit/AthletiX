# Arduino Uno + Muscle BioAmp Patchy Assembly Guide

## Components Required
- Arduino Uno R3
- Muscle BioAmp Patchy v0.2
- HC-05 Bluetooth Module
- 3 EMG Electrodes (Ag/AgCl)
- Jumper Wires
- Breadboard
- 9V Battery + Battery Connector
- Project Box (optional)

## Wiring Connections

### Muscle BioAmp Patchy → Arduino Uno
```
VCC → 5V (or 3.3V)
GND → GND
OUT → A0 (Analog Pin 0)
```

### HC-05 Bluetooth Module → Arduino Uno
```
VCC → 3.3V (NOT 5V - will damage module!)
GND → GND
RX  → Pin 3 (Digital)
TX  → Pin 2 (Digital)
```

### Power Supply
```
9V Battery → Arduino Uno Power Jack
OR
USB Cable → Arduino Uno (for development)
```

## 3-Electrode Setup (No Reference Cable)

Since you don't have a reference cable, we'll use a 3-electrode configuration:

### Electrode Placement
1. **Positive (+)** - Place on muscle belly (center of target muscle)
2. **Negative (-)** - Place on same muscle, 2-3cm away from positive
3. **Ground (GND)** - Place on nearby bone or inactive tissue

### Example for Bicep Monitoring:
- **Positive**: Center of bicep muscle
- **Negative**: 2-3cm towards elbow on bicep
- **Ground**: Elbow bone or forearm

## Assembly Steps

### 1. Prepare Arduino Uno
```bash
# Install Arduino IDE
# Open arduino_uno_emg_firmware.ino
# Select Board: Arduino Uno
# Select Port: (your Arduino port)
# Upload firmware
```

### 2. Wire Components
1. Connect Muscle BioAmp Patchy to Arduino (VCC, GND, OUT→A0)
2. Connect HC-05 Bluetooth module (VCC→3.3V, GND, RX→Pin3, TX→Pin2)
3. Double-check all connections

### 3. Test Basic Functionality
```bash
# Open Serial Monitor (9600 baud)
# Should see: "AthletiX EMG Sensor Ready"
# Type "STATUS" to see current readings
```

### 4. Bluetooth Setup
1. Power on Arduino
2. HC-05 should be discoverable as "HC-05" or similar
3. Default pairing code: 1234 or 0000
4. Test connection with serial terminal app

### 5. Electrode Preparation
1. Clean skin with alcohol wipe
2. Remove electrode backing
3. Apply firm pressure for good contact
4. Connect electrode cables to Muscle BioAmp Patchy

## Calibration Process

### 1. Baseline Calibration
```bash
# In Serial Monitor, type: CALIBRATE
# Keep muscle completely relaxed for 5 seconds
# Note the baseline value
```

### 2. Threshold Adjustment
```bash
# Contract muscle and note peak values
# Set threshold: THRESHOLD=150 (adjust based on your readings)
# Test activation detection
```

### 3. Signal Quality Check
- Good signal: Clean baseline, clear muscle contractions
- Poor signal: Noisy baseline, weak contractions
- Fix: Improve electrode contact, check wiring

## Integration with AthletiX Web App

### 1. Modify Bluetooth Connection
The web app expects device name "AthletiX-EMG". To change HC-05 name:

```bash
# Enter AT command mode on HC-05
# Send: AT+NAME=AthletiX-EMG
# Restart module
```

### 2. Data Format
Arduino sends JSON data every 200ms:
```json
{
  "emg": 245,
  "muscleActivity": 67.2,
  "fatigue": 23.1,
  "activated": true,
  "timestamp": 12345
}
```

### 3. Web App Connection
1. Open AthletiX web app
2. Go to Tests page
3. Click "Pair EMG Sensor"
4. Select "AthletiX-EMG" device
5. Start monitoring

## Troubleshooting

### No EMG Signal
- Check electrode placement and skin contact
- Verify Muscle BioAmp Patchy connections
- Test with multimeter: should see voltage changes with muscle contraction

### Bluetooth Connection Issues
- Ensure HC-05 is powered with 3.3V (NOT 5V)
- Check TX/RX connections (they should be crossed)
- Verify baud rate (9600)
- Try pairing with phone first

### Noisy Signal
- Improve electrode contact
- Keep wires away from power sources
- Add small capacitor (0.1µF) between EMG_PIN and GND
- Ensure good ground connection

### Power Issues
- Use fresh 9V battery or stable USB power
- Check all GND connections
- Measure voltages with multimeter

## Advanced Features

### 1. Signal Filtering (Optional)
Add hardware low-pass filter:
- 1kΩ resistor + 0.1µF capacitor between OUT and A0

### 2. Multiple Muscle Monitoring
- Use additional analog pins (A1, A2, etc.)
- Add more Muscle BioAmp Patchy modules
- Modify firmware for multi-channel

### 3. Data Logging
- Add SD card module for offline storage
- Log data when Bluetooth disconnected
- Sync when reconnected

## Safety Notes
- Use only medical-grade electrodes
- Don't use on damaged skin
- Remove electrodes gently
- Clean electrodes after use
- Never use near heart if you have pacemaker

## Performance Tips
- Fresh electrodes give best signal quality
- Shave hair from electrode area if needed
- Keep electrode cables short and secure
- Avoid movement artifacts during recording
- Calibrate before each session