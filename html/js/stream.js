// Let us open a web socket
let ws;
let pc_map = {};

let mySd = -1;

let wsOpen = false;

const video = document.querySelector('video');
const pingTimer = 5000;

let viewerDict = {};

function WebSocketTest() {

    const displayMediaOptions = {
        video: {
            cursor: "always"
        },
        audio: true
    };

    if ("WebSocket" in window) {
        console.log("WebSocket is supported by your Browser!");

        ws = new WebSocket(WS_URL);

        function sendToWatcher(watcherSd) {
            return function (obj) {
                obj.from = mySd;
                ws.send("to" + watcherSd + JSON.stringify(obj));
            }
        }

        function sendMessage(obj, watcherSd) {
            obj.from = mySd;
            ws.send("to" + watcherSd + JSON.stringify(obj));
        }

        setInterval(function() {
            console.log("RUNNING THE FUNCTION");
            console.log(viewerDict);
                currentTime = (new Date()).getTime();
                for (let key in viewerDict) {
                    if (currentTime - viewerDict[key] > pingTimer) {
                        console.log("DELETING RN RN RN");
                        delete viewerDict[key];
                    }
                }
            }, pingTimer);

        ws.onopen = function () {

            // Web Socket is connected, send data using send()
            ws.send(JSON.stringify({
                "hrefs": window.location.href
            }));

            console.log("Message is sent...");
        };

        ws.onmessage = function (evt) {
            let received_msg = evt.data;
            console.log("Message is received...");
            console.log(received_msg);

            if (received_msg[0] == 't') {
                received_msg = received_msg.substring(received_msg.indexOf("{"));
            }

            // {"url":"https://screenshare.pro/4","streamer":4}

            let obj = JSON.parse(received_msg);
            if (obj["request_stream"]) {
                stream_call(sendToWatcher(obj["watcher"])).then((result) => pc_map[obj["watcher"]] = result);
                
            } else if (obj["desc"]) {
                on_rtc_signal(pc_map[obj["from"]], obj["desc"], sendToWatcher(obj["from"]));
            } else if (obj["ice_candidate"]) {
                on_rtc_signal(pc_map[obj["from"]], obj["ice_candidate"], sendToWatcher(obj["from"]));
            } else if (obj["url"]) {
                wsOpen = true;

                mySd = obj["streamer"];

                let stream_link = document.getElementById("stream_link");
                stream_link.href = obj.url;
                stream_link.innerText = obj.url;

                startStream(video);
            } else if (obj["ping"]) {
                viewerDict[obj["from"]] = (new Date()).getTime();

                setTimeout(function(){ sendMessage( { "pong" : 1 }, obj["from"]); }, pingTimer);
            }
        };

        ws.onclose = function () {

            // websocket is closed.
            console.log("Connection is closed...");
            wsOpen = false;
        };
    } else {

        // The browser doesn't support WebSocket
        console.log("WebSocket NOT supported by your Browser!");
    }
}

window.onload = () => {
    WebSocketTest();
}