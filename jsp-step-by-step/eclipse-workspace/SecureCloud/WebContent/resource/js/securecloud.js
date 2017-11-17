﻿/*
//-----------------securecloud.js为“云平台”公用js文件-----------------//
*/

var g_cookie_expires = 7;

$(function () {
    var logoStyle = getLogoStyle();
    var img;
    if (getCookie("OrgLogo") != null && getCookie("OrgLogo") != "" && getCookie("OrgLogo") != "null") {
        img = '<img src="resource/img/OrgLogo/' + getCookie("OrgLogo") + '?r=' + Math.random() + '" alt="logo" style="' + logoStyle + '" />';
        $('.OrgLogoContain').html(img);
    } else {
        img = '<img src="resource/uipackage/logo/logo.png?r=' + Math.random() + '" alt="logo" style="' + logoStyle + '" />';
        $('.OrgLogoContain').html(img);
    }
});

function getLogoStyle() {
    var defaultLogoStyle = "width:100px; height:20px;";

    var themeConfig = getThemeConfig();

    if (themeConfig == null || $.isEmptyObject(themeConfig)) {
        return defaultLogoStyle;
    }

    var logoStyle = themeConfig.logoStyle;
    if (logoStyle == null || logoStyle.trim() === "") {
        logoStyle = "width:100px; height:20px;";
    }
    return logoStyle;
}

function getThemeConfig() {
    var themeConfig = {};
    
    var projectName = window.location.pathname.split('/')[1];
    var dataroot = "/" + projectName +  "/resource/uipackage/data/data.json";
    $.ajaxSettings.async = false;
    $.getJSON(dataroot, function (data) { // press "F5", data may be null
        themeConfig = data;
    });

    return themeConfig; // themeConfig may be {}, null or other ajax callback result
}

//接口访问url公共部分
function getRootPath() {
    var strFullPath = window.document.location.href;
    var strPath = window.document.location.pathname;
    //考虑移动端点击登录时候不会执行这段js，直接进入页面strPath获取的是'/',定位'/'在'http://192.168.1.103/'里的位置会返回5，从而出错，现在默认去掉字符串的最后一位
    if (strPath == '/') {
        var prePath = strFullPath.substring(0, strFullPath.length - 1);
    }
    else {
        var pos = strFullPath.indexOf(strPath);
        var prePath = strFullPath.substring(0, pos);
    }      
    return prePath;
}
// var apiurl = getRootPath() + "/Proxy.ashx?path=";

function logOut() {
    var url = getCookie("loginUrl");
    if (getCookie("loginUrl") == "") {
        url = "/logOut.aspx";
    }

    var token = getCookie('token');
    if (token != null && token != '') {
        $.ajax({
            type: 'post',
            async: false,
            url: apiurl + '/user/logout/' + token
        });        

        delCookie("loginname");
        delCookie("userId");
        delCookie("orgId");
        delCookie("organization");
        delCookie("systemName");
        delCookie("roleId");
        delCookie("portal");
        delCookie("nowStructId");
        delCookie('nowStructName');
        delCookie('CurrentSectionId');
        delCookie('SectionStructName');
        delCookie("supportStructIds");
        delCookie("OrgLogo");
        delCookie("token");
    }
    window.top.location.href = url;
}

//设置cookie值
function setCookie(c_name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = c_name + "=" + encodeURIComponent(value) + ";path=/" +
    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}

//获取cookie值
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return decodeURIComponent(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

//删除cookie值
function delCookie(c_name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(c_name);
    document.cookie = c_name + "=" + cval + ";path=/" + ";expires=" + exp.toGMTString();
}

//字符串缓冲
function StringBuffer() {
    this.data = [];
}

StringBuffer.prototype.append = function () {
    this.data.push(arguments[0]);
    return this;
}

StringBuffer.prototype.toString = function () {
    return this.data.join("");
}

function alertTips(parameters, tipcolor, containerId, timeout) {

    $('#' + containerId).html('<div class="row-fluid" id="alert-tip' + containerId + '" style="display: none;">' +
        '<span class="label" id="alert-tip-text'+containerId+'" style="margin-top: 5px;">01</span></div>');

    var alerttext = $('#alert-tip-text'+containerId);

    if (alerttext.text() == parameters)
        return;

    $('#alert-tip'+containerId).slideToggle();
    $('#alert-tip-text'+containerId).html(parameters);
    $('#alert-tip-text'+containerId).remove('label-success').remove('label-important');
    $('#alert-tip-text' + containerId).addClass(tipcolor);
    if (timeout != undefined) {
        setTimeout(function () {
            $('#alert-tip' + containerId).slideToggle();
            $('#alert-tip-text' + containerId).html(' ');
        }, timeout);
    }     
}

//input中屏蔽特殊字符的输入，如：<input disabled="disabled" type="text" id='userNameToEdit' onkeypress="TextValidate()" />
function TextValidate() {
    var code;
    var character;
    if (document.all) //判断是否是IE浏览器
    {
        code = window.event.keyCode;
    }
    else {
        code = arguments.callee.caller.arguments[0].which;
    }
    var character = String.fromCharCode(code);

    var txt = new RegExp("[ ,\\`,\\~,\\!,\\@,\#,\\$,\\%,\\^,\\+,\\*,\\&,\\\\,\\/,\\?,\\|,\\:,\\.,\\<,\\>,\\{,\\},\\(,\\),\\',\\;,\\=,\"]");
    //特殊字符正则表达式
    if (txt.test(character)) {
        alert("密码不可以包含以下特殊字符:\n , ` ~ ! @ # $ % ^ + & * \\ / ? | : . < > {} () [] \" ");
        if (document.all) {
            window.event.returnValue = false;
        }
        else {
            arguments.callee.caller.arguments[0].preventDefault();
        }
    } 
}

// 2015-05-04 自动登录
function handleAutoLogin() {
    if ($.cookie('token') === null) {
        window.location.href = '/login.html';
        return;
    };

    if ($.cookie('portal') == "U") { // User
        // 根据结构物类型确定首页
        var url = apiurl + '/user/' + $.cookie('userId') + '/org/' + $.cookie('orgId') + '/structs' + '?token=' + $.cookie("token");
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            success: function(dataStruct) {
                if (dataStruct.length == 0) {
                    return;
                }
                try {
                    if (dataStruct[0].structType == "无线采集") {
                        setCookie("gprsStructId", dataStruct[0].structId, null); // 保存结构物id
                        window.location.href = "/GPRS/MainPage.aspx";
                    } else {
                        window.location.href = "/index.aspx";
                    }
                } catch (err) {
                    alert(err);
                }
            },
            error: function() {
                logOut();
            }
        });
    } else { // Manager
        enterManageHerf();
    }
}

//获取监测因素的展示单位
function getUnits(structId, factorId) {
    var url = apiurl + '/struct/' + structId + '/factor/' + factorId + '/units?token=' + $.cookie("token");
    var units = [];
    $.ajax({
        url: url,
        type: 'get',
        async: false,
        success: function(data) {
            units = data;
        },
        error: function() {
           // alert('获取单位失败！');
        }
    });

    return units;
}

//获取监测因素的默认单位
function getFactorUnits(factorId) {
    var url = apiurl + '/factor/' + factorId + '/units?token=' + $.cookie("token");
    var units = [];
    $.ajax({
        url: url,
        type: 'get',
        async: false,
        success: function (data) {
            units = data;
        },
        error: function () {
            //alert('获取原始单位失败！');
        }
    });

    return units;
}

//获取监测因素的默认精度
function getFactorDis(factorId) {
    var url = apiurl + '/factor/' + factorId + '/dis?token=' + $.cookie("token");
    var dis = [];
    $.ajax({
        url: url,
        type: 'get',
        async: false,
        success: function (data) {
            if (data.length > 0) {
                dis = data[0].dis.split(',');
            };
        },
        error: function () {
            //alert('获取精度失败！');
        }
    });

    return dis;
}


function enterManageHerf() {
    var userId = getCookie('userId');
    var oneLocation = "";

    //查询跳转页
    var url = apiurl + '/user/' + userId + '/menuList?token=' + getCookie("token");

    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data == null || data.length == 0) {
                alert('请联系管理员配置资源权限');
                return;
            }
            for (var i = 0; i < data.length; i++) {
                if (i == 0) {
                    if (data[i].RESOURCE_MENU.split(',')[2] != 'javascript:;') {
                        oneLocation = data[i].RESOURCE_MENU.split(',')[2];
                    } else {
                        if (data[i].data.length > 0) {
                            oneLocation = data[i].data[0].RESOURCE_MENU.split(',')[2];
                        }
                    }
                }
            }
            window.location.href = oneLocation;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            logOut();
        }
    });
}

//进入管理侧跳转
function enterManageInterface() {
    enterManageHerf();
}

//进入用户侧跳转
function userInitHerf(orgId) {
    var userId = getCookie('userId');
    // 根据结构物类型确定首页
    var url = apiurl + '/user/' +userId  + '/org/' + orgId + '/structs' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (dataStruct) {
            if (dataStruct.length == 0) {
                alert("该组织无结构物");
                return;
            }
            try {
                if (dataStruct[0].structType == "无线采集") {
                    setCookie("gprsStructId", dataStruct[0].structId, null); // 保存结构物id
                    window.location.href = "/GPRS/MainPage.aspx";
                }
                else {
                	var projectName = window.location.pathname.split('/')[1];
                    window.location.href = "/" + projectName + "/index.jsp";
                }
            } catch (err) {
                alert(err);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var status = XMLHttpRequest.status;
            if (status == 403) {
                alert("权限验证出错，禁止访问");
                // logOut();
            } else {
                alert("获取组织结构物" + textStatus);
            }
        }
    });
}

//进入用户侧跳转
function enterUserInterface() {
    var orgId = getCookie('orgId');
    if (orgId == "null") {
        orgId = -1;
    }
    userInitHerf(orgId);
}


function testDigital(s) {
    if (/^(\d)\1+$/.test(s)) return false;  // 全一样
    var str = s.replace(/\d/g, function ($0, pos) {
        return parseInt($0) - pos;
    });
    if (/^(\d)\1+$/.test(str)) return false;  // 顺增

    str = s.replace(/\d/g, function ($0, pos) {
        return parseInt($0) + pos;
    });
    if (/^(\d)\1+$/.test(str)) return false;  // 顺减
    return true;
}
function testLetter(s) {
    var str1 = "abcdefghijklmnopqrstuvwsyz";
    var str2 = "zyswvutsrqponmlkjihgfedcba";
    if (/^([a-zA-Z])\1+$/.test(s)) return false;  // 全一样
    var len = s.length;
    var start = s.substring(0, 1);
    var end = s.substring(len - 1, len);
    var strasce = str1.substring(str1.indexOf(start), str1.indexOf(end) + 1);
    if (s == strasce) return false;// 顺增
    var strdec = str2.substring(str2.indexOf(start), str2.indexOf(end) + 1);
    if (s == strdec) return false;// 顺减
    return true;
}



