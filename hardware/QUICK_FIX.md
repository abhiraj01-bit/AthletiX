# Quick Hardware Integration Fix

## Immediate Solutions

### 1. Fix Serial Port Issues
```bash
# In project root
pnpm approve-builds
pnpm run
```

### 2. Test Arduino Connection
```bash
# Open Arduino IDE
# Load: hardware/arduino_uno_usb_firmware.ino
# Upload to Arduino
# Open Serial Monitor (9600 baud)
# Should see: "AthletiX EMG Ready"
```

### 3. Connect in Web App
1. Go to: `http://localhost:5173/emg-connection`
2. Select COM port (try COM3, COM4, COM5)
3. Click "Connect Arduino"
4. Should see live EMG data

### 4. If Still Not Working
```bash
# Check Device Manager (Windows)
# Look for Arduino under "Ports (COM & LPT)"
# Note the COM port number
# Use that exact port in web app
```

### 5. Emergency Fallback
```bash
# Use Python test script
cd hardware
python test_arduino_connection.py
# This will show if Arduino is working
```

## Key Files Updated
- `server/routes/serial-emg.ts` - Better error handling
- `client/hooks/useEMG.ts` - Connection drop detection
- `server/index.ts` - New disconnect/status endpoints

## Hardware Checklist
- [ ] Arduino connected via USB
- [ ] Firmware uploaded (`arduino_uno_usb_firmware.ino`)
- [ ] Wiring: VCC→5V, GND→GND, OUT→A0
- [ ] EMG electrodes placed on muscle
- [ ] Web app running (`pnpm run`)
- [ ] Correct COM port selected

Your hardware integration should now work reliably!