#define BLYNK_TEMPLATE_ID "TMPL2-nMD9ZEX"
#define BLYNK_TEMPLATE_NAME "Suivi Santé"
#define BLYNK_AUTH_TOKEN "8ZX5fkjkvPjrpZS_lNpX5Hs45NsnorX5"

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <DHT.h>
#include <LiquidCrystal.h>

// === Connexion WiFi ===
char ssid[] = "Wifi"; //Notre SSID wifi
char pass[] = "00000000"; //Son mot de passe 

// === Capteurs ===
#define DHTPIN D1
#define DHTTYPE DHT11
const int capteurTension = A0;  // KY-039 par exemple

// === Objets ===
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal lcd(D0, D8, D4, D3, D7, D2);  // RS, E, D4, D5, D6, D7

void setup() {
  Serial.begin(9600);
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);
  dht.begin();
  lcd.begin(16, 2);
  pinMode(capteurTension, INPUT);

  lcd.setCursor(0, 0);
  lcd.print("Connexion...");
}

void loop() {
  Blynk.run();
  updateSensors();
  delay(5000);  // Mise à jour toutes les 5s
}

// === Lecture "tension" simulée ===
int readTension() {
  const int threshold = 500;
  const unsigned long duration = 10000;
  unsigned long start = millis();
  int beats = 0;
  bool beatDetected = false;

  while (millis() - start < duration) {
    int signal = analogRead(capteurTension);

    if (signal < threshold && !beatDetected) {
      beatDetected = true;
      beats++;
    }

    if (signal > threshold && beatDetected) {
      beatDetected = false;
    }

    delay(10);
  }

  int tension = beats * 6;
  if (tension < 10) tension = 0;  // Considéré erreur
  return tension;
}

// === Traitement capteurs et affichages ===
void updateSensors() {
  float temperature = dht.readTemperature();
  int tension = readTension();

  // === LCD ===
  lcd.clear();
  lcd.setCursor(0, 0);
  if (!isnan(temperature)) {
    lcd.print("Temp: ");
    lcd.print(temperature, 1);
    lcd.print("C");
  } else {
    lcd.print("Temp: Erreur");
  }

  lcd.setCursor(0, 1);
  lcd.print("Tens: ");
  if (tension == 0) {
    lcd.print("Erreur");
  } else {
    lcd.print(tension);
  }

  // === Serial Monitor ===
  Serial.println("==========");
  Serial.print("Température : ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("Tension : ");
  Serial.println(tension);

  // === Blynk Envoi Gauges ===
  if (!isnan(temperature)) {
    Blynk.virtualWrite(V0, temperature);
  } else {
    Blynk.virtualWrite(V0, 0);
  }

  Blynk.virtualWrite(V1, tension);

  // === Diagnostic température => V2 ===
  String tempMsg;
  if (isnan(temperature)) {
    tempMsg = "Erreur capteur";
  } else if (temperature > 39) {
    tempMsg = "Risque Paludisme";
  } else if (temperature > 37.5) {
    tempMsg = "Symptômes Grippe";
  } else {
    tempMsg = "Température normale";
  }
  Blynk.virtualWrite(V2, tempMsg);

  // === Diagnostic tension => V3 ===
  String tensMsg;
  if (tension == 0) {
    tensMsg = "Erreur capteur";
  } else if (tension < 60) {
    tensMsg = "Hypotension";
  } else if (tension > 100) {
    tensMsg = "Hypertension";
  } else {
    tensMsg = "Tension normale";
  }
  Blynk.virtualWrite(V3, tensMsg);
}
