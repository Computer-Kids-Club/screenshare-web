<?php

$current_page = "watch";

?>

<!DOCTYPE html>
<html style="width: 100%; overflow: hidden">

<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />

  <title>Watch</title>

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

<body style="background-color: #19171c">

        <a><h1 class="stream_header" style="font-family: 'twitch font';
    color: white;
    font-size: 400%;
    margin: 1% 0;
    text-align: center;" >ScreenShare.pro</h1></a>

        <video id="stream_video" style="width: 70%; margin: 0 15%" playsinline controls autoplay></video>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

  <script src="js/constants.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/rtc_utils.js"></script>
  <script src="js/watch.js"></script>

</body>

</html>
