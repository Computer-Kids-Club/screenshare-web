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
</head>

<body style="background-color: #19171c">

        <div>
            <img src="https://fontmeme.com/permalink/190924/01f6740bfe4c59b1072ff3a5d320a009.png" alt="twitch-logo-font" border="0">
        </div>

        <video id="stream_video" style="width: 70%; margin: 5% 15% 0" playsinline controls autoplay></video>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

  <script src="js/constants.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/rtc_utils.js"></script>
  <script src="js/watch.js"></script>

</body>

</html>
