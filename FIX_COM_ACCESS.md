# Fix COM Port Access Denied

## Immediate Solutions

### 1. Close Arduino Serial Monitor
- Arduino IDE → Tools → Serial Monitor → Close it
- This is the most common cause

### 2. Check Task Manager
- Press Ctrl+Shift+Esc
- Look for "Arduino IDE" or "Serial Monitor"
- End these processes

### 3. Try Different Port
- Use COM3 or COM5 instead of COM4
- Check Device Manager for available ports

### 4. Restart Arduino
- Unplug USB cable
- Wait 5 seconds
- Plug back in
- Try connecting again

### 5. Run as Administrator
- Close AthletiX
- Right-click Command Prompt → "Run as administrator"
- Navigate to project folder
- Run: `pnpm run`

## Quick Test
```bash
# Check which ports are available
# In web app, refresh port list
# Try each port until one works
```

Most likely cause: Arduino Serial Monitor is still open. Close it first.