// 由于index和mapGIS被拆开，获取struct-state的接口调用了两次，因此在两边定义一个cache，互为缓存
var structStateCache2;

$(function() {
    //创建index页面标题
    var systemName = getCookie('systemName');

    if (systemName != null && systemName != "" && systemName != "null") {
        //$('.pageT font').append(systemName);
        $('#SysName').append(systemName);
    } else {
        //$('.pageT font').append("(该用户下暂无组织)");
        $('#SysName').append("(该用户下暂无组织)");
    }

    var username = getCookie('loginname');

    $('#lblUser').html(username);

    window.setTimeout(createStrucMenu, 50);

    window.setTimeout(createWarningBadgeAndContentByUser, 300);
    
    $("[data-toggle='tooltip']").tooltip();
});

//生成结构物菜单、结构物状态
function createStrucMenu() {
    var userId = getCookie('userId');
    if (userId === '' || userId === null) {
        alert('获取用户Id失败，请检查浏览器Cookie是否已启用');
        logOut();
        return;
    }

    if (window.structStateCache != undefined) {
        buildStructStateBar(structStateCache);
        return;
    }

    var url = apiurl + '/user/' + userId + '/struct-state' + '?token=' + getCookie("token");

    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            structStateCache2 = data;
            buildStructStateBar(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("权限验证出错");
                logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                $('#tipNoData-health').html("<span class='label label-important label-mini'>结构物健康状态加载失败</span>");
                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                $('#tipNoData-health').html("<span class='label label-important label-mini'>结构物健康状态加载失败</span>");
                //alert("内部异常");
            }
            else {
                $('#tipNoData-health').html("<span class='label label-important label-mini'>结构物健康状态加载失败</span>");
                //alert('url错误');
            }
        }
    });
}

function buildStructStateBar(data) {
    if (data == null || data.length == 0) {
        $('#tipNoData-health').html('<span class="label label-important label-mini">当前用户无结构物</span>');
        return;
    }
    var strucSB = new StringBuffer();
    var dataAjax = [];
    for (var i = 0; i < data.length; i++) {
        var dataResource = {
            "org_name": {
                "display": "",
                "pinyin": ""
            },
            "struct_name": {
                "display": "",
                "pinyin": ""
            },
            "structState": "",
            "structLineProgress": "",
            "strcut_warningCount": {
                "display": "",
                "shuzi": 0
            },
            "structLatestReport": "",
            "displayNone": "",
            "displayNone2": ""
        };
        var structId = data[i].structId;
        if (i === 0) {
            setCookie('nowStructId', structId, null); // set for click the menu '告警管理' directly.
        }
        strucSB.append('<li><a href="/structure.aspx?id=' + structId + '&imagename=' + data[i].imageName + '">' + data[i].structName + '</a></li>');

        var d = [];
        d.push(data[i].orgName);
        d.push("<a href='/structure.aspx?id=" + structId + "&imagename=" + data[i].imageName + "'>" + data[i].structName + "</a>");
        switch (data[i].status) {
            case "差":
                d.push('<span style="color:#ff0000">差</span>');
                break;
            case "劣":
                d.push('<span style="color:#ff8000">劣</span>');
                break;
            case "中":
                d.push('<span style="color:#a757a8">中</span>');
                break;
            case "良":
                d.push('<span style="color:#0000ff">良</span>');
                break;
            case "优":
                d.push('<span style="color:#00ff00">优</span>');
                break;
            default:
                d.push('<span style="color:#555D69">无</span>');
        }

        var lineProgress = data[i].lineProgress;
        if (lineProgress.length > 0) {            
            var strLine = "";
            for (var k = 0; k < lineProgress.length; k++) {
                strLine += '<div class="cont-col2"><div class="desc">';
                strLine += '<span data-toggle="tooltip" data-placement="bottom" title=" ">'+ lineProgress[k].LineName + "：" + lineProgress[k].LineProgressDes + '&nbsp;&nbsp;' + '</span>';
                strLine += '<a class="label label-mini" href="#viewLine" style="float:right;" class="editor_viewLine" onclick="viewLine(' + lineProgress[k].LineId + ')" data-toggle="modal"><i class="icon-share-alt"></i></a>';
                strLine += '</div></div>';
            }
            d.push(strLine);            
        } else {
            d.push("无");
        }
        d.push(data[i].warningCount + "&nbsp;&nbsp;<a class='label label-mini' href='/DataWarningTest.aspx' style='float:right;' onclick='setnowStructId(" + structId + ")'><i class='icon-share-alt'></i></a>");

        var latestReport = data[i].latestReport;
        if (latestReport.length > 0) {            
            var strReport = "";
            for (var j = 0; j < latestReport.length; j++) {
                strReport += '<div class="cont-col2"><div class="desc">';
                strReport += '<span data-toggle="tooltip" data-placement="bottom" title=" ">' + latestReport[j].ReportName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + '</span>';
                strReport += '<a class="label label-important label-mini" style="float:right;" onclick="DownLoadReport(\'' + encodeURIComponent(latestReport[j].ReportId) + '\')">下载<i class="icon-share-alt"></i></a>';
                strReport += '</div></div>';
            }
            d.push(strReport);
        } else {
            d.push("无");
        }
        var pinyin = new Pinyin();
        d.push(pinyin.getFullChars(data[i].orgName).toLowerCase());
        d.push(pinyin.getCamelChars(data[i].orgName).toLowerCase());
        d.push(pinyin.getFullChars(data[i].structName).toLowerCase());
        d.push(pinyin.getCamelChars(data[i].structName).toLowerCase());

        dataResource["org_name"]["display"] = d[0];
        dataResource["org_name"]["pinyin"] = d[6];
        dataResource["struct_name"]["display"] = d[1];
        dataResource["struct_name"]["pinyin"] = d[8];
        dataResource["structState"] = d[2];
        dataResource["structLineProgress"] = d[3];
        dataResource["strcut_warningCount"]["display"] = d[4];
        dataResource["strcut_warningCount"]["shuzi"] = Number(data[i].warningCount);
        dataResource["structLatestReport"] = d[5];
        dataResource["displayNoneOrg"] = d[6];
        dataResource["displayNoneOrg2"] = d[7];
        dataResource["displayNoneStruct"] = d[8];
        dataResource["displayNoneStruct2"] = d[9];
        dataAjax.push(dataResource);
    }

    $('.structure-list').html(strucSB.toString());
       
    StructState_Datatable(dataAjax);
}
function StructState_Datatable(sb) {
    $('#tableStructState').dataTable({
        "aLengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "全部"]
        ],
        "data": sb,
        "iDisplayLength": 10,
        "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        "oLanguage": {
            "sUrl": "resource/language/zn_CN.txt"
        },
        "sPaginationType": "full_numbers",
        "aoColumnDefs": [{
            'bSortable': false,
            'aTargets': [2,3,5]
        },
        {
            "targets": [4],
            "type": "num"
        },
        {
            "targets": [6, 7, 8, 9],
            "visible": false
        }],
        columns: [
             {
                 data: {
                     _: "org_name.display",
                     sort: "org_name.pinyin"
                 }
             },
            {
                data: {
                    _: "struct_name.display",
                    sort: "struct_name.pinyin"
                }
            },
            { data: "structState" },
            { data: "structLineProgress" },
            {
                data: {
                    _: "strcut_warningCount.display",
                    sort: "strcut_warningCount.shuzi"
                }
            },
            { data: "structLatestReport" },
            { data: "displayNoneOrg" },
            { data: "displayNoneOrg2" },
            { data: "displayNoneStruct" },
            { data: "displayNoneStruct2" }
        ]
    });
}

function viewLine(lineId) {
    var url = apiurl + "/struct/" + lineId + "/progressInfo/list" + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,//清理缓存
        success: function (data) {
            if (data.length >= 1) {
                var sb = new StringBuffer();
                for (var i = 0; i < data.length; i++) {
                    if (data[i].ConstructLength != null) {
                        var lineLength = data[i].LineLength + '(' + data[i].Unit1 + ')';
                        var constructLengthUnit = data[i].ConstructLength + '(' + data[i].Unit1 + ')';
                        var dataTime = MillisecondsToDateTime(GetMilliseconds(data[i].DataTime));
                        var nowProgress = getProgress(data[i].ConstructLength, data[i].LineLength);
                        var constructDescription = data[i].ConstructDescription == null ? "无" : data[i].ConstructDescription;
                        sb.append("<tr>");
                        sb.append("<td>" + lineLength + "</td>");//线路长度 
                        sb.append("<td>" + constructLengthUnit + "</td>");//施工长度
                        sb.append("<td>" + nowProgress + "</td>");//进度
                        sb.append("<td>" + dataTime + "</td>");//时间
                        sb.append("<td >" + constructDescription + "</td>");//施工状况
                        sb.append(" </tr>");
                    }
                }
                $('#viewLine-tbody').html(sb.toString());
            } else {
                $('#viewLine-tbody').html("");
            }
        }
    });
}

function getProgress(a, b) {
    var nowProgress;
    nowProgress = parseFloat((a / b) * 100);
    return $.number(nowProgress, 2) + "%";
}