radix = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";

function encode64(num, pad = 0) {

    encoded = "";
    for (var di = 0;
        (pad == 0 && num > 0) || di < pad; di++) {
        encoded = radix[num & 63] + encoded;
        num = num >>> 6;
    }

    if (encoded == "") {
        encoded = "0";
    }

    return encoded;
}

xidar = {};
for (var i = 0; i < radix.length; i++) {
    xidar[radix[i]] = i;
}

function decode64(encoded, pad = 0, start = 0) {

    num = 0;
    for (var di = 0; di < pad; di++) {
        num = (num << 6) + xidar[encoded[start + di]];
    }

    return num;
}