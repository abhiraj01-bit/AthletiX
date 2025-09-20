# Simple Arduino Uno EMG Setup

## What You Need
- Arduino Uno
- Muscle BioAmp Patchy
- 3 EMG electrodes
- USB cable
- 3 jumper wires

## Wiring (3 connections only!)
```
Muscle BioAmp → Arduino Uno
VCC → 5V
GND → GND  
OUT → A0
```

## Setup Steps

### 1. Upload Code
- Open Arduino IDE
- Load `arduino_uno_usb_firmware.ino`
- Select Arduino Uno board
- Upload code

### 2. Test Connection
- Open Serial Monitor (9600 baud)
- Should see: "AthletiX EMG Ready"
- LED blinks 3 times when ready

### 3. Connect Electrodes
- Clean skin with alcohol
- Place electrodes on muscle:
  - **Red (+)**: Center of muscle
  - **Black (-)**: 2cm away on same muscle  
  - **Blue (Ground)**: On bone nearby

### 4. Test Signal
- Contract muscle → LED should turn ON
- Relax muscle → LED should turn OFF
- Serial Monitor shows EMG values

### 5. Use with AthletiX
- Keep Arduino connected via USB
- Start AthletiX web app: `pnpm run`
- Go to Tests page
- Click "Connect Arduino"
- Select your Arduino port (usually COM3, COM4, etc.)

## That's it! 
Your EMG sensor is now integrated with AthletiX for real-time muscle monitoring during athletic tests.