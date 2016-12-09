#include "DHT.h"

#define DHTPIN 5
#define DHTTYPE DHT22
#define LED_RED 12
#define LED_GREEN 13

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  dht.begin();
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
}

void loop() {
  // Pause a second between each loop
  delay(1000);

  // Read data from sensor
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(t) || isnan(h)) {
    Serial.println("{\"err\":\"Failed to read DHT\"}");
  }
  else {
    // Switch LED
    if (h > 50 || h < 40) {
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_GREEN, LOW);
    }
    else {
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    }

    // Send JSON response
    Serial.print("{\"humidity\":");
    Serial.print(h);
    Serial.print(",\"temperature\":");
    Serial.print(t * 9 / 5 + 32);
    Serial.println("}");
  }
}
