#include <TimedAction.h>

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9
 
MFRC522 rfid(SS_PIN, RST_PIN); // Instance of the class

MFRC522::MIFARE_Key key; 
// Init array that will store new NUID 


// When using the BREAKOUT BOARD only, use these 8 data lines to the LCD:
// For the Arduino Uno, Duemilanove, Diecimila, etc.:
//   D0 connects to digital pin 8  (Notice these are
//   D1 connects to digital pin 9   NOT in order!)
//   D2 connects to digital pin 2
//   D3 connects to digital pin 3
//   D4 connects to digital pin 4
//   D5 connects to digital pin 5
//   D6 connects to digital pin 6
//   D7 connects to digital pin 7
// For the Arduino Mega, use digital pins 22 through 29
// (on the 2-row header at the end of the board).

// Assign human-readable names to some common 16-bit color values:
#define  BLACK   0x0000
#define YELLOW  0xFFE0
#define WHITE   0xFFFF
#define  BLUE    0x001F
// Color definitions
#define ILI9341_BLACK       0x0000      /*   0,   0,   0 */

#define ILI9341_DARKGREEN   0x03E0      /*   0, 128,   0 */
#define ILI9341_RED         0xF800      /* 255,   0,   0 */
#define ILI9341_WHITE       0xFFFF      /* 255, 255, 255 */

/******************* UI details */
#define BUTTON_X 40
#define BUTTON_Y 100
#define BUTTON_W 60
#define BUTTON_H 30
#define BUTTON_SPACING_X 20
#define BUTTON_SPACING_Y 20
#define BUTTON_TEXTSIZE 2

// text box where numbers go
#define TEXT_X 10
#define TEXT_Y 75
#define TEXT_W 220
#define TEXT_H 240
#define TEXT_TSIZE 3

#define TEXTPOS_X 10
#define TEXTPOS_Y 75
// the data (phone #) we store in the textfield


#define YP A3  // must be an analog pin, use "An" notation!
#define XM A2  // must be an analog pin, use "An" notation!
#define YM 9   // can be a digital pin
#define XP 8   // can be a digital pin



// We have a status line for like, is FONA working
#define KEY_X 100
#define KEY_Y 100

// We have a status line for like, is FONA working
#define INFO_X 90
#define INFO_Y 30

//#include <Wire.h>
#include <UnoWiFiDevEd.h>

#define CONNECTOR "mqtt"
#define TOPIC_UP "/refresh"
#define TOPIC "/accounts"
#define DEVICE_ID "AE34R"
#include <MCUFRIEND_kbv.h>
MCUFRIEND_kbv tft;

String key_str;
byte updateInfo = 0;
byte dataRfrsh = 0;
byte pannel = 1;
byte pchanged = 0;
byte cardScanned = 0;
char acctNum[2];
char balance[10];
char lastAmount[10];
char lastCat[20];

void rotate(void) {
  Serial.println(F("rotate"));
  if (pannel == 1) {
    pannel = 2;
  } else {
    pannel = 1;
  }
  pchanged = 1;
}
TimedAction rotatePanel = TimedAction(5000, rotate);
void setup(void) {
  Ciao.begin();
  Serial.begin(9600);
  SPI.begin(); // Init SPI bus
 

  tft.reset();
  initScreen();

}
void loop(void) {

  //checkButton();
  readCard();
  if (cardScanned==1){
    keyDisplay();
    refresh();
    cardScanned=0;
    
  }
  rotatePanel.check();
  if (updateInfo == 1) {
    pannel = 1;

    updateInfo = 0;
  }
  bankDisplay();
}

void readCard(void) {
  byte nuidPICC[4];
 rfid.PCD_Init(); // Init MFRC522 
  // Look for new cards
  if ( ! rfid.PICC_IsNewCardPresent())
    return;

  // Verify if the NUID has been readed
  if ( ! rfid.PICC_ReadCardSerial())
    return;

  Serial.print(F("PICC type: "));
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.println(rfid.PICC_GetTypeName(piccType));

  // Check is the PICC of Classic MIFARE type
  if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&  
    piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
    piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
    Serial.println(F("Your tag is not of type MIFARE Classic."));
    return;
  }

  
    Serial.println(F("A new card has been detected."));

    // Store NUID into nuidPICC array
    for (byte i = 0; i < 4; i++) {
      nuidPICC[i] = rfid.uid.uidByte[i];
    }
   
    Serial.println(F("The NUID tag is:"));
    Serial.print(F("In hex: "));
    key_str= toHex(rfid.uid.uidByte, rfid.uid.size);
    Serial.println(key_str);
    cardScanned=1;
   
 
  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
}


String toHex(byte* buffer, byte bufferSizes)
{
    char c[bufferSizes * 2];

    byte b;

    for(int bx = 0, cx = 0; bx < bufferSizes; ++bx, ++cx) 
    {
        b = ((byte)(buffer[bx] >> 4));
        c[cx] = (char)(b > 9 ? b + 0x37 + 0x20 : b + 0x30);

        b = ((byte)(buffer[bx] & 0x0F));
        c[++cx]=(char)(b > 9 ? b + 0x37 + 0x20 : b + 0x30);
    }

    return String(c);
}


void initScreen(void) {
  uint16_t identifier = 0x9341;
  tft.begin(identifier);
  tft.setRotation(2);
  tft.fillScreen(BLACK);

  // create 'text field'
  tft.drawRect(TEXT_X, TEXT_Y, TEXT_W, TEXT_H, WHITE);
  delay(200);
}



void keyDisplay() {
  tft.setRotation(3);
  tft.fillRect(INFO_X, INFO_Y, 220, 190, BLACK);
  tft.setCursor(KEY_X, KEY_Y);
  tft.setTextColor(WHITE);
  tft.setTextSize(3);
  tft.print(key_str);

  delay(3000);
  tft.fillRect(INFO_X, INFO_Y, 190, 190, BLACK);
  tft.setRotation(2);
}

void bankDisplay() {
  //set the display zone

  tft.setRotation(3);
  tft.setCursor(INFO_X, INFO_Y);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(INFO_X, INFO_Y);
  if (dataRfrsh == 0) {
    tft.println(F("Nothing to display"));
    tft.setCursor(INFO_X, INFO_Y + 40);
    tft.print(F("Please Register"));
    tft.setCursor(INFO_X, INFO_Y + 80);
    tft.print(key_str);
  } else {

    if (pchanged == 1) {
      tft.fillRect(INFO_X, INFO_Y, 220, 190, BLACK);
      pchanged = 0;
    }

    if (pannel == 1) {
      tft.setTextSize(2);
      tft.print(F("You Have: "));
      tft.setCursor(INFO_X, INFO_Y + 60);
      tft.setTextColor(BLUE);
      tft.setTextSize(4);
      tft.print(balance);
      tft.setTextColor(YELLOW);
      tft.print(F("$"));
      tft.setCursor(INFO_X, INFO_Y + 120);
      tft.setTextColor(WHITE);
      tft.setTextSize(2);
      tft.print(F("Across:"));
      tft.setTextColor(BLUE);
      tft.print(acctNum);
      tft.setTextColor(WHITE);
      tft.println(F(" accounts"));

    }
    if (pannel == 2) {
      tft.setTextSize(2);
      tft.println(F("Last transaction:"));
      tft.setCursor(INFO_X, INFO_Y + 60);
      tft.setTextColor(BLUE);
      tft.setTextSize(4);
      tft.print(lastAmount);
      tft.setTextColor(YELLOW);
      tft.print(F("$"));
      tft.setCursor(INFO_X, INFO_Y + 120);
      tft.setTextSize(2);
      tft.setTextColor(WHITE);
      tft.print(F("Category:"));
      tft.setCursor(INFO_X, INFO_Y + 150);
      tft.setTextColor(BLUE);
      tft.setTextSize(1);
      tft.println(lastCat);
      tft.setTextColor(WHITE);

    }
  }
  tft.setRotation(2);
}


void refresh(void) {
  Ciao.write(CONNECTOR, TOPIC_UP, key_str );
  delay(500); // wait for replay
  receiveAccts();
  Serial.print(F("done with rec"));
  updateInfo = 1;
  initScreen();
}

void receiveAccts(void) {
  CiaoData data;
  for (uint16_t i = 0; i < 850; i++) {
    data = Ciao.read(CONNECTOR, TOPIC);
    if (!data.isEmpty()) {
      const char *message = data.get(2);
      Serial.println(F("got it in"));
      Serial.println(i);
      parseAcctInfo(message);
      dataRfrsh = 1;
      updateInfo = 1;
      break;
    }
    delay(10);
  }
  Serial.println(F("give up!"));
}



void parseAcctInfo(char *info) {
  //  account name|balance| last transaction

  char *token;
  uint8_t k = 0;

  while ((token = strtok_r(info, "|", &info)) != NULL) {

    if (k == 0) {
      strncpy(acctNum, token, 2);
    }
    if (k == 1) {
      strncpy(balance, token, 10);
    }
    if (k == 2) {
      strncpy(lastAmount, token, 10);
    }
    if (k == 3) {
      strncpy(lastCat, token, 20);
    }

    k++;

  }

}
