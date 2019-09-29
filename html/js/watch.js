// Let us open a web socket
let ws;
let pc;

let mySd = -1;
let streamerSd = -1;

let viewMsg = true;
const videoElem = document.getElementById("stream_video");

function WebSocketTest() {

    if ("WebSocket" in window) {
        console.log("WebSocket is supported by your Browser!");

        ws = new WebSocket(WS_URL);
        ws.binaryType = 'arraybuffer';

        function sendToStreamer(obj) {
            obj.from = mySd;
            ws.send("to" + streamerSd + JSON.stringify(obj));
        }

        ws.onopen = function () {

            let window_url = window.location.href;
            let hosturl = window_url.substr(0, window_url.indexOf("watch.php"));

            // Web Socket is connected, send data using send()
            ws.send(JSON.stringify({
                "href": (hosturl + getParameterByName("v"))
            }));
            console.error("Message is sent...");
        };

        ws.onmessage = function (evt) {
            let received_msg = evt.data;
            //console.log("Message is received...");
            if (viewMsg) {
                console.log(received_msg);
            }

            if (received_msg[0] == 't') {
                received_msg = received_msg.substring(received_msg.indexOf("{"));
            }
            console.log(received_msg);

            // {"watcher":5,"streamer":4}

            let obj = JSON.parse(received_msg);
            if (obj["desc"]) {
                on_rtc_signal(pc, obj["desc"], sendToStreamer, videoElem);
            } else if (obj["ice_candidate"]) {
                on_rtc_signal(pc, obj["ice_candidate"], sendToStreamer);
            } else if (obj["watcher"]) {
                mySd = obj["watcher"];
                streamerSd = obj["streamer"];

                sendToStreamer({
                    "request_stream": 1,
                    "watcher": mySd
                });

                watch_call(sendToStreamer, videoElem, ws, { "ping": 1 }).then((result) => {
                    pc = result;
                });
            } else if ("pong" in obj) {
                document.getElementById("viewer_count").innerHTML = obj["pong"];
                setTimeout(function(){ sendToStreamer( { "ping" : 1 } ); }, PINGTIMER);
            }
        };

        ws.onclose = function () {

            // websocket is closed.
            console.log("Connection is closed...");

            //WebSocketTest();
        };
    } else {

        // The browser doesn't support WebSocket
        console.log("WebSocket NOT supported by your Browser!");
    }
}

window.onload = () => {
    WebSocketTest();
}