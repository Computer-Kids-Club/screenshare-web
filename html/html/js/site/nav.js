let sidebar_open = true;

function toggleNav() {
    if (sidebar_open) {
        sidebar_open = false;
        $(".nav-list").css("width", "0px");
        $(".main-header").css("padding-left", "0px");
        $(".content-wrapper").css("margin-left", "0px");
        $(".main-footer").css("margin-left", "0px");
    } else {
        sidebar_open = true;
        $(".nav-list").css("width", "100px");
        $(".main-header").css("padding-left", "100px");
        $(".content-wrapper").css("margin-left", "100px");
        $(".main-footer").css("margin-left", "100px");
    }
}