<?php

$current_page = "stream";

?>

<!DOCTYPE html>
<html style="width: 100%; height: 80vw; overflow: hidden">

<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />

  <title>🔴 Streaming 🔴</title>

  <link rel="stylesheet" href="css/main.css">

    <style>
@font-face {
    font-family: 'twitch font';
    src: url('css/fonts/dimis___-webfont.woff2') format('woff2'),
         url('css/fonts/dimis___-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
</style>
</head>

<body style="background: #dbe9ff;">
    <a href="/"><h1 class="stream_header" style="font-family: 'twitch font';
    color: #3e81ed;
    font-size: 400%;
    margin: 0.5% 0;
    text-align: center;" >ScreenShare.pro</h1></a>

        <section>
        <p>You are streaming at: </p>
        <a href="" id="stream_link" target="_blank"></a>
        <br />

        <video id="video" width="512px" autoplay controls playsinline></video>
        <br />

      </section>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

  <script src="js/constants.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/rtc_utils.js"></script>
  <script src="js/stream.js"></script>

</body>

</html>