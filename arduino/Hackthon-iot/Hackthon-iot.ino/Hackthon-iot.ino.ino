//#include <TimedAction.h>


// IMPORTANT: Adafruit_TFTLCD LIBRARY MUST BE SPECIFICALLY
// CONFIGURED FOR EITHER THE TFT SHIELD OR THE BREAKOUT BOARD.
// SEE RELEVANT COMMENTS IN Adafruit_TFTLCD.h FOR SETUP.


#include <Adafruit_GFX.h>    // Core graphics library
//#include <Adafruit_TFTLCD.h> // Hardware-specific library
#include <TouchScreen.h>

// The control pins for the LCD can be assigned to any digital or
// analog pins...but we'll use the analog pins as this allows us to
// double up the pins with the touch screen (see the TFT paint example).




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

#define WHITE   0xFFFF

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

#define MINPRESSURE 10
#define MAXPRESSURE 1000


#define TS_MINX 100
#define TS_MAXX 920

#define TS_MINY 70
#define TS_MAXY 900

// We have a status line for like, is FONA working
#define KEY_X 100
#define KEY_Y 100

// We have a status line for like, is FONA working
#define INFO_X 90
#define INFO_Y 20

//#include <Wire.h>
#include <UnoWiFiDevEd.h>

#define CONNECTOR "mqtt"
#define TOPIC_UP "/refresh"
#define TOPIC "/accounts/AE3F5"
#define DEVICE_ID "AE3F5"
#define RFRSH  "{\"action\": \"refresh\", \"DEVICE\": \"AE3F5\"}"
#include <MCUFRIEND_kbv.h>
MCUFRIEND_kbv tft;
TouchScreen ts = TouchScreen(XP, YP, XM, YM, 300);

Adafruit_GFX_Button buttons[2];
char buttonlabels[2][4] = {"Key", "UPD."};
const uint16_t buttoncolors[2] = { ILI9341_RED,ILI9341_DARKGREEN};

byte updateInfo=0;

byte acctNumber=0;
char accountNames[2][15];
char balances[2][8];
char lastTra[2][15];

                             
void setup(void) {
  Ciao.begin();
  Serial.begin(9600);
  tft.reset();
  createButton();

}
void loop(void) {

 checkButton();
 
 if(updateInfo ==1){

   bankDisplay();
   updateInfo =0;
 }
 
}

void createButton(void){
  uint16_t identifier=0x9341;  
  tft.begin(identifier);

  tft.setRotation(0);
  tft.fillScreen(BLACK);

  buttons[0].initButton(&tft,40, 
                40,    // x, y, w, h, outline, fill, text
                  BUTTON_W, BUTTON_H, WHITE, buttoncolors[0], WHITE,
                  buttonlabels[0], BUTTON_TEXTSIZE);
  buttons[0].drawButton(); 
  buttons[1].initButton(&tft,160, 
                 40,    // x, y, w, h, outline, fill, text
                  120,BUTTON_H, ILI9341_WHITE, buttoncolors[1], WHITE,
                 buttonlabels[1], BUTTON_TEXTSIZE); 
  buttons[1].drawButton();

  
  // create 'text field'
 tft.drawRect(TEXT_X, TEXT_Y, TEXT_W, TEXT_H, WHITE);
 delay(200);
 }



void keyDisplay() {
  tft.setRotation(1);
  tft.fillRect(INFO_X, INFO_Y, 220, 190, BLACK);
  tft.setCursor(KEY_X, KEY_Y);
  tft.setTextColor(WHITE);
  tft.setTextSize(3);
  tft.print(DEVICE_ID);

  delay(3000);
  tft.fillRect(INFO_X, INFO_Y, 190, 190, BLACK);
  tft.setRotation(0);
}

void bankDisplay() {
  //set the display zone

  tft.setRotation(1);
  tft.setCursor(INFO_X, INFO_Y);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(INFO_X, INFO_Y);
  if (acctNumber==0){
    tft.println(F("Nothing to display"));
    tft.setCursor(INFO_X, INFO_Y+30);
    tft.print(F("Please refresh"));  
  }else{
    tft.print(F("Acct: "));
    tft.println(accountNames[0]);
    tft.setCursor(INFO_X, INFO_Y+30);
    tft.print(F("bal:"));
    tft.println(balances[0]);
    tft.setCursor(INFO_X, INFO_Y+60);
    tft.print(F("last:"));
    tft.println(lastTra[0]);
   
  }
   tft.setRotation(0);
}


  
void checkButton(void){

  digitalWrite(13, HIGH);
  TSPoint p = ts.getPoint();
  digitalWrite(13, LOW);

  // if sharing pins, you'll need to fix the directions of the touchscreen pins
  //pinMode(XP, OUTPUT);
  pinMode(XM, OUTPUT);
  pinMode(YP, OUTPUT);

   if (p.z > MINPRESSURE && p.z < MAXPRESSURE) {
    // scale from 0->1023 to tft.width
    p.x = map(p.x, TS_MINX, TS_MAXX, tft.width(), 0);
    p.y = (tft.height()-map(p.y, TS_MINY, TS_MAXY, tft.height(), 0));
   }
   
  // go thru all the buttons, checking if they were pressed
  for (uint8_t b=0; b<2; b++) {
    if (buttons[b].contains(p.x, p.y)) {
      //Serial.print("Pressing: "); Serial.println(b);
      buttons[b].press(true);  // tell the button it is pressed
    } else {
      buttons[b].press(false);  // tell the button it is NOT pressed
    }
  }

  // now we can ask the buttons if their state has changed
  for (uint8_t b=0; b<2; b++) {
    if (buttons[b].justReleased()) {
      // Serial.print("Released: "); Serial.println(b);
      buttons[b].drawButton();  // draw normal
    }
    
    if (buttons[b].justPressed()) {
        buttons[b].drawButton(true);  // draw invert!
  
      // key button
        if (b == 0) {

          keyDisplay();
          
        }
        
        // refresh
        if (b == 1) {
   
        refresh();
        }
        updateInfo=1;
   
   
    }

}

}

void refresh(void){  
    Ciao.write(CONNECTOR, TOPIC_UP,RFRSH );
    delay(500); // wait for replay
    receiveAccts();
    updateInfo=1;
    createButton();
}

void receiveAccts(void){
  CiaoData data; 
  for (uint8_t i=0; i<500;i++){
    data = Ciao.read(CONNECTOR, TOPIC);
    if (!data.isEmpty()){
       const char *message = data.get(2);
        Serial.println(F("got it"));
        parseAcctInfo(message);
        updateInfo=1;
        break;
     } 
     delay(10);
 }
}



void parseAcctInfo(char *info){
  //  account name|balance| last transaction

  char *token;
  uint8_t j=0;
  uint8_t k=0;
   while ((token = strtok_r(info, "|", &info)) != NULL){
      k=j % 3;
      Serial.println(k);
      uint8_t idx=(j-k)/3;
      Serial.println(idx);
      if(k == 0){
        strncpy(accountNames[idx],token, 15);
      }
      if(k== 1){
        strncpy(balances[idx],token, 5);
      }
      if(k ==2){
        strncpy(lastTra[idx],token, 15);
      }
      acctNumber=idx+1;
      j++;
      
  }
  
}
