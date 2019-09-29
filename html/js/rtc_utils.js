const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
const constraints = {
    video: true
};

let iceServers = {
    iceServers: [{
            url: 'stun:numb.viagenie.ca'
        }, {
            url: 'turn:numb.viagenie.ca',
            credential: 'kVM9BYPhk9Dx9SA',
            username: 'ao.shen@gmail.com'
        }
        /*, {
                url: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }, {
                url: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }*/
    ]
};

for (let url of STUN_SERVERS) {
    iceServers.iceServers.push({
        urls: url
    });
}

function init_rtc_connection(sendTo) {
    const pc = new RTCPeerConnection(iceServers);

    // send any ice candidates to the other peer
    pc.onicecandidate = ({
        candidate
    }) => {
        console.log("on ice candidate");
        sendTo({
            "ice_candidate": {
                candidate
            }
        });
    };

    return pc;
}

let localStream = null;

async function startStream(videoView) {
    console.log('Starting stream');
    try {
        const displayMediaOptions = {
            video: {
                cursor: "always"
            },
            audio: true
        };
        // get local stream, show it in self-view and add it to be sent
        localStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        videoView.srcObject = localStream;
    } catch (err) {
        console.error(err);
    }
}

async function stream_call(sendTo) {
    console.log('Starting stream calls');

    if (localStream == null) {
        await startStream()
    }

    let pc = init_rtc_connection(sendTo);

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    /*pc.oniceconnectionstatechange = function (evt) {
        if (pc.iceConnectionState === "failed") {
            pc.createOffer({
                    iceRestart: true
                })
                .then((offer) => {
                    console.log("ice failed, send offer again")
                    return pc.setLocalDescription(offer);
                })
                .then(() => {
                    sendTo({
                        "desc": {
                            desc: pc.localDescription
                        }
                    });
                });
        }
    }*/

    try {
        console.log("make stream offer");
        let offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // send the offer to the other peer
        sendTo({
            "desc": {
                desc: pc.localDescription
            }
        });
    } catch (err) {
        console.error(err);
    }

    return pc;
}

async function watch_call(sendTo, videoView, ws, obj) {
    console.log('Starting watch calls');

    let pc = init_rtc_connection(sendTo);

    // once remote track media arrives, show it in remote video element
    pc.ontrack = (event) => {
        // don't set srcObject again if it is already set.
        console.log('got track');
        obj.from = mySd;
        console.log("SENDING SENDING SENDING");
        console.log("to" + streamerSd + JSON.stringify(obj));
        ws.send("to" + streamerSd + JSON.stringify(obj));
        if (videoView.srcObject) return;
        videoView.srcObject = event.streams[0];
        console.log(event.streams[0]);
        videoView.onloadedmetadata = function (e) {
            videoView.play();
        };

        obj.from = mySd;
        console.log("SENDING SENDING SENDING");
        console.log("to" + streamerSd + JSON.stringify(obj));
        ws.send("to" + streamerSd + JSON.stringify(obj));
    };

    return pc;
}

async function on_rtc_signal(pc, {
    desc,
    candidate
}, sendTo, videoView) {
    try {
        if (desc) {
            // if we get an offer, we need to reply with an answer
            if (desc.type === 'offer') {
                await pc.setRemoteDescription(desc);
                /*const displayMediaOptions = {
                    video: {
                        cursor: "always"
                    },
                    audio: true
                };
                const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));*/
                if (!videoView.srcObject) {
                    videoView.srcObject = pc.getRemoteStreams()[0];
                }
                await pc.setLocalDescription(await pc.createAnswer());
                console.log("sent answer:", pc.localDescription);
                sendTo({
                    "desc": {
                        desc: pc.localDescription
                    }
                });
            } else if (desc.type === 'answer') {
                console.log("got answer");
                await pc.setRemoteDescription(desc);
            } else {
                console.log('Unsupported SDP type.');
            }
        } else if (candidate) {
            await pc.addIceCandidate(candidate);
        }
    } catch (err) {
        console.error(err);
    }
}