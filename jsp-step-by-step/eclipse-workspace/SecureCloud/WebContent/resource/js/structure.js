var nowStructBMSEval = "";
$(function () {
    $('#struct-menu').addClass('active');
    $('.selectpicker').selectpicker();

    var nowstructId = location.href.split('=')[1].split('&')[0];
    setCookie('nowStructId', nowstructId, g_cookie_expires);
    setTimeout(function () {
        
        if (nowstructId === undefined) {
            $('#struct-menu ul li:first-child').addClass('active');
        } else {
            $('#struct_' + nowstructId).addClass('active');
        }
    }, 500)

    //$('.page-title span').append(getCookie('systemName'));
    setTimeout(function() {
        structShow(nowstructId);
    }, 50);

    setTimeout(function() {
        structWarning(nowstructId);
    }, 50);

    setTimeout(function() {
        factorStatus(nowstructId);
    }, 100);

    setTimeout(function() {
        var structChart = Object.create(StructChart);
        structChart.init(apiurl, nowstructId);
    }, 500);
    
    $("[data-toggle='tooltip']").tooltip();

    setTimeout(function() {
        getReports(nowstructId);
    }, 100);
    //if (nowstructId == 26) {
    //    var sb = new StringBuffer();
    //    var str = "";
    //    str += '<ul class="nav nav-tabs">';
    //    str += '<li class="active"><a href="#tab_2_1" data-toggle="tab">日报表</a></li>';
    //    str += '<li ><a href="#tab_2_2" data-toggle="tab">月报表</a></li>';
    //    str += '<li ><a href="#tab_2_3" data-toggle="tab">年报表</a></li>';
    //    str += '</ul>';
    //    str += '<div class="tab-content" style="overflow: hidden; width: auto; height: 290px;">';

    //    str += '<div class="tab-pane active" id="tab_2_1">';
    //    str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1"> <h2>adfajf</h2> </div>';
    //    str += '</div>';

    //    str += '<div class="tab-pane " id="tab_2_2">';
    //    str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1"> <h2>hjkghk</h2> </div>';
    //    str += '</div>';

    //    str += '<div class="tab-pane " id="tab_2_3">';
    //    str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1"> <h2>afsfgsdfgdfghjkghk</h2> </div>';
    //    str += '</div>';

    //    str += '</div>';

    //    sb.append(str);

    //    $('#statement').html('');
    //    $('#statement').append(sb.toString());

    //} else {
    //    $('#statement').html("<span class='label label-important label-mini'>无报表</span>");
    //    $('#statement').removeClass('scroller');
    //}
  
})

$("#enterBridgeEval").unbind('click').click(function () {
    var url = document.getElementById('bmsServiceApiURL').value;//BMS发布接口
    url += "/cloudUser/" + getCookie('userId') + "/struct/" + getCookie('nowStructId') + "/eval_cloud/list";//访问BMS路由
    $.ajax({
        url: url,
        type: 'get',
        dataType: "jsonp",
        success: function (data) {
            window.location.href = data;
        },
        error: function (xmlHttpRequest) {
            if (xmlHttpRequest.status == 404) {
                alert('该用户没有相关桥梁技术状况评定系统的信息，无法访问');
            } else {
                alert('访问桥梁技术状况评定系统失败');
            }
        }
    });
});
//结构物名称类显示
function structShow(nowstructId) {

    var userId = getCookie('userId');
    if (userId === '' || userId === null) {
        alert('获取用户Id失败，请检查浏览器Cookie是否已启用');
        logOut();
        return;
    }
    var url = apiurl + '/user/' + userId + '/structs' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data == null || data.length == 0) {
                return;
            }
            //$('.page-title small ul').html("");
            var sb = new StringBuffer();
            var flag = true;
            for (var i = 0; i < data.length; i++) {
                if (data[i].structId == parseInt(nowstructId)) {
                    nowStructBMSEval = data[i].bridgeEval;
                    $('.breadcrumb li small a').html(data[i].structName + '<i class="icon-angle-down"></i>');
                    setCookie('nowStructName', data[i].structName, g_cookie_expires);
                    if (i == 0) {
                        flag = false;
                    }
                } else {
                    if (i > 0 && flag) {
                        sb.append('<li class="divider"></li>');
                    }
                    flag = true;
                    sb.append('<li><a href="/structure.aspx?id=' + data[i].structId + '&imagename=' + data[i].imageName + '">' + data[i].structName + '</a></li>');
                    //$('<li><a href="/structure.aspx?id=' + data[i].structId + '&imagename=' + data[i].imageName + '">' + data[i].structName + '</a></li>').appendTo('.page-title small ul');
                }
            }
            $('.breadcrumb li small ul').html(sb.toString());
            if (nowStructBMSEval == 1) {
                document.getElementById("enterBridgeEval").style.display = "block";
            } else {
                document.getElementById("enterBridgeEval").style.display = "none";
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                alert("登录已超时,请重新登录");
                logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                //alert("内部异常");
            }
            else {
                //alert('url错误75结构物类名称');
            }
        },       
    })   
}


//指定结构物告警展示(包括徽章、告警磁贴内容)
function structWarning(structId) {
    var url = apiurl + '/struct/' + structId + '/warnings/unprocessed' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data === null) {
                return;
            }
            var warnings = data[0].warnings;
           
            var waringSB = new StringBuffer();
            if (warnings.length == 0) {
             
                document.getElementById('warningScroller').style.height = "auto";
                document.getElementById('warningScroller').parentNode.style.height = "auto";

                waringSB.append("<span class='label label-important label-mini'>无告警数据</span>");
            } else {
                for (var i = 0; i < warnings.length; i++) {
                    waringSB.append('<li><div class="col1"><div class="cont"><div class="cont-col1"><div class="label label-important">');
                    waringSB.append('<i class="icon-bell"></i></div></div><div class="cont-col2"><div class="desc">');

                    waringSB.append(warnings[i].source + warnings[i].content);
                    waringSB.append('<a href="/DataWarningTest.aspx?structId=' + structId + '&warningId=' + warnings[i] .warningId+ '"><span class="label label-important label-mini">处理<i class="icon-share-alt"></i></span></a>');
                    waringSB.append('</div></div></div></div><div class="col2"><div class="date">' + nowDateInterval(GetMilliseconds(warnings[i].time)) + '</div></div></li>')

                }
            }
           
            $('.warningList').html(waringSB.toString());
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("权限验证出错");
                logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                $('.warningList').html("<span class='label label-important label-mini'>获取结构物告警失败</span>");
                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                $('.warningList').html("<span class='label label-important label-mini'>获取结构物告警失败</span>");
                //alert("内部异常");
            }
            else {
                $('.warningList').html("<span class='label label-important label-mini'>获取结构物告警失败</span>");
                //alert('url错误126告警');
            }
            document.getElementById('warningScroller').style.height = "auto";
            document.getElementById('warningScroller').parentNode.style.height = "auto";
        }
        //timeout: 3000
    })
}

//监测因素安全状态
function factorStatus(structId) {

    var url = apiurl + '/struct/' + structId + '/factor-status' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data === null || data.length === 0) {
                alert('获取结构物健康状态失败，请联系管理员');
                return;
            }
            var sb = new StringBuffer();
            var entry = data[0].entry;
            //var size = 3;
            
            if (entry.length <= 0) {
                alert('查询监测因素失败，请重试');
                return;
            }

            sb.append('<div class="row-fluid">');

            ////span2的实现效果1
            //var size = 2;
                     
            //for (var i = 0; i < entry.length; i++) {
            //    var status = (entry[i].status === null) ? "无" : entry[i].status;

            //    var factorName = entry[i].factorName;
                
            //    sb.append('<div class="span' + size + ' responsive" data-tablet="span6" data-desktop="span' + size + '"><div class="dashboard-stat green">');

            //    sb.append('<div class="visual"><i class="icon-th-large"></i></div><div class="details"><div class="number">' + status + '</div>');
            //    sb.append('</div><a class="more" href="/MonitorProject/Tab.aspx?themeId=' + entry[i].factorId + '">'+factorName+' <i class="m-icon-swapright m-icon-white"></i></a></div></div>');
            //}

            //span2的实现效果2
            var size = 2;

            for (var i = 0; i < entry.length; i++) {
                var status = (entry[i].status === null) ? "无" : entry[i].status;
                var factorName = entry[i].factorName;
                switch (status) {
                    case "差":
                        sb.append('<div onclick="GotoHref(' + entry[i].factorId + ')" class="tile bg-red"><div class="tile-body"><i class="icon-th-large"></i></div>');
                        break;
                    case "劣":
                        sb.append('<div onclick="GotoHref(' + entry[i].factorId + ')" class="tile bg-orange"><div class="tile-body"><i class="icon-th-large"></i></div>');
                        break;
                    case "中":
                        sb.append('<div onclick="GotoHref(' + entry[i].factorId + ')" class="tile bg-purple"><div class="tile-body"><i class="icon-th-large"></i></div>');
                        break;
                    case "良":
                        sb.append('<div onclick="GotoHref(' + entry[i].factorId + ')" class="tile bg-blue"><div class="tile-body"><i class="icon-th-large"></i></div>');
                        break;
                    case "优":
                        sb.append('<div onclick="GotoHref(' + entry[i].factorId + ')" class="tile bg-green"><div class="tile-body"><i class="icon-th-large"></i></div>');
                        break;
                    default:
                        sb.append('<div onclick="GotoHref(' + entry[i].factorId + ')" class="tile bg-grey"><div class="tile-body"><i class="icon-th-large"></i></div>');
                }
                sb.append('<div class="tile-object"><div class="name">' + factorName + '</div><div class="number">' + status + '</div></div></div>');
            }
     
            //if (entry.length <= 4) {
            //    size = 12 / entry.length;
            //    var status = (entry[0].status === null) ? "无" : entry[0].status;

            //    var factorName = entry[0].factorName;

            //    sb.append('<div class="span' + size + ' responsive" data-tablet="span6" data-desktop="span' + size + '"><div class="dashboard-stat green">');
            //    sb.append('<div class="visual"><i class="icon-th-large"></i></div><div class="details"><div class="number">' + status + '</div><div class="desc">');
            //    sb.append(factorName + '</div></div><a class="more" href="/MonitorProject/Tab.aspx?themeId=' + entry[0].factorId + '">详细 <i class="m-icon-swapright m-icon-white"></i></a></div></div>');

            //    for (var i = 1; i < entry.length; i++) {
            //        status = (entry[i].status === null) ? "无" : entry[i].status;

            //        factorName = entry[i].factorName;
            //        if (i % 2 === 0) {
            //            sb.append('<div class="span' + size + ' responsive" data-tablet="span6 fix-offset" data-desktop="span' + size + ' "><div class="dashboard-stat green">');
            //        } else {
            //            sb.append('<div class="span' + size + ' responsive" data-tablet="span6" data-desktop="span' + size + '"><div class="dashboard-stat green">');
            //        }

            //        sb.append('<div class="visual"><i class="icon-th-large"></i></div><div class="details"><div class="number">' + status + '</div><div class="desc">');
            //        sb.append(factorName + '</div></div><a class="more" href="/MonitorProject/Tab.aspx?themeId=' + entry[i].factorId + '">详细 <i class="m-icon-swapright m-icon-white"></i></a></div></div>');
            //    }

            //} else {

            //    var status = (entry[0].status === null) ? "无" : entry[0].status;

            //    var factorName = entry[0].factorName;

            //    sb.append('<div class="span' + size + ' responsive" data-tablet="span6" data-desktop="span' + size + '"><div class="dashboard-stat green">');
            //    sb.append('<div class="visual"><i class="icon-th-large"></i></div><div class="details"><div class="number">' + status + '</div><div class="desc">');
            //    sb.append(factorName + '</div></div><a class="more" href="/MonitorProject/Tab.aspx?themeId=' + entry[0].factorId + '">详细 <i class="m-icon-swapright m-icon-white"></i></a></div></div>');

            //    for (var i = 1; i < entry.length; i++) {
            //        status = (entry[i].status === null) ? "无" : entry[i].status;

            //        factorName = entry[i].factorName;
            //        if (i % 4 === 0) {
            //            sb.append('</div><div class="row-fluid">');
            //        }
            //        if (i % 2 === 0) {
            //            sb.append('<div class="span' + size + ' responsive" data-tablet="span6 fix-offset" data-desktop="span' + size + ' "><div class="dashboard-stat green">');
            //        } else {
            //            sb.append('<div class="span' + size + ' responsive" data-tablet="span6" data-desktop="span' + size + '"><div class="dashboard-stat green">');
            //        }

            //        sb.append('<div class="visual"><i class="icon-th-large"></i></div><div class="details"><div class="number">' + status + '</div><div class="desc">');
            //        sb.append(factorName + '</div></div><a class="more" href="/MonitorProject/Tab.aspx?themeId=' + entry[i].factorId + '">详细 <i class="m-icon-swapright m-icon-white"></i></a></div></div>');
            //    }

            //}


            sb.append('</div>');
            var content = sb.toString();
            $('#factor_status').html(content);
            
           
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("权限验证出错");
                logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                $('#factor_status').html("<span class='label label-important label-mini'>获取结构物健康状态失败</span>");
                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                $('#factor_status').html("<span class='label label-important label-mini'>获取结构物健康状态失败</span>");
                //alert("内部异常");
            }
            else {
                $('#factor_status').html("<span class='label label-important label-mini'>获取结构物健康状态失败</span>");
                //alert('url错误231健康状态');
            }
        }
        //timeout:3000
    })

}




function statementStruct(structName) {

    var sb =new StringBuffer();
    var str = "";
    str = " <ul class='feeds'><li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
    str += "  <div class='cont-col2'><div class='desc'>最新年报：<a href='javascript:;'>2013年"+structName+"健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
    str += "</div></div><div class='col2'><div class='date'> 2014/02/01</div></div></li>";//最新年报

    str += " <ul class='feeds'><li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
    str += "  <div class='cont-col2'><div class='desc'>最新月报：<a href='javascript:;'>2014年3月" + structName + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
    str += "</div></div><div class='col2'><div class='date'> 2014/04/01</div></div></li>";//最新月报


    str += " <ul class='feeds'><li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
    str += "  <div class='cont-col2'><div class='desc'>最新日报：<a href='javascript:;'>2014年4月08日" + structName + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
    str += "</div></div><div class='col2'><div class='date'> 2014/04/09</div></div></li></ul>";//最新日报


    sb.append(str);

    $('#statement').html('');
    $('#statement').append(sb.toString());
}

function getReports(structId) {
    var sb = new StringBuffer();
    var str = "";
    var temp = "";
    var url_day = apiurl + '/struct/' + structId + '/report/day' + '?token=' + getCookie("token");
    $.ajax({
        url: url_day,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            //str += '<ul class="nav nav-tabs">';
            //str += '<li class="active"><a href="#tab_day" data-toggle="tab">日报表</a></li>';
            //str += '<li><a href="#tab_week" data-toggle="tab">周报表</a></li>';
            //str += '<li ><a href="#tab_month" data-toggle="tab">月报表</a></li>';
            //str += '<li ><a href="#tab_year" data-toggle="tab">年报表</a></li>';
            //str += '</ul>';
            //str += '<div class="tab-content" style="overflow: hidden; width: auto; height: 290px;">';

            str += '<div class="tab-pane active" id="tab_day">';
            str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1">';
            str += '<ul class="feeds">';
            if (data.length == 0) {
                str += '<span class="label label-important label-mini">无日报表</span>';
            }
            else {
                //for (var i = data.length - 1; i >= 0; i--) {
                for (var i = 0; i < data.length; i++) {
                    temp = "";
                    temp += '组织: ' + data[i].OrgName + ';&nbsp;&nbsp;' + '结构物: ' + data[i].StructName + ';&nbsp;&nbsp;' + '报表类型: ' + data[i].DateType + ';&nbsp;&nbsp;' + '生成日期: ' + data[i].time;
                    str += '<li><div class="col1"><div class="cont"><div class="cont-col1"><div class="label label-success"><i class="icon-list-alt"></i></div></div>';
                    // str += '<div class="cont-col2"><div class="desc">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                    str += '<div class="cont-col2"><div class="desc">';
                    str += '<span data-toggle="tooltip" data-placement="bottom" title=" ' + temp + '">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</span>';

                    str += '<a class="label label-important label-mini"  onclick="DownLoadReport(\'' + encodeURIComponent(data[i].rptId) + '\')">下载<i class="icon-share-alt"></i></a>';
                    str += '</div></div></div></div>';
                    str += '<div class="col2">';
                    str += '<div class="date">' + data[i].time + '</div></div></li>';
                }
            }
            str += '</ul>';
            str += '</div></div>';

            var url_week = apiurl + '/struct/' + structId + '/report/week' + '?token=' + getCookie("token");
            $.ajax({
                url: url_week,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    str += '<div class="tab-pane" id="tab_week">';
                    str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1">';
                    str += '<ul class="feeds">';
                    if (data.length == 0) {
                        str += '<span class="label label-important label-mini">无周报表</span>';
                    }
                    else {
                        //for (var i = data.length - 1; i >= 0; i--) {
                        for (var i = 0; i < data.length; i++) {
                            temp = "";
                            temp += '组织: ' + data[i].OrgName + ';&nbsp;&nbsp;' + '结构物: ' + data[i].StructName + ';&nbsp;&nbsp;' + '报表类型: ' + data[i].DateType + ';&nbsp;&nbsp;' + '生成日期: ' + data[i].time;
                            str += '<li><div class="col1"><div class="cont"><div class="cont-col1"><div class="label label-success"><i class="icon-list-alt"></i></div></div>';
                            // str += '<div class="cont-col2"><div class="desc">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                            str += '<div class="cont-col2"><div class="desc">';
                            str += '<span data-toggle="tooltip" data-placement="bottom" title=" ' + temp + '">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</span>';

                            str += '<a class="label label-important label-mini"  onclick="DownLoadReport(\'' + encodeURIComponent(data[i].rptId) + '\')">下载<i class="icon-share-alt"></i></a>';
                            str += '</div></div></div></div>';
                            str += '<div class="col2">';
                            str += '<div class="date">' + data[i].time + '</div></div></li>';
                        }
                    }

                    str += '</ul>';
                    str += '</div></div>';

                    var url_month = apiurl + '/struct/' + structId + '/report/month' + '?token=' + getCookie("token");
                    $.ajax({
                        url: url_month,
                        type: 'get',
                        dataType: 'json',
                        success: function (data) {
                            str += '<div class="tab-pane" id="tab_month">';
                            str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1">';
                            str += '<ul class="feeds">';
                            if (data.length == 0) {
                                str += '<span class="label label-important label-mini">无月报表</span>';
                            }
                            else {
                                // for (var i = data.length - 1; i >= 0; i--) {
                                for (var i = 0; i < data.length; i++) {
                                    temp = "";
                                    temp += '组织: ' + data[i].OrgName + ';&nbsp;&nbsp;' + '结构物: ' + data[i].StructName + ';&nbsp;&nbsp;' + '报表类型: ' + data[i].DateType + ';&nbsp;&nbsp;' + '生成日期: ' + data[i].time;
                                    str += '<li><div class="col1"><div class="cont"><div class="cont-col1"><div class="label label-success"><i class="icon-list-alt"></i></div></div>';
                                    // str += '<div class="cont-col2"><div class="desc">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                                    str += '<div class="cont-col2"><div class="desc">';
                                    str += '<span data-toggle="tooltip" data-placement="bottom" title=" ' + temp + '">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</span>';

                                    str += '<a class="label label-important label-mini"  onclick="DownLoadReport(\'' + encodeURIComponent(data[i].rptId) + '\')">下载<i class="icon-share-alt"></i></a>';
                                    str += '</div></div></div></div>';
                                    str += '<div class="col2">';
                                    str += '<div class="date">' + data[i].time + '</div></div></li>';
                                }
                            }

                            str += '</ul>';
                            str += '</div></div>';

                            var url_year = apiurl + '/struct/' + structId + '/report/year' + '?token=' + getCookie("token");
                            $.ajax({
                                url: url_year,
                                type: 'get',
                                dataType: 'json',
                                success: function (data) {
                                    str += '<div class="tab-pane" id="tab_year">';
                                    str += '<div class="scroller" data-height="290px" data-always-visible="1" data-rail-visible1="1">';
                                    str += '<ul class="feeds">';
                                    if (data.length == 0) {
                                        str += '<span class="label label-important label-mini">无年报表</span>';
                                    }
                                    else {
                                        // for (var i = data.length - 1; i >= 0; i--) {
                                        for (var i = 0; i < data.length; i++) {
                                            temp = "";
                                            temp += '组织: ' + data[i].OrgName + ';&nbsp;&nbsp;' + '结构物: ' + data[i].StructName + ';&nbsp;&nbsp;' + '报表类型: ' + data[i].DateType + ';&nbsp;&nbsp;' + '生成日期: ' + data[i].time;
                                            str += '<li><div class="col1"><div class="cont"><div class="cont-col1"><div class="label label-success"><i class="icon-list-alt"></i></div></div>';
                                            // str += '<div class="cont-col2"><div class="desc">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                                            str += '<div class="cont-col2"><div class="desc">';
                                            str += '<span data-toggle="tooltip" data-placement="bottom" title=" ' + temp + '">' + data[i].reportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</span>';

                                            str += '<a class="label label-important label-mini"  onclick="DownLoadReport(\'' + encodeURIComponent(data[i].rptId) + '\')">下载<i class="icon-share-alt"></i></a>';
                                            str += '</div></div></div></div>';
                                            str += '<div class="col2">';
                                            str += '<div class="date">' + data[i].time + '</div></div></li>';
                                        }
                                    }

                                    str += '</ul>';
                                    str += '</div></div>';

                                    //str += '</div>';
                                    sb.append(str);

                                    //$('#statement').html('');
                                    //$('#statement').append(sb.toString());

                                    $('#statement .tab-content').append(sb.toString());
                                },
                                error: function () {

                                }
                            })

                        },
                        error: function () {

                        }
                    })

                },
                error: function () {

                }
            })

        },
        error: function () {

        }
    })

}

function GotoHref(factorId) {
    var href = "/MonitorProject/Tab.aspx?themeId=" + factorId;
    location.href = href;
}