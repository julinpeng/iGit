﻿// 页面初始
var themetext = {
    title: "",
    copyright: "",
    project: "",
    loginBg: false
};


$(function () {
    //console.debug("进入");

    initThemeText();
    var id = document.getElementsByTagName("title");
    if (typeof (id) != "undefined" && themetext.title != null) {
        document.title = themetext.title;
    }

    id = document.getElementById("copyright");
    if (typeof (id) != "undefined" && themetext.copyright != null) {
        id.innerHTML = themetext.copyright;
    }

    if (/login.(jsp)|(.html)$/g.test(document.location.pathname) || document.location.pathname === '/') {
        if (themetext.project === "安心云") {
            $('.anxinyun-nav').show();
        }

        var $shouyangLoginHeader = $('#shouyang-login-header');
        if (themetext.project === "寿阳") {
            $shouyangLoginHeader.show();
        } else {
            $shouyangLoginHeader.hide();
        }

        if (themetext.loginBg) {            
            $('.login').css('background', themetext.loginBgColor + ' url("resource/uipackage/logo/' + themetext.loginBg + '") no-repeat center 0');
            $('.login').css('margin-top', 60);
            $('.login .content').css('margin-top', themetext.loginBgY);
            $('.login .content').css('margin-left', themetext.loginBgX);
            $('.login .form-title').html('');
        } else {
            $('.login')[0].setAttribute('style', 'background-color:#2492a3 !important');
        }
    }

    if (/\/Support\/MainPage.aspx$/g.test(document.location.pathname)) {
        var $shouyangHomepageTitle = $('#shouyang-homepage-title');
        if (themetext.project === "寿阳") {
            $shouyangHomepageTitle.show();
        } else {
            $shouyangHomepageTitle.hide();
        }
    }
});

function initThemeText() {
	var projectName = window.location.pathname.split('/')[1];
    var dataroot = "/" + projectName +  "/resource/uipackage/data/data.json";
    $.ajaxSettings.async = false;
    $.getJSON(dataroot, function (data) {
        //console.debug(data.title);
        //console.debug(data.copyright);
        themetext.title = data.title;
        themetext.copyright = data.copyright;
        themetext.project = data.project;
        themetext.loginBg = data.loginBg ? data.loginBg : false;
        themetext.loginBgY = data.loginBgY ? data.loginBgY : 120;
        themetext.loginBgX = data.loginBgX ? data.loginBgX : "auto";
        themetext.loginBgColor = data.loginBgColor ? data.loginBgColor : '#fff';
    });
    //$.ajaxSettings.async = true;
    // var text = { "title": "", "copyright": "Copyright &copy; 2014 <a class='copyright' href='http://www.free-sun.com.cn'>飞尚科技</a> &ndash; <a class='copyright' href='http://www.miitbeian.gov.cn'>苏ICP备13030678号</a>" };
    // var text = { "title": "", "copyright": ""};
}