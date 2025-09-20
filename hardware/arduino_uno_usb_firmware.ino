// AthletiX EMG Sensor - Arduino Uno USB Serial
// Direct USB connection to computer

const int EMG_PIN = A0;
const int LED_PIN = 13;
const int SAMPLE_RATE = 50;
const int BUFFER_SIZE = 20;
const int THRESHOLD = 100;

int emgBuffer[BUFFER_SIZE];
int bufferIndex = 0;
float muscleActivity = 0;
float fatigueLevel = 0;
bool isActivated = false;

void setup() {
  Serial.begin(9600);
  pinMode(EMG_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  for(int i = 0; i < BUFFER_SIZE; i++) {
    emgBuffer[i] = 0;
  }
  
  Serial.println("AthletiX EMG Ready");
  Serial.flush();
  
  // Blink ready signal
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("Starting EMG loop...");
}

void loop() {
  int emgValue = analogRead(EMG_PIN);
  
  emgBuffer[bufferIndex] = emgValue;
  bufferIndex = (bufferIndex + 1) % BUFFER_SIZE;
  
  muscleActivity = map(emgValue, 0, 1023, 0, 100);
  fatigueLevel = calculateFatigue();
  isActivated = emgValue > THRESHOLD;
  
  digitalWrite(LED_PIN, isActivated ? HIGH : LOW);
  
  // Send JSON data
  Serial.print("{\"emg\":");
  Serial.print(emgValue);
  Serial.print(",\"muscleActivity\":");
  Serial.print(muscleActivity, 1);
  Serial.print(",\"fatigue\":");
  Serial.print(fatigueLevel, 1);
  Serial.print(",\"activated\":");
  Serial.print(isActivated ? "true" : "false");
  Serial.println("}");
  Serial.flush();
  
  delay(1000 / SAMPLE_RATE);
}

float calculateFatigue() {
  long sum = 0;
  for(int i = 0; i < BUFFER_SIZE; i++) {
    sum += emgBuffer[i];
  }
  float mean = (float)sum / BUFFER_SIZE;
  
  float variance = 0;
  for(int i = 0; i < BUFFER_SIZE; i++) {
    float diff = emgBuffer[i] - mean;
    variance += diff * diff;
  }
  variance /= BUFFER_SIZE;
  
  return constrain(map(variance, 0, 5000, 0, 100), 0, 100);
}