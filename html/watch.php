<?php

$current_page = "watch";

?>

<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />

  <title>Watch</title>

  <link rel="stylesheet" href="css/main.css">
</head>

<body>
  <div class="wrapper">
    <?php
    include("header.php");
    ?>

    <div class="content-wrapper">
      <div class="content-header">
        <h1>
          Watch
        </h1>
      </div>

      <div class="content">

        <video id="stream_video" playsinline controls autoplay></video>

      </div>

    </div>

    <footer class="main-footer">
      <strong>Copyright &copy; 2019 Screenshare.Pro.</strong> All rights reserved.
    </footer>

  </div>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

  <script src="js/constants.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/rtc_utils.js"></script>
  <script src="js/watch.js"></script>

</body>

</html>
