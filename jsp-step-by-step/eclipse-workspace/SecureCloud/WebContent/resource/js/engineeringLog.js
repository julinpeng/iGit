/**
 * ---------------------------------------------------------------------------------
 * <copyright file="engineeringLog.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2015 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：工程日志js文件
 *
 * 创建标识：zhangminghua201601026
 *
 * 修改标识：
 * 修改描述：
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var g_structId = null;
var g_userId = null;
var viewStart = null;
var viewEnd = null;
var editFlag = 0;//是否是编辑操作
var g_logType_template = [];//日志类型和对应模板内容
var eventTypeFlag = 0;//结构物下是否配置日志类型
var loggingData = {};//添加修改日志记录数据
var eventTypeItems = {};//日志类型对应子节点检查项
var eventTitles = {};//结构物下所有日志记录标题
var currEventInfo = { "LogId": 0, "ConfigId": 0, "EventTypeId": 0 };
$(document).ready(function () {
    $("#EngineeringLog").addClass("active");
    g_userId = getCookie("userId");
    if (g_userId === "") {
        alert("获取用户编号失败, 请检查浏览器Cookie是否已启用");
        logOut();
        return;
    }
    g_structId = getCookie("nowStructId");
    showCurrentStructNameList(g_structId);
    fullCalendarInit();
    //默认最新时间
    $("#dpform").val(showDateText(0));
    $("#dpdend").val(showDateText(0));
    $('#listStruct').change(onchangeStruct);
    $("#eventType").change(onchangeEventType);
    $("#inputTitle").mouseover(function () {
        if ($(this).val() === "") {
            $(this).attr("title", "少于30个字,只允许包含字母、数字、汉字及- _ +字符");
        } else {
            $(this).attr("title", $(this).val());
        }
    });
});

function fullCalendarInit() {
    $("#calendar").fullCalendar({
        header: {
            //left: "prevYear, prev, today, next, nextYear",
            //center: "title",
            left: "title",
            //right: "prevYear,prev,today,next,nextYear, year,month,basicWeek,basicDay "
            right: "prevYear,prev,today,next,nextYear,year,month,agendaWeek,agendaDay"
        },
        selectable: true,
        selectHelper: true,
        lang: "zh-cn",
        weekNumbers: true,
        buttonIcons: {
            prev: "left-single-arrow",
            next: "right-single-arrow",
            prevYear: "left-double-arrow",
            nextYear: "right-double-arrow"
        },
        allDaySlot: true,
        height: "auto",
        editable: false,
        eventLimit: true, // allow "more" link when too many events
        views: {
            month: {
                eventLimit: 6 // adjust to 6 only for month
            }
            //agenda: {
            //    eventLimit: 6 // adjust to 6 only for agendaWeek/agendaDay
            //}
            //basicWeek: {
            //    eventLimit: 6 
            //},
            //basicDay: {
            //    eventLimit: 6 
            //}
        },
        eventLimitText:function(a) {
            return "更多...";
        },
        displayEventTime: true,//日志事件显示开始时间
        timeFormat: "H:mm",//H 24小时制
        eventClick: function(calEvent, jsEvent, view) {
            editFlag = 1;
            $("#btnDelete").css("display", "block");
            $("#createEventModal").modal();
            $("#modalTitle").html("编辑事件");

            var eventStart = moment(calEvent.start).format("YYYY-MM-DD HH:mm:ss");
            var eventEnd = moment(calEvent.end).format("YYYY-MM-DD HH:mm:ss");
            $("#dpform").val(eventStart);
            $("#dpdend").val(eventEnd);
            $("#inputTitle").val(calEvent.title);
            if (calEvent.description != null) {
                $("#inputDescription").val(calEvent.description);
            } else {
                $("#inputDescription").val("");
            }
            var logId = calEvent.id.split('-')[0];
            var configId = calEvent.id.split('-')[1];
            var eventTypeId = calEvent.id.split('-')[2];
            currEventInfo.LogId = logId;
            currEventInfo.ConfigId = configId;
            currEventInfo.EventTypeId = eventTypeId;
            $("#eventType").find("option[value='eventTypeId-" + eventTypeId + "-" + configId + "']").attr("selected", true);
            onchangeEventType();
            $("#eventType").prop("disabled", true);

            var url = apiurl + "/struct/constructionLog/" + logId + "/detail?token=" + getCookie("token");
            $.ajax({
                url: url,
                type: "get",
                dataType: "json",
                success: function (data) {
                    if (data == null || data.length === 0) {
                        return;
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            $("#item-" + data[i].ItemId).val(data[i].Comment);
                        }
                    }
                },
                error: function (xhr) {
                    if (xhr.status === 403) {
                        logOut();
                    } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                        alert("获取日志记录详细检查项时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
                    }
                }
            });
        },
        eventMouseover: function(calEvent, jsEvent, view) {
            //$(this)[0].style.cursor = "hand";
            this.style.cursor = "pointer";
            //$(this).css("border-color", "red");

        },
        eventAfterRender: function(event, element) {
            var tooltip;
            if (event.description !== "") {
                var des = event.description;
                if (des != null && des.length >= 100) {
                    tooltip = des.substring(0, 100) + "...";
                } else
                    tooltip = des;
            } else
                tooltip = event.title;
            $(element).attr("data-original-title", tooltip);
            $(element).tooltip({ container: "body" });
        },
        //日程点击：添加日程
        dayClick: function(date, allDay, jsEvent, view) {
            if (eventTypeFlag === 1) {
                $("#eventType").prop("disabled", false);
                var beginDate = moment(date).format("YYYY-MM-DD HH:mm:ss");
                var endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                endDate = endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate() + " 00:00:00";
                endDate = endDate.replace(/\b(\w)\b/g, "0$1"); //时间的格式
                editFlag = 0;
                $("#btnDelete").css("display", "none");
                $("#createEventModal").modal();
                $("#modalTitle").html("新增事件");
                $("#inputTitle").val("");
                $("#dpform").val(beginDate);//默认为点击日程的那个时间
                $("#dpdend").val(endDate);//默认为点击日程的那个时间加一天
                $("#inputDescription").val("");
                var eventTypeId = parseInt($('#eventType').find('option:selected')[0].value.split('-')[1]);
                for (var i = 0; i < eventTypeItems["Type-" + eventTypeId].length; i++) {
                    $("#item-" + eventTypeItems["Type-" + eventTypeId][i]).val("无");
                }
            }
        },
        events: function(start, end, timezone, callback) {
            var viewStart = moment(start).format("YYYY-MM-DD HH:mm:ss");
            var viewEnd = moment(end).format("YYYY-MM-DD HH:mm:ss");
            var structId = parseInt($('#listStruct').find('option:selected')[0].id.split('optionStruct-')[1]);
            var url = apiurl + "/struct/" + structId + "/constructionLogs/" + viewStart + "/" + viewEnd + "?token=" + getCookie("token");
            $.ajax({
                url: url,
                type: "get",
                dataType: "json",
                success: function(data) {
                    if (data == null || data.length === 0) {
                        return;
                    }
                    var eventArrary = [];
                    for (var i = 0; i < data.length; i++) {
                        eventArrary.push({
                            id: data[i].LogId + "-"+ data[i].ConfigId+"-" + data[i].EventTypeId,
                            title: data[i].LogTitle,
                            start: data[i].LogBeginTime, // will be parsed
                            end: data[i].LogEndTime,
                            description: data[i].LogSummary,
                            color: "#" + data[i].Colour.toString(16)
                        });
                    }
                    //eventArrary.push({ id: '3', resourceId: 'd', start: '2016-01-01', end: '2016-01-02', title: 'event 3' });
                    callback(eventArrary);
                },
                error: function(xhr) {
                    if (xhr.status === 403) {
                        logOut();
                    } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                        alert("获取结构物下事件时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
                    }
                }
            });
        }
    });
}

function showDateText(n) {
    var uom = new Date();
    uom.setDate(uom.getDate() + n);
    uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate() + " " + uom.getHours() + ":" + uom.getMinutes() + ":" + uom.getSeconds();
    return uom.replace(/\b(\w)\b/g, "0$1"); //时间的格式
}
$("#createEventModal").on("show.bs.modal", function () {
    //时间控件
    $("#dpform1").datetimepicker({
        format: "yyyy-MM-dd hh:mm:ss",
        language: "pt-BR"
    });
    $("#dpdend1").datetimepicker({
        format: "yyyy-MM-dd hh:mm:ss",
        language: "pt-BR"
    });
});
function showCurrentStructNameList(nowstructId) {
    var url = apiurl + "/user/" + userId + "/structs" + "?token=" + getCookie("token");
    $.ajax({
        url: url,
        type: "get",
        dataType: "json",
        success: function (data) {
            if (data == null || data.length === 0) {
                return;
            }
            var structOptions = "";
            $.each(data, function (i, item) {
                structOptions += "<option id='optionStruct-" + item.structId
                    + "' value='optionStruct-" + item.structId + "'>" + item.structName + "</option>";
            });
            renderStructChosen(structOptions, nowstructId);
        },
        error: function (xhr) {
            if (xhr.status === 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户下结构物列表时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}
function renderStructChosen(allOptions, selectedOptions) {
    // 刷新结构物列表,下面两行必须！
    $("#listStruct").removeClass("chzn-done");
    $("#listStruct_chzn").remove();
    $("#listStruct").html(allOptions);
    if (selectedOptions != null) {
        $("#listStruct").val("optionStruct-" + selectedOptions);
    }
    $("#listStruct").chosen({
        no_results_text: "没有找到"
    });
    getStructLegend();
}

function onchangeStruct() {
    getStructLegend();
    $('#calendar').fullCalendar('gotoDate', new Date());
    $("#calendar").fullCalendar( 'changeView', "month" );
    $('#calendar').fullCalendar('removeEvents');
    //$('#calendar').fullCalendar('addEventSource', "../calendar/json-events2.php");
    $("#calendar").fullCalendar('refetchEvents');
}

//获取结构物下日志类型
function getStructLegend() {
    var structId = parseInt($('#listStruct').find('option:selected')[0].id.split('optionStruct-')[1]);
    var url = apiurl + "/struct/" + structId + "/constructionLogType?token=" + getCookie("token");
    $.ajax({
        url: url,
        type: "get",
        dataType: "json",
        success: function (data) {
            var sb = new StringBuffer();
            var sbSelect = new StringBuffer();
            $("#eventType").prop("disabled", false);
            if (data == null || data.length === 0) {
                eventTypeFlag = 0;
                sb.append("<tr><td> <span id='eventTypeTip' style='background-color: lightgrey; width: 55px;'>该结构物下未配置日志类型</span></td></tr>");
                sbSelect.append("<option value='eventTypeId-0-0'>无</option>");
                $("#eventTypeLegend").html(sb.toString());
                $("#eventType").html(sbSelect.toString());
                getStructLogTemplate();
                return;
            }
            eventTypeFlag = 1;
            sb.append("<tr>");
            for (var i = 0; i < data.length; i++) {
                sb.append("<td><label style='background-color: #" + data[i].Colour.toString(16) + "; width: 15px; height: 15px;'></label></td><td>&nbsp;" + data[i].Name + "</td>  <td>&nbsp;&nbsp;&nbsp;</td>");
                sbSelect.append("<option value='eventTypeId-" + data[i].Id + "-" + data[i].StructConstructionLogConfigId + "'>" + data[i].Name + "</option>");
            }
            sb.append("</tr>");
            $("#eventTypeLegend").html(sb.toString());
            $("#eventType").html(sbSelect.toString());
            getStructLogTemplate();
            //GetConfigConstructionLogTitle();
        },
        error: function (xhr) {
            if (xhr.status === 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物下日志类型发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

//获取结构物下日志类型模板
function getStructLogTemplate() {
    var structId = parseInt($('#listStruct').find('option:selected')[0].id.split('optionStruct-')[1]);
    var url = apiurl + "/struct/" + structId + "/constructionLog/template?token=" + getCookie("token");
    $.ajax({
        url: url,
        type: "get",
        dataType: "json",
        success: function (data) {
            if (data == null || data.length === 0) {
                return;
            }
            g_logType_template = data;
            onchangeEventType();
        },
        error: function (xhr) {
            if (xhr.status === 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物下日志类型模板发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

//根据选择的日志类型查询记录项
function onchangeEventType() {
    var eventTypeId = parseInt($('#eventType').find('option:selected')[0].value.split('-')[1]);
    if (eventTypeId === 0) {
        $("#tableTemplate").css("display", "none");
        $("#spanTip").css("display", "block");
        return;
    }
    var sb = new StringBuffer();
    var items = [];
    for (var i = 0; i < g_logType_template.length; i++) {
        if (eventTypeId === g_logType_template[i].LogTypeId) {
            for (var j = 0; j < g_logType_template[i].data.length; j++) {
                if (g_logType_template[i].data[j].Items.length > 0) {
                    var rowspan = g_logType_template[i].data[j].Items.length;
                    var categoryName = g_logType_template[i].data[j].CategoryName;
                    for (var k = 0; k < rowspan; k++) {
                        sb.append("<tr>");
                        if (k === 0) {
                            sb.append("<td class='itemClass' rowspan='" + rowspan + "'>" + categoryName + "</td>");
                        }
                        var itemName = g_logType_template[i].data[j].Items[k].ItemName;
                        var itemId = g_logType_template[i].data[j].Items[k].ItemId;
                        sb.append("<td>" + itemName + "</td>");
                        sb.append("<td><textarea id='item-" + itemId + "' rows='2' style='width: 98%' placeholder='最多255个字' maxlength='255'>无</textarea></td>");
                        sb.append("</tr>");
                        items.push(itemId);
                    }
                }
            }
            break;
        }
    }

    eventTypeItems["Type-" + eventTypeId] = items;
    $("#tbodyTemplate").html(sb.toString());
    if (sb.toString().length === 0) {
        $("#tableTemplate").css("display", "none");
        $("#spanTip").css("display", "block");
    } else {
        $("#tableTemplate").css("display", "block");
        $("#spanTip").css("display", "none");
    }
}

function GetConfigConstructionLogTitle() {
    var structId = parseInt($('#listStruct').find('option:selected')[0].id.split('optionStruct-')[1]);
    eventTitles = {};
    var url = apiurl + "/struct/" + structId + "/constructionLogTitle?token=" + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function (data) {
            if (data == null || data.length === 0) {
                return;
            }
            var titleArray = [];
            for (var i = 0; i < data.length; i++) {
                eventTitles["logId-" + data[i].Id] = data[i].Title;
                titleArray.push(data[i].Title);
            }
            eventTitles["logIdAll"] = titleArray;
        },
        error: function (xmlHttpRequest) {
            if (xmlHttpRequest.status === 403) {
                alert("权限验证出错");
                logOut();
            } else if (xmlHttpRequest.status === 400) {
                alert("参数错误");
            } else if (xmlHttpRequest.status === 500) {
                alert("内部异常");
            } else {
                alert('url错误');
            }
        }
    });
}

//编辑日志
$("#btnSave").unbind("click").click(function () {
    //GetConfigConstructionLogTitle();
    var configId = parseInt($('#eventType').find('option:selected')[0].value.split('-')[2]);
    var eventTypeId = parseInt($('#eventType').find('option:selected')[0].value.split('-')[1]);
    var title = $("#inputTitle").val();
    if (!/^[a-zA-Z0-9\u4E00-\u9FA5\-_+]{1,30}$/.test(title)) {
        //alert("标题只允许包含字母、数字、汉字及- _ +字符，请重新输入！");
        $("#inputTitle").focus();
        return null;
    }
    //if (($.inArray(title, eventTitles["logIdAll"]) && editFlag === 0) || (eventTitles["logId-" +currEventInfo.LogId] !== title && editFlag === 1)) {
    //    alert("结构物下一存在该标题，请重新命名");
    //    $("#inputTitle").focus();
    //    return false;
    //}
    var dpformVal = $("#dpform").val();
    if (dpformVal === "") {
        $("#dpform").focus();
        return null;
    }
    var dpdendVal = $("#dpdend").val();
    if (dpdendVal === "") {
        $("#dpdend").focus();
        return false;
    }
    if (dpformVal === dpdendVal || dpdendVal <= dpformVal) {
        alert("请设置有效时间段");
        return false;
    }
    var items = [];
    for (var i = 0; i < eventTypeItems["Type-" + eventTypeId].length; i++) {
        var id = eventTypeItems["Type-" + eventTypeId][i].toString();
        if ($("#item-" + id).val() === "") {
            $("#item-" + id).focus();
            items = [];
            return false;
        } else {
            var item = { "ItemId": 0, "Comment": "" };
            item.ItemId = id;
            item.Comment = $("#item-" + id).val();
            items.push(item);
        }
    }
    if (editFlag === 1) {
        //修改
        loggingData = {
            "LogId": currEventInfo.LogId,
            "ConstructionLogCofigId": configId,
            "BeginTime": $("#dpform").val(),
            "EndTime": $("#dpdend").val(),
            "Title": $("#inputTitle").val(),
            "Summary": $("#inputDescription").val(),
            "Items": items
        }
        var urlModify = apiurl + '/struct/constructionLog/modify?token=' + getCookie('token');
        $.ajax({
            //async: false,//同步
            type: 'post',
            url: urlModify,
            data: loggingData,
            statusCode: {
                202: function () {
                    $("#calendar").fullCalendar('refetchEvents');
                    $('#createEventModal').modal('hide');
                },
                403: function () {
                    alert("权限验证出错");
                    logOut();
                },
                400: function () {
                    alert("修改失败,日志记录标题已经存在或参数错误");
                },
                500: function () {
                    alert("内部异常");
                },
                404: function () {
                    alert('url错误');
                }
            }
        });
    } else {
        //增加
        loggingData = {
            "ConstructionLogCofigId": configId,
            "BeginTime": $("#dpform").val(),
            "EndTime": $("#dpdend").val(),
            "Title": $("#inputTitle").val(),
            "Summary": $("#inputDescription").val(),
            "Items": items
        }
        var url = apiurl + '/struct/constructionLog/add?token=' + getCookie('token');
        $.ajax({
            //async: false,//同步
            type: 'post',
            url: url,
            data: loggingData,
            statusCode: {
                202: function () {
                    $("#calendar").fullCalendar('refetchEvents');
                    $('#createEventModal').modal('hide');
                },
                403: function () {
                    alert("权限验证出错");
                    logOut();
                },
                400: function () {
                    alert("修改失败,日志记录标题已经存在或参数错误");
                },
                500: function () {
                    alert("内部异常");
                },
                404: function () {
                    alert('url错误');
                }
            }
        });
    }
});
//删除日志
$("#btnDelete").unbind('click').click(function () {
    var title = $("#inputTitle").val();
    var data= {
        "LogId": currEventInfo.LogId
    }
    if (confirm("确定删除日志“" + title + "”？") === true) {
        var url = apiurl + '/struct/constructionLog/delete?token=' + getCookie('token');
        $.ajax({
            //async: false,//同步
            type: 'post',
            url: url,
            data:data,
            statusCode: {
                202: function () {
                    $("#calendar").fullCalendar('refetchEvents');
                    $('#createEventModal').modal('hide');
                },
                403: function () {
                    alert("权限验证出错");
                    logOut();
                },
                400: function () {
                    alert("删除失败,参数错误");
                },
                500: function () {
                    alert("内部异常");
                },
                404: function () {
                    alert('url错误');
                }
            }
        });
    } 
});
