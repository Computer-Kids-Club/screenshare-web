function parseImg(msg, pixels, canvas) {
    let parseHead = 0;
    let curPixel = 0;
    let repPixel = 0;

    if (msg.length < 8) return;

    canvas.width = decode64(msg, 4, parseHead);
    parseHead += 4;
    canvas.height = decode64(msg, 4, parseHead);
    parseHead += 4;

    while (parseHead < msg.length) {
        if (msg[parseHead] == ",") {
            parseHead++;
            curPixel = decode64(msg, 4, parseHead) * 4;
            parseHead += 4;
        } else {
            let clr = decode64(msg, 4, parseHead);
            parseHead += 4;
            pixels.data[curPixel + 2] = clr & 0xff;
            clr = clr >>> 8;
            pixels.data[curPixel + 1] = clr & 0xff;
            clr = clr >>> 8;
            pixels.data[curPixel + 0] = clr & 0xff;
            pixels.data[curPixel + 3] = 255;
            curPixel += 4;
            if (msg[parseHead] == ".") {
                parseHead++;
                let repPixelCnt = decode64(msg, 4, parseHead);
                parseHead += 4;
                repPixel = curPixel - 4;
                while (repPixelCnt > 0) {
                    pixels.data[curPixel + 0] = pixels.data[repPixel + 0];
                    pixels.data[curPixel + 1] = pixels.data[repPixel + 1];
                    pixels.data[curPixel + 2] = pixels.data[repPixel + 2];
                    pixels.data[curPixel + 3] = 255;
                    curPixel += 4;
                    repPixelCnt--;
                }
            }
        }
    }
}

function encodePixel(pixelData) {
    return encode64((pixelData[1] << 16) + (pixelData[2] << 8) + pixelData[3], 4);
}

function encodeFrame(frameData, width, height) {

    if (frameData.length == 0) return "";

    let clrRepCnt = 0;
    let clrRep = 0;

    let encoded = encode64(width, 4) + "" + encode64(height, 4);

    encoded += "," + encode64(frameData[0][0] / 4, 4) + encodePixel(frameData[0]);
    let i = 0;
    for (; i < frameData.length - 1; i++) {
        if (frameData[i][0] + frameCycleSize * 4 == frameData[i + 1][0]) {
            if (Math.pow(frameData[clrRep][1] - frameData[i + 1][1], 2) +
                Math.pow(frameData[clrRep][2] - frameData[i + 1][2], 2) +
                Math.pow(frameData[clrRep][3] - frameData[i + 1][3], 2) < 30 * 30) {
                clrRepCnt++;
            } else {
                if (clrRepCnt > 1) {
                    encoded += "." + encode64(clrRepCnt, 4);
                    console.log("clrRepCnt", clrRepCnt);
                } else if (clrRepCnt == 1) {
                    encoded += encodePixel(frameData[i]);
                }
                encoded += encodePixel(frameData[i + 1]);
                clrRepCnt = 0;
                clrRep = i + 1;
            }
        } else {
            if (clrRepCnt > 1) {
                encoded += "." + encode64(clrRepCnt, 4);
                console.log("clrRepCnt", clrRepCnt);
            } else if (clrRepCnt == 1) {
                encoded += encodePixel(frameData[i]);
            }
            clrRepCnt = 0;
            clrRep = i + 1;
            console.log("pixel index skip", (frameData[i + 1][0] - frameData[i][0]) / 4);
            encoded += "," + encode64(frameData[i + 1][0] / 4, 4) + encodePixel(frameData[i + 1]);
        }
    }
    if (clrRepCnt > 1) {
        encoded += "." + encode64(clrRepCnt, 4);
    } else if (clrRepCnt == 1) {
        encoded += encodePixel(frameData[i]);
    }
    return encoded;
}

/*let stream = null;
let mediaRecorder = null;
let chunks = [];
let reader = new FileReader();
let savedUrls = [];
let previousFrame = null;

let frameCycle = 0;
let frameCycleSize = 1;

let extraSpaceOffset = 0;

function onFrame() {
    canvas.width = video.videoWidth * RES_COMPRESSION;
    canvas.height = video.videoHeight * RES_COMPRESSION;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let frameChanges = [];
    let currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let bufferRange = 0;
    let bufferColor = [255, 255, 255];
    if (previousFrame != null) {
        frameCycle = (frameCycle + 7) % frameCycleSize;
        for (let i = 4 * frameCycle; i < currentFrame.length && frameChanges.length < 50000; i += 4 * frameCycleSize) {
            if (Math.pow(previousFrame[i] - currentFrame[i], 2) +
                Math.pow(previousFrame[i + 1] - currentFrame[i + 1], 2) +
                Math.pow(previousFrame[i + 2] - currentFrame[i + 2], 2) > 20 * 20) {
                bufferRange = 30;
                bufferColor = [currentFrame[i], currentFrame[i + 1], currentFrame[i + 2]];
            } else if (Math.pow(bufferColor[0] - currentFrame[i], 2) +
                Math.pow(bufferColor[1] - currentFrame[i + 1], 2) +
                Math.pow(bufferColor[2] - currentFrame[i + 2], 2) > 10 * 10) {
                bufferRange = 0;
            }
            if (bufferRange > 0) {
                frameChanges.push([i, currentFrame[i], currentFrame[i + 1], currentFrame[i + 2]]);
                bufferRange--;
            }
        }

        let extraSpace = Math.max(0, 10000 - 1000 - frameChanges.length);

        for (let i = 0; i < extraSpace; i++) {
            frameChanges.push([extraSpaceOffset, currentFrame[extraSpaceOffset], currentFrame[extraSpaceOffset + 1], currentFrame[extraSpaceOffset + 2]]);
            extraSpaceOffset = (extraSpaceOffset + 4) % currentFrame.length;
        }

        for (let i = 0; i < frameChanges.length; i++) {
            previousFrame[frameChanges[i][0]] = frameChanges[i][1];
            previousFrame[frameChanges[i][0] + 1] = frameChanges[i][2];
            previousFrame[frameChanges[i][0] + 2] = frameChanges[i][3];
        }
    } else {
        previousFrame = currentFrame;
        for (let i = 0; i < previousFrame.length; i += 4) {
            previousFrame[i + 0] = 255;
            previousFrame[i + 1] = 255;
            previousFrame[i + 2] = 255;
        }
    }

    let frameChangeArrayBuffer = encodeBinaryFrame(frameChanges, canvas.width, canvas.height);

    if (frameChangeArrayBuffer.byteLength <= 0) {
        // this is not possible
    } else if (frameChangeArrayBuffer.byteLength < 65000) {
        ws.send(frameChangeArrayBuffer);
    } else {
        let chunk = 15000;
        for (let i = 0, j = frameChanges.length; i < j; i += chunk) {
            let temparray = frameChanges.slice(i, i + chunk);
            ws.send(encodeBinaryFrame(temparray, canvas.width, canvas.height));
        }
    }
}*/


/*const canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d', {
    alpha: false
});

async function startCapture(displayMediaOptions) {
    let captureStream = null;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

    } catch (err) {
        console.error("Error: " + err);
    }


    return captureStream;
}*/

/*startCapture(displayMediaOptions)
    .then((result) => {
        video.srcObject = result;
        stream_call(result);

        setInterval(function () {
            if (wsOpen) {
                onFrame();
            }
        }, STREAM_FRAME_INTERVAL);

    });*/

/*let c = document.getElementById("canvas");
c.width = 1920 * RES_COMPRESSION;
c.height = 1080 * RES_COMPRESSION;
let ctx = c.getContext("2d");
var pixels = ctx.getImageData(0, 0, c.width, c.height);

var image = new Image();
image.onload = function () {
    c.width = image.width;
    c.height = image.height;
    ctx.drawImage(image, 0, 0);
};*/

/*try {
    pixels = ctx.getImageData(0, 0, c.width, c.height);
    parseBinaryFrame(received_msg, pixels, c);
    ctx.putImageData(pixels, 0, 0);
} catch (err) {
    console.error(err);
}*/

const SEL_CLR = 0b0;
const SEL_OP_PIX_INC = 0b001;
const SEL_OP_PIX_IDX = 0b011;
const SEL_OP_CLR_REP_4 = 0b101;
const SEL_OP_CLR_REP_11 = 0b111;
const OP_PIX_INC = 0b00;
const OP_PIX_IDX = 0b01;
const OP_CLR_REP_4 = 0b10;
const OP_CLR_REP_11 = 0b11;

let DEBUG = false;

function parseBinaryFrame(msg, pixels, canvas) {
    let curPixel = 0;
    let repTblIdx = 0;

    let buffer = new BinaryBuffer();
    buffer.fromArrayBuffer(msg);

    let payloadSize = buffer.popUInt(20);

    canvas.width = buffer.popUInt(14);
    canvas.height = buffer.popUInt(14);

    let clrTblSize = buffer.popUInt(8);

    let clrTbl = [];

    for (let i = 0; i < clrTblSize; i++) {
        let y = buffer.popUInt(COLOR_DEFINITION_Y_BITS);
        let cb = 16 * buffer.popUInt(COLOR_DEFINITION_C_BITS) - 128;
        let cr = 16 * buffer.popUInt(COLOR_DEFINITION_C_BITS) - 128;
        let r = y + 1.402 * cr;
        let g = y - 0.344136 * cb - 0.714136 * cr;
        let b = y + 1.772 * cb;
        clrTbl.push([r, g, b]);
    }

    if (DEBUG) {
        console.log(clrTblSize);
        console.log(clrTbl);
    }

    while (buffer.bitsPopped < payloadSize) {

        // get selector
        let sel = buffer.popUInt(1);

        if (sel == SEL_CLR) {
            // get color
            let clrTblIdx = buffer.popUInt(COLOR_NUMBER_BITS);
            pixels.data[curPixel + 0] = clrTbl[clrTblIdx][0];
            pixels.data[curPixel + 1] = clrTbl[clrTblIdx][1];
            pixels.data[curPixel + 2] = clrTbl[clrTblIdx][2];
            pixels.data[curPixel + 3] = 255;
            repTblIdx = clrTblIdx;
            curPixel += 4;
        } else {
            // get opcode
            let opcode = buffer.popUInt(2);
            if (opcode == OP_PIX_INC) {
                // get pixel increment
                curPixel += (buffer.popUInt(4)) * 4;
            } else if (opcode == OP_PIX_IDX) {
                // get pixel index
                curPixel = buffer.popUInt(21) * 4;
            } else {
                let clrRepCnt = 0;
                if (opcode == OP_CLR_REP_4) {
                    // get color repeat 4
                    clrRepCnt = buffer.popUInt(4) + 1;
                } else {
                    // get color repeat 11
                    clrRepCnt = buffer.popUInt(11);
                }
                while (clrRepCnt > 0) {
                    pixels.data[curPixel + 0] = clrTbl[repTblIdx][0];
                    pixels.data[curPixel + 1] = clrTbl[repTblIdx][1];
                    pixels.data[curPixel + 2] = clrTbl[repTblIdx][2];
                    pixels.data[curPixel + 3] = 255;
                    curPixel += 4;
                    clrRepCnt--;
                }
            }
        }
    }
}

function encodeBinaryFrame(frameData, width, height) {

    let buffer = new BinaryBuffer();

    if (frameData.length == 0) return buffer.toArrayBuffer();

    let clrRepCnt = 0;
    let clrRep = 0;
    let lastPixIdx = -1;

    // bump for payload size
    buffer.pushUInt(0, 20);

    // width and height
    buffer.pushUInt(width, 14);
    buffer.pushUInt(height, 14);

    let clrTbl = new ColorTable(frameData);

    buffer.pushUInt(clrTbl.colorTable.length, 8);

    for (const clr of clrTbl.colorTable) {
        let r = clr[0];
        let g = clr[1];
        let b = clr[2];
        let y = 0.299 * r + 0.587 * g + 0.114 * b;
        let cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        let cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        buffer.pushUInt(y, COLOR_DEFINITION_Y_BITS);
        buffer.pushUInt(Math.floor(cb / 16), COLOR_DEFINITION_C_BITS);
        buffer.pushUInt(Math.floor(cr / 16), COLOR_DEFINITION_C_BITS);
    }

    let i = 0;
    for (; i < frameData.length; i++) {

        if (frameData[i][0] / 4 - lastPixIdx == 1) {
            // consecutive
            // do nothing
        } else {
            if (clrRepCnt > 0) {
                while (clrRepCnt >= 2047) {
                    buffer.pushUInt(SEL_OP_CLR_REP_11, 3);
                    buffer.pushUInt(2047, 11);
                    clrRepCnt -= 2047;
                }
                if (clrRepCnt > 16) {
                    buffer.pushUInt(SEL_OP_CLR_REP_11, 3);
                    buffer.pushUInt(clrRepCnt, 11);
                    clrRepCnt = 0;
                }
                if (clrRepCnt > 0) {
                    buffer.pushUInt(SEL_OP_CLR_REP_4, 3);
                    buffer.pushUInt(clrRepCnt - 1, 4);
                    clrRepCnt = 0;
                }
            }
            if (frameData[i][0] / 4 - lastPixIdx <= 16 && frameData[i][0] / 4 - lastPixIdx > 0) {
                // less than or equal to 16 apart
                // send a 4 bit increment
                buffer.pushUInt(SEL_OP_PIX_INC, 3);
                buffer.pushUInt(frameData[i][0] / 4 - lastPixIdx - 1, 4);
            } else {
                // more than 16 apart
                // send a 21 bit index
                buffer.pushUInt(SEL_OP_PIX_IDX, 3);
                buffer.pushUInt(frameData[i][0] / 4, 21);
            }
        }
        lastPixIdx = frameData[i][0] / 4;

        let integratedClr = (frameData[i][1] << 16) + (frameData[i][2] << 8) + frameData[i][3];
        let clrTblIdx = clrTbl.colorMap[integratedClr];
        if (clrRep == clrTblIdx) {
            // if the color is close enough
            clrRepCnt++;
        } else {
            while (clrRepCnt >= 2047) {
                buffer.pushUInt(SEL_OP_CLR_REP_11, 3);
                buffer.pushUInt(2047, 11);
                clrRepCnt -= 2047;
            }
            if (clrRepCnt > 16) {
                buffer.pushUInt(SEL_OP_CLR_REP_11, 3);
                buffer.pushUInt(clrRepCnt, 11);
                clrRepCnt = 0;
            }
            if (clrRepCnt > 0) {
                buffer.pushUInt(SEL_OP_CLR_REP_4, 3);
                buffer.pushUInt(clrRepCnt - 1, 4);
                clrRepCnt = 0;
            }
            buffer.pushUInt(SEL_CLR, 1);
            buffer.pushUInt(clrTblIdx, COLOR_NUMBER_BITS);
            clrRep = clrTblIdx;
        }
    }
    if (clrRepCnt > 0) {
        while (clrRepCnt >= 2047) {
            buffer.pushUInt(SEL_OP_CLR_REP_11, 3);
            buffer.pushUInt(2047, 11);
            clrRepCnt -= 2047;
        }
        if (clrRepCnt > 16) {
            buffer.pushUInt(SEL_OP_CLR_REP_11, 3);
            buffer.pushUInt(clrRepCnt, 11);
            clrRepCnt = 0;
        }
        if (clrRepCnt > 0) {
            buffer.pushUInt(SEL_OP_CLR_REP_4, 3);
            buffer.pushUInt(clrRepCnt - 1, 4);
            clrRepCnt = 0;
        }
        clrRepCnt = 0;
    }

    let payloadSize = buffer.bitCount();
    buffer.buffer[0] = payloadSize & 0b11111111;
    buffer.buffer[1] = (payloadSize >>> 8) & 0b11111111;
    buffer.buffer[2] = (buffer.buffer[2] & 0b11110000) | ((payloadSize >>> 16) & 0b00001111);

    return buffer.toArrayBuffer();
}


// Note: data is stored in little endian order

//  --------   --------   ---00000   |   curByte   
//  --------   ---11111   11111111   |   num  
//  ------11   11111111   11100000   |   curByte  
//  00000011   11111111   11100000   |   curByte 
// [11100000] [11111111] [00000011]  V   buffer  

// [11100000] [11111111] [00000011]  V   buffer 
//  --------   --------   11100000   |   curByte  
//  --------   --------   -----111   |   num  
//  --------   --------   11111111   |   curByte  
//  --------   -----111   11111111   |   num  
//  --------   --------   00000011   |   curByte  
//  --------   ---11111   11111111   |   num  

const TRUNCATE = [
    0b00000000,
    0b00000001,
    0b00000011,
    0b00000111,
    0b00001111,
    0b00011111,
    0b00111111,
    0b01111111
]

class BinaryBuffer {
    constructor() {
        this.buffer = [];
        this.curByte = 0;
        this.curByteOffset = 0;
        this.popIndex = 0;
        this.bitsPopped = 0;
    }

    pushUInt(num, bits) {

        this.curByte = this.curByte | (num << this.curByteOffset);
        this.curByteOffset += bits;
        while (this.curByteOffset >= 8) {
            this.buffer.push(this.curByte & 0xFF);
            this.curByte = this.curByte >>> 8;
            this.curByteOffset -= 8;
        }
    }

    toArrayBuffer() {
        if (this.curByteOffset > 0) {
            this.buffer.push(this.curByte);
            this.curByteOffset = 0;
            this.curByte = 0;
        }
        var byteArray = new Uint8Array(this.buffer.length);
        byteArray.set(this.buffer, 0);
        return byteArray.buffer;
    }

    fromArrayBuffer(arrayBuffer) {
        this.buffer = new Uint8Array(arrayBuffer);
        this.curByteOffset = 0;
        this.curByte = this.buffer[0];
        this.popIndex = 1;
    }

    popUInt(bits) {
        let num = 0;
        let bitsWritten = 0;

        if (this.curByteOffset + bits < 8) {
            num = (this.curByte >> this.curByteOffset) & TRUNCATE[bits];
            this.curByteOffset += bits;
            bitsWritten += bits;
        }

        while (bitsWritten < bits) {
            if (this.curByteOffset > 0) {
                num = this.curByte >>> this.curByteOffset;
                bitsWritten += (8 - this.curByteOffset);
                this.curByteOffset = 0;
                this.curByte = this.buffer[this.popIndex];
                this.popIndex++;
            } else if (bits - bitsWritten >= 8) {
                num = num | (this.curByte << bitsWritten);
                bitsWritten += 8;
                this.curByte = this.buffer[this.popIndex];
                this.popIndex++;
            } else {
                this.curByteOffset = bits - bitsWritten;
                num = num | ((this.curByte & TRUNCATE[this.curByteOffset]) << bitsWritten);
                bitsWritten += this.curByteOffset;
            }
        }

        this.bitsPopped += bits;
        return num;
    }

    bitCount() {
        return this.buffer.length * 8 + this.curByteOffset;
    }
}