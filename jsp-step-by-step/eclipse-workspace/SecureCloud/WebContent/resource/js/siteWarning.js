/**
 * ---------------------------------------------------------------------------------
 * <copyright file="siteWarning.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2014 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：Site.Master的告警处理相关js文件
 *
 * 创建标识：PengLing20141117
 *
 * 修改标识：
 * 修改描述：
 * </summary>
 * ---------------------------------------------------------------------------------
 */

/**
 * 创建结构物告警徽章及告警信息
 */ 
function createWarningBadgeAndContent(structId) {
    var url = apiurl + '/struct/' + structId + '/warning-count/unprocessed' + '?token=' + getCookie("token");
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

            createWarningContent(structId);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错，禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物未确认告警数目时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 告警徽章展示
 */
function createWarningContent(structId) {
    var url = apiurl + '/struct/' + structId + '/warnings/unprocessed' + '?token=' + getCookie("token") + '&startRow=1&endRow=15';
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function(data) {
            if (data.length == 0) {
                return;
            }
            var len = data[0].warnings.length;
            for (var i = 0; i < len; i++) {
                var content = data[0].warnings[i].source + data[0].warnings[i].content;
                if (content.length > 22) {
                    content = content.substring(0, 21);
                    content = content + '…';
                }
                $('.notification').append('<li><a href="/DataWarningTest.aspx?warningId=' + data[0].warnings[i].warningId + '" ><span class="label label-info"><i class="icon-bell"></i></span>' + content + '&nbsp;&nbsp;&nbsp;&nbsp;<span class="time">' + nowDateInterval(GetMilliseconds(data[0].warnings[i].time)) + '</span></a></li>');
                if (i >= 5) { // 列表最多显示6项
                    break;
                }
            }
            $('.notification').append('<li class="external"><a href="/DataWarningTest.aspx">更多<i class="m-icon-swapright"></i></a></li>');
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错，禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物未确认告警内容时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}