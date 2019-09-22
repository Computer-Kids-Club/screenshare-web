<?php

$current_page = "stream";

?>

<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />

  <title>Screen</title>

  <link rel="stylesheet" href="css/main.css">
</head>

<body>
  <div class="wrapper">
    <?php
    include("header.php");
    ?>

    <div class="content-wrapper">
      <section class="content-header">
        <h1>
          Stream
        </h1>
      </section>

      <section class="content">
        <p>You are streaming at: </p>
        <a href="" id="stream_link" target="_blank"></a>
        <br />

        <video id="video" width="512px" autoplay></video>
        <br />

      </section>

    </div>

    <footer class="main-footer">
      <strong>Copyright &copy; 2019 Screenshare.Pro.</strong> All rights reserved.
    </footer>

  </div>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

  <script src="js/constants.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/rtc_utils.js"></script>
  <script src="js/stream.js"></script>

</body>

</html>