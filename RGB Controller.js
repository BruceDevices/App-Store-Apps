var gpio     = require("gpio");
var display  = require("display");
var dialog   = require("dialog");
var keyboard = require("keyboard");

var PIN_R = 4;
var PIN_G = 16;
var PIN_B = 17;

function setRGB(r, g, b) {
    gpio.analogWrite(PIN_R, 255 - r);
    gpio.analogWrite(PIN_G, 255 - g);
    gpio.analogWrite(PIN_B, 255 - b);
}

function ledOff() { setRGB(0, 0, 0); }

function clamp(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

function hsvToRgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f  = (h / 60.0) - Math.floor(h / 60.0);
    var p  = Math.floor(v * (255 - s) / 255);
    var q  = Math.floor(v * (255 - f * s) / 255);
    var t  = Math.floor(v * (255 - (1 - f) * s) / 255);
    if (hi === 0) { return [v, t, p]; }
    if (hi === 1) { return [q, v, p]; }
    if (hi === 2) { return [p, v, t]; }
    if (hi === 3) { return [p, q, v]; }
    if (hi === 4) { return [t, p, v]; }
    return [v, p, q];
}

var W      = display.width();
var BLACK  = display.color(0, 0, 0);
var WHITE  = display.color(255, 255, 255);
var DIM    = display.color(80, 80, 80);
var HEADER = display.color(20, 20, 80);

function drawUI(r, g, b, label) {
    var swatch = display.color(r, g, b);
    var barMax = W - 70;
    var barY;
    display.fill(BLACK);
    display.drawFillRect(0, 0, W, 26, HEADER);
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setTextAlign("center");
    display.drawText("RGB LED", W / 2, 4);
    display.drawFillRoundRect(15, 32, W - 30, 90, 8, swatch);
    display.drawRoundRect(15, 32, W - 30, 90, 8, WHITE);
    display.drawText(label, W / 2, 130);
    display.setTextSize(1);
    display.setTextAlign("left");
    barY = 158;
    display.setTextColor(display.color(255, 80, 80));
    display.drawText("R " + r, 5, barY);
    display.drawRect(52, barY, barMax, 10, DIM);
    if (r > 0) { display.drawFillRect(52, barY, Math.floor(barMax * r / 255), 10, display.color(255, 60, 60)); }
    barY = barY + 18;
    display.setTextColor(display.color(80, 255, 80));
    display.drawText("G " + g, 5, barY);
    display.drawRect(52, barY, barMax, 10, DIM);
    if (g > 0) { display.drawFillRect(52, barY, Math.floor(barMax * g / 255), 10, display.color(60, 220, 60)); }
    barY = barY + 18;
    display.setTextColor(display.color(80, 150, 255));
    display.drawText("B " + b, 5, barY);
    display.drawRect(52, barY, barMax, 10, DIM);
    if (b > 0) { display.drawFillRect(52, barY, Math.floor(barMax * b / 255), 10, display.color(60, 60, 255)); }
    display.setTextColor(DIM);
    display.setTextAlign("center");
    display.drawText("R:GPIO4  G:GPIO16  B:GPIO17", W / 2, 240);
}

var PRESETS = [
    ["Red",     255,   0,   0],
    ["Green",     0, 200,   0],
    ["Blue",      0,   0, 255],
    ["White",   255, 255, 255],
    ["Yellow",  255, 200,   0],
    ["Cyan",      0, 200, 200],
    ["Magenta", 200,   0, 200],
    ["Orange",  255, 100,   0],
    ["Pink",    255,  20, 100],
    ["Warm",    255, 160,  40]
];

function buildPresetOpts() {
    var opts = {};
    var i;
    for (i = 0; i < PRESETS.length; i++) { opts[PRESETS[i][0]] = PRESETS[i][0]; }
    opts["< Back"] = "back";
    return opts;
}

function findPreset(name) {
    var i;
    for (i = 0; i < PRESETS.length; i++) { if (PRESETS[i][0] === name) { return PRESETS[i]; } }
    return null;
}

function doRainbow() {
    var h, rgb;
    dialog.info("Rainbow  -  ESC to stop");
    for (h = 0; h < 1440; h++) {
        if (keyboard.getEscPress()) { break; }
        rgb = hsvToRgb(h % 360, 255, 255);
        setRGB(rgb[0], rgb[1], rgb[2]);
        delay(7);
    }
    ledOff();
}

function doBreathe(r, g, b) {
    var i, br, c;
    dialog.info("Breathe  -  ESC to stop");
    for (c = 0; c < 6; c++) {
        for (i = 0; i <= 255; i += 4) {
            if (keyboard.getEscPress()) { ledOff(); return; }
            br = i / 255.0;
            setRGB(Math.floor(r * br), Math.floor(g * br), Math.floor(b * br));
            delay(6);
        }
        for (i = 255; i >= 0; i -= 4) {
            if (keyboard.getEscPress()) { ledOff(); return; }
            br = i / 255.0;
            setRGB(Math.floor(r * br), Math.floor(g * br), Math.floor(b * br));
            delay(6);
        }
        delay(200);
    }
    ledOff();
}

function doStrobe(r, g, b) {
    var i;
    dialog.info("Strobe  -  ESC to stop");
    for (i = 0; i < 80; i++) {
        if (keyboard.getEscPress()) { break; }
        setRGB(r, g, b);
        delay(40);
        ledOff();
        delay(40);
    }
}

function doPolice() {
    var i;
    dialog.info("Police  -  ESC to stop");
    for (i = 0; i < 40; i++) {
        if (keyboard.getEscPress()) { break; }
        setRGB(255, 0, 0); delay(80);
        ledOff();           delay(40);
        setRGB(255, 0, 0); delay(80);
        ledOff();           delay(80);
        setRGB(0, 0, 255); delay(80);
        ledOff();           delay(40);
        setRGB(0, 0, 255); delay(80);
        ledOff();           delay(80);
    }
}

function doCandle() {
    var i, f;
    dialog.info("Candle  -  ESC to stop");
    for (i = 0; i < 400; i++) {
        if (keyboard.getEscPress()) { break; }
        f = random(180, 255);
        setRGB(clamp(f), clamp(Math.floor(f * 0.35)), 0);
        delay(random(30, 90));
    }
    ledOff();
}

ledOff();

var curR = 0, curG = 0, curB = 0, curLabel = "Off";
var running = true;
var choice, preset, p, effR, effG, effB;

while (running) {
    choice = dialog.choice({
        "Preset Colors": "preset",
        "Custom RGB":    "custom",
        "Rainbow":       "rainbow",
        "Breathe":       "breathe",
        "Strobe":        "strobe",
        "Police Lights": "police",
        "Candle":        "candle",
        "LED Off":       "off",
        "Exit":          "exit"
    });

    if (choice === "preset") {
        preset = dialog.choice(buildPresetOpts());
        if (preset !== "back") {
            p = findPreset(preset);
            if (p) {
                curR = p[1]; curG = p[2]; curB = p[3]; curLabel = p[0];
                setRGB(curR, curG, curB);
                drawUI(curR, curG, curB, curLabel);
                delay(1800);
            }
        }
    } else if (choice === "custom") {
        curR = clamp(parse_int(dialog.prompt("Red (0-255)",   3, to_string(curR))) || 0);
        curG = clamp(parse_int(dialog.prompt("Green (0-255)", 3, to_string(curG))) || 0);
        curB = clamp(parse_int(dialog.prompt("Blue (0-255)",  3, to_string(curB))) || 0);
        curLabel = "Custom";
        setRGB(curR, curG, curB);
        drawUI(curR, curG, curB, curLabel);
        delay(1800);
    } else if (choice === "rainbow") {
        doRainbow();
    } else if (choice === "breathe") {
        effR = curR; effG = curG; effB = curB;
        if (effR === 0 && effG === 0 && effB === 0) { effR = 255; effG = 255; effB = 255; }
        doBreathe(effR, effG, effB);
    } else if (choice === "strobe") {
        effR = curR; effG = curG; effB = curB;
        if (effR === 0 && effG === 0 && effB === 0) { effR = 255; effG = 255; effB = 255; }
        doStrobe(effR, effG, effB);
    } else if (choice === "police") {
        doPolice();
    } else if (choice === "candle") {
        doCandle();
    } else if (choice === "off") {
        ledOff();
        curR = 0; curG = 0; curB = 0; curLabel = "Off";
        drawUI(0, 0, 0, "Off");
        delay(800);
    } else if (choice === "exit") {
        running = false;
    }
}

ledOff();