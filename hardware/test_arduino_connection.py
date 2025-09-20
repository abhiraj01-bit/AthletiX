#!/usr/bin/env python3
"""
Test script for Arduino Uno EMG sensor connection
Run this to verify your Arduino is sending EMG data correctly
"""

import serial
import json
import time
import matplotlib.pyplot as plt
from collections import deque

def find_arduino_port():
    """Find Arduino COM port automatically"""
    import serial.tools.list_ports
    
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if 'Arduino' in port.description or 'CH340' in port.description or 'USB' in port.description:
            return port.device
    return None

def test_serial_connection():
    """Test direct serial connection to Arduino"""
    port = find_arduino_port()
    if not port:
        print("Arduino not found. Please check connection.")
        return
    
    print(f"Connecting to Arduino on {port}...")
    
    try:
        ser = serial.Serial(port, 9600, timeout=1)
        time.sleep(2)  # Wait for Arduino to initialize
        
        print("Connected! Sending STATUS command...")
        ser.write(b'STATUS\n')
        
        # Read responses
        for i in range(10):
            if ser.in_waiting:
                response = ser.readline().decode().strip()
                print(f"Arduino: {response}")
            time.sleep(0.5)
        
        ser.close()
        
    except Exception as e:
        print(f"Error: {e}")

def monitor_emg_data():
    """Monitor real-time EMG data from Arduino"""
    port = find_arduino_port()
    if not port:
        print("Arduino not found. Please check connection.")
        return
    
    print(f"Monitoring EMG data from {port}...")
    print("Press Ctrl+C to stop")
    
    # Data storage for plotting
    timestamps = deque(maxlen=100)
    emg_values = deque(maxlen=100)
    activity_values = deque(maxlen=100)
    
    try:
        ser = serial.Serial(port, 9600, timeout=1)
        time.sleep(2)
        
        start_time = time.time()
        
        while True:
            if ser.in_waiting:
                line = ser.readline().decode().strip()
                
                # Try to parse JSON data
                if line.startswith('{') and line.endswith('}'):
                    try:
                        data = json.loads(line)
                        current_time = time.time() - start_time
                        
                        # Store data
                        timestamps.append(current_time)
                        emg_values.append(data.get('emg', 0))
                        activity_values.append(data.get('muscleActivity', 0))
                        
                        # Print current values
                        print(f"Time: {current_time:.1f}s | "
                              f"EMG: {data.get('emg', 0):4d} | "
                              f"Activity: {data.get('muscleActivity', 0):5.1f}% | "
                              f"Fatigue: {data.get('fatigue', 0):5.1f}% | "
                              f"Active: {'YES' if data.get('activated', False) else 'NO'}")
                        
                    except json.JSONDecodeError:
                        print(f"Non-JSON: {line}")
                else:
                    print(f"Arduino: {line}")
            
            time.sleep(0.01)
            
    except KeyboardInterrupt:
        print("\nStopping monitoring...")
        ser.close()
        
        # Plot the collected data
        if len(timestamps) > 0:
            plot_emg_data(timestamps, emg_values, activity_values)
    
    except Exception as e:
        print(f"Error: {e}")

def plot_emg_data(timestamps, emg_values, activity_values):
    """Plot collected EMG data"""
    try:
        plt.figure(figsize=(12, 8))
        
        # Plot raw EMG values
        plt.subplot(2, 1, 1)
        plt.plot(timestamps, emg_values, 'b-', linewidth=1)
        plt.title('Raw EMG Signal')
        plt.ylabel('EMG Value')
        plt.grid(True)
        
        # Plot muscle activity percentage
        plt.subplot(2, 1, 2)
        plt.plot(timestamps, activity_values, 'r-', linewidth=2)
        plt.title('Muscle Activity')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Activity (%)')
        plt.grid(True)
        
        plt.tight_layout()
        plt.show()
        
    except ImportError:
        print("Matplotlib not available. Install with: pip install matplotlib")

def calibrate_sensor():
    """Help calibrate the EMG sensor"""
    port = find_arduino_port()
    if not port:
        print("Arduino not found. Please check connection.")
        return
    
    try:
        ser = serial.Serial(port, 9600, timeout=1)
        time.sleep(2)
        
        print("Starting calibration...")
        print("1. Relax your muscle completely")
        input("Press Enter when ready...")
        
        ser.write(b'CALIBRATE\n')
        
        # Monitor calibration
        for i in range(10):
            if ser.in_waiting:
                response = ser.readline().decode().strip()
                print(f"Calibration: {response}")
            time.sleep(0.5)
        
        print("\n2. Now contract your muscle strongly")
        input("Press Enter to test activation...")
        
        # Monitor for 5 seconds
        print("Monitoring activation for 5 seconds...")
        start_time = time.time()
        max_value = 0
        
        while time.time() - start_time < 5:
            if ser.in_waiting:
                line = ser.readline().decode().strip()
                if line.startswith('{'):
                    try:
                        data = json.loads(line)
                        emg_val = data.get('emg', 0)
                        max_value = max(max_value, emg_val)
                        print(f"EMG: {emg_val}, Max: {max_value}")
                    except:
                        pass
            time.sleep(0.1)
        
        print(f"\nCalibration complete!")
        print(f"Maximum EMG value detected: {max_value}")
        print(f"Recommended threshold: {max_value // 2}")
        
        # Set threshold
        threshold = max_value // 2
        command = f"THRESHOLD={threshold}\n"
        ser.write(command.encode())
        
        ser.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("AthletiX Arduino EMG Test Tool")
    print("=" * 40)
    print("1. Test serial connection")
    print("2. Monitor EMG data")
    print("3. Calibrate sensor")
    print("4. Exit")
    
    while True:
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == '1':
            test_serial_connection()
        elif choice == '2':
            monitor_emg_data()
        elif choice == '3':
            calibrate_sensor()
        elif choice == '4':
            break
        else:
            print("Invalid choice. Please select 1-4.")