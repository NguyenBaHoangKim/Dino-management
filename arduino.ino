#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>  // Standard WebServer library for ESP32

// WiFi credentials
const char* ssid = "Duyen";
const char* password = "0966039897";

const int ledPin = D0;//sao dang chon chan so2 ma no k sang nhi  // rồi mày có nộp lại code chưa mà chọn con cặc gì thay đổi trên đây thì phải nộp lại code chỉ có file mới tao mới cho người dùng chọn
//biet roi

// Create an instance of the WebServer on port 80
ESP8266WebServer server(80);

// Timing variables
unsigned long ledTurnOnTime = 0;
const unsigned long ledOnDuration = 10000;  // 10 seconds
bool ledIsOn = false;

// Function to parse JSON manually and extract command value
String parseCommand(String body) {
  body.trim();  // Remove leading/trailing whitespace
  Serial.println("Parsing body: " + body);
  int commandKeyIndex = body.indexOf("\"command\":\"");  // Find "command":"
  if (commandKeyIndex == -1) {
    Serial.println("No 'command' key found");
    return "";
  }
  int startIndex = commandKeyIndex + 11;  // Skip past "command":" to the value
  int firstQuoteIndex = startIndex;       // Should be the opening quote of the value
  int endIndex = body.indexOf("\"", firstQuoteIndex + 1);  // Find the closing quote
  Serial.println("Start index: " + String(startIndex) + ", End index: " + String(endIndex));
  if (startIndex != -1 && endIndex > startIndex) {
    String command = body.substring(startIndex, endIndex);
    Serial.println("Extracted command: " + command);
    return command;
  }
  Serial.println("Failed to parse command");
  return "";
}

void handleLEDCommand() {
  Serial.println("Received POST request at /led_command");
  String body = "";
  if (server.hasArg("plain")) {
    body = server.arg("plain");
    Serial.println("Raw Request Body: [" + body + "]");
  } else {
    Serial.println("No body received in the request");
  }
  
  String command = parseCommand(body);
  
  if (command.length() > 0) {
    Serial.println("Received command: " + command);
    if (command == "low") {
      Serial.println("Turning LED OFF");
      digitalWrite(ledPin, LOW);
      ledIsOn = false;
      server.send(200, "text/plain", "LED turned OFF");
    } else {
      Serial.println("Turning LED ON for 10 seconds");
      digitalWrite(ledPin, HIGH);
      ledTurnOnTime = millis();
      ledIsOn = true;
      server.send(200, "text/plain", "LED turned ON for 10 seconds");
    }
  } else {
    Serial.println("No command found in the request");
    server.send(400, "text/plain", "No command found");
  }
}

void setup() {
  // Start serial communication for debugging
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);  // Initialize LED as OFF
  
  // Connect to WiFi and log connection status
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  
  // Log ESP32 IP address
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Define the POST endpoint to control the LED
  server.on("/led_command", HTTP_POST, handleLEDCommand);
  
  // Start the web server
  server.begin();
  Serial.println("Server started.");
}

void loop() {
  // Handle any incoming HTTP requests
  server.handleClient();
  
  // Check if LED should be turned off after 10 seconds
  if (ledIsOn && (millis() - ledTurnOnTime >= ledOnDuration)) {
    digitalWrite(ledPin, LOW);
    ledIsOn = false;
    Serial.println("LED turned OFF after 10 seconds");
  }
}