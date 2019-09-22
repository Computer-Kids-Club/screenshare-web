<ul class="nav-list">
  <li class="nav-list-item">
    <?php if ($current_page == 'watch') { ?>
      <a class="active nav-list-stream" href="/">
        <img src="res/img/watch.png" alt="Watch">
      </a>
    <?php } else { ?>
      <a class="<?php if ($current_page == 'stream') echo 'active '; ?>nav-list-stream" href="/">
        <img src="res/img/stream.png" alt="Stream">
      </a>
    <?php }  ?>
  </li>
  <li class="nav-list-item">
    <a <?php if ($current_page == 'contact') {
          echo 'class="active"';
        } ?> href="contact.php">
      Contact
    </a>
  </li>
  <li class="nav-list-item">
    <a <?php if ($current_page == 'about') {
          echo 'class="active"';
        } ?> href="about.php">
      About
    </a>
  </li>
</ul>