/**
 * ---------------------------------------------------------------------------------
 * <copyright file="alarmBadge.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2015 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：告警徽章js文件
 *
 * 创建标识：PengLing20150820
 *
 * 修改标识：
 * 修改描述：
 * </summary>
 * ---------------------------------------------------------------------------------
 */

/**
 * 创建所有结构物告警徽章及告警信息
 */
function createWarningBadgeAndContentByUser() {
    var userId = getCookie('userId');
    if (userId === '' || userId === null) {
        alert('获取用户Id失败，请检查浏览器Cookie是否已启用');
        logOut();
        return;
    }
    var url = apiurl + '/user/' + userId + '/warning-count/unprocessed' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data == null || data.count == 0) {
                $('.badge').html("");
                $('.notification').html('<li><p>不存在未确认告警</p></li>');
                return;
            }
            var warningCount = data.count;
            $('.badge').html(warningCount);

            $('.notification').html('');
            $('.notification').append('<li><p>存在' + warningCount + '个未确认告警</p></li>');

            createWarningContentByUser(userId);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错，禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户未确认告警数目时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 创建所有结构物告警徽章内容
 */
function createWarningContentByUser(userId) {
    var url = apiurl + '/user/' + userId + '/warnings/unprocessed' + '?token=' + getCookie("token") + '&startRow=1&endRow=15';
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data == null || data.length === 0) {
                return;
            }
            var len = data.length;
            var count = 0;
            var badge = new StringBuffer();
            for (var i = 0; i < len; i++) {
                if (count > 5) { // alarm badge content is limited up to 6.
                    break;
                }
                var content = data[i].source + data[i].content;
                if (content.length > 22) {
                    content = content.substring(0, 21);
                    content = content + '…';
                }
                badge.append('<li><a href="/DataWarningTest.aspx?warningId=' + data[i].warningId
                    + '" onclick="setnowStructId(' + data[i].structId
                    + ')" ><span class="label label-info"><i class="icon-bell"></i></span>'
                    + content + '&nbsp;&nbsp;&nbsp;&nbsp;<span class="time">'
                    + nowDateInterval(GetMilliseconds(data[i].lastTime)) + '</span></a></li>');
                count++;
            }
            $('.notification').append(badge.toString());
            $('.notification').append('<li class="external"><a href="/DataWarningTest.aspx">更多<i class="m-icon-swapright"></i></a></li>');
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错，禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户未确认告警内容时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function setnowStructId(structId) {
    setCookie('nowStructId', structId);
}