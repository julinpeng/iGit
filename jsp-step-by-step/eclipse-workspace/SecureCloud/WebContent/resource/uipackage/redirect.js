// 页面重定向
var project = "";
var fileName = "";
$(function () {
    //console.debug("进入");

    initThemeText();
    
        if (project != "安心云") {
            window.location.href = "login.html";
        }
    
});

function pageName() {
    var strUrl = location.href;
    var arrUrl = strUrl.split("/");
    var strPage = arrUrl[arrUrl.length - 1];
    return strPage;
}

function initThemeText() {
    fileName = pageName();
    var dataroot = "/resource/uipackage/data/data.json";
        $.ajaxSettings.async = false;
        $.getJSON(dataroot, function (data) {
            project = data.project;
        });
}