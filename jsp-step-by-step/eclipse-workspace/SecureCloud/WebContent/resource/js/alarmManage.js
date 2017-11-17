/**
 * ---------------------------------------------------------------------------------
 * <copyright file="alarmManage.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2015 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：告警管理js文件
 *
 * 创建标识：PengLing20150817
 *
 * 修改标识：
 * 修改描述：
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var g_userId = null;
var g_structId = null;
var g_filteredLevels = [];
var g_param = {};
var g_AlarmPageType = { Manager: "manager", Client_User: "client_user", Client_Struct: "client_struct" };
var g_AlarmLevel = { 1: "一级", 2: "二级", 3: "三级", 4: "四级" };
var g_alarmLevels = {};
var g_datePicker = { "day": { start: -1, end: 0 }, "week": { start: -7, end: 0 }, "month": { start: -30, end: 0 } };

$(function () {
    g_userId = getCookie("userId");
    if (g_userId == "") {
        alert("获取用户编号失败, 请检查浏览器Cookie是否已启用");
        logOut();
        return;
    }

    var sAlarmPageType = $('#alarmPageIndentity').val();
    initAlarmPage(sAlarmPageType);
});

function initAlarmPage(sAlarmPageType) {
    initFilter();
    initFilteredAndOrderedCondition();
    
    if (sAlarmPageType == g_AlarmPageType.Client_User) {
        initClientUserAlarmPage();
    }
    else if (sAlarmPageType == g_AlarmPageType.Client_Struct) {
        initClientStructAlarmPage();
    } else {
        initManagerAlarmPage();
    }
    
    bindAlarmFilterClickEvent();
    bindAlarmSortClickEvent(sAlarmPageType);
    bindAlarmBtnClickEvent(sAlarmPageType);
    bindAlarmDateChangeEvent();
}

/* 
 * 初始化用户侧用户告警页面.
 */
function initClientUserAlarmPage() {
    $('#userWarning').addClass('active');
    $("#orgName").text(getCookie("organization"));
    
    getUnprocessedWarnCount(g_AlarmPageType.Client_User);
    getAlarms(g_AlarmPageType.Client_User);
}

/* 
 * 初始化用户侧结构物告警页面.
 */
function initClientStructAlarmPage() {
    $('#struct-warning').addClass('active');
    $("#orgName").text(getCookie("organization"));
    
    g_structId = getCookie("nowStructId");
    setCookie('nowStructId', g_structId, g_cookie_expires);
    showCurrentStructName(g_structId);
    
    getUnprocessedWarnCount(g_AlarmPageType.Client_Struct);

    var warningId = getCookie("warningId");
    if (null != warningId && warningId != "") {
        g_param.warningId = warningId;
        setCookie("warningId", "");
    }
    
    var urlParams = decodeURI(location.href).split('.aspx?')[1];
    var urlSensors;
    if (urlParams != null && (urlSensors = urlParams.split('&')[0].split('sensorId=')[1]) != null) {
        getStructSensorsAlarm(urlSensors);
    } else {
        getAlarms(g_AlarmPageType.Client_Struct);
    }

    $('#listStruct').change(onchangeStruct);
}

/* 
 * 初始化管理侧告警页面.
 */
function initManagerAlarmPage() {
    var linkedOrgStruct = getLinkedOrgAndStruct();
    getOrgStructsListByUser(g_userId, linkedOrgStruct);
    
    $('#listOrg').change(onchangeOrg);
    $('#listStruct').change(onchangeStruct);
}

function onchangeStruct() {
    initFilter();
    initSortMenuTitle();
    var structId = parseInt($('#listStruct').find('option:selected')[0].id.split('optionStruct-')[1]);
    setCookie('nowStructId', structId);

    if ($('#alarmPageIndentity').val() === "client_struct") {
        createWarningBadgeAndContent(structId);
    }

    getUnprocessedWarnCount(g_AlarmPageType.Manager);
    getAlarms(g_AlarmPageType.Manager);
}

function showCurrentStructName(nowstructId) {
    var url = apiurl + '/user/' + userId + '/structs' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        async: true, // note: 调试证明, 若省略该属性, 则ajax请求为同步请求, 这点和网络上对该属性的说明不一致.
        success: function (data) {
            if (data == null || data.length == 0) {
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
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户下结构物列表时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function renderStructChosen(allOptions, selectedOptions) {
    // 刷新结构物列表,下面两行必须！
    $("#listStruct").removeClass('chzn-done');
    $("#listStruct_chzn").remove();
    $("#listStruct").html(allOptions);
    $("#listStruct").val("optionStruct-" + selectedOptions);
    $('#listStruct').chosen({
        no_results_text: "没有找到"
    });
}

function getAlarmStructId(sAlarmPageType) {
    var structId;
    var $structSelected = $('#listStruct').find('option:selected');
    if (sAlarmPageType == g_AlarmPageType.Manager) {
        structId = parseInt($structSelected[0].id.split('optionStruct-')[1]);
    } else { // sAlarmPageType = g_AlarmPageType.Client_Struct
        if ($structSelected.length === 0) {
            structId = g_structId;
        } else {
            structId = parseInt($structSelected[0].id.split('optionStruct-')[1]);
        }
    }
    return structId;
}

function bindAlarmBtnClickEvent(sAlarmPageType) {
    // "导出到Excel"click事件
    $('#btnDownload').click(function () {
        var urlDownload;
        if (sAlarmPageType == g_AlarmPageType.Client_User) {
            urlDownload = apiurl + '/user/' + g_userId + '/filtered-ordered/alarms' + '?token=' + getCookie("token");
        } else {
            var structId = getAlarmStructId(sAlarmPageType);
            urlDownload = apiurl + '/struct/' + structId + '/filtered-ordered/alarms' + '?token=' + getCookie("token");
        }
        
        var href = '/Support/WarnExcelDownload.ashx?Url=' + urlDownload + "&Url_params=" + JSON.stringify(g_param);
        $("#iframeExcel").attr("src", href);
    });

    // "确定"按钮click事件
    $('#filter_summit').click(function () {
        if (getFilterTime()) {
            getUnprocessedWarnCount(sAlarmPageType);
            if (sAlarmPageType == g_AlarmPageType.Client_Struct) {
                g_param.warningId = "";
            }
            getAlarms(sAlarmPageType);
        }
    });
}

function bindAlarmDateChangeEvent() {
    $("#date_select").change(function() {
        var $otherDate = $("#other_date");
        var sDate = $("#date_select").val();
        if (sDate != "other") {
            $otherDate.hide();
            initAlarmDatePicker(sDate); // 最近一天/周/月
        } else {
            $otherDate.show();
        }
    });
}

function initFilteredAndOrderedCondition() {
    g_param = {
        "filteredDeviceType": "all",        // 按设备类型过滤, 默认值: "all"
        "filteredStatus": "unprocessed",    // 按告警状态过滤, 默认值: "unprocessed"
        "filteredLevel": "1,2,3,4",         // 按告警等级过滤, 支持同时查询多个告警等级, 默认值: 所有告警等级[1,2,3,4]
        "filteredStartTime": showDate(-1),  // 按查询起始时间过滤, 默认值: DateTime.Now.AddYears(-10)
        "filteredEndTime": showDate(0),     // 按查询结束时间过滤, 默认值: DateTime.Now.AddYears(10)
        "orderedDevice": "none",            // 按设置位置排序, 默认值: "none"
        "orderedLevel": "up",               // 按告警等级排序, 默认值: "up"
        "orderedTime": "none"               // 按告警产生时间排序, 默认值: "none"
    };
}

function getFilterTime() {
    var sDate = $("#date_select").val(); // 点击"确定"按钮, 更新时间面板, 以获取最新查询条件
    if (sDate != "other") {
        initAlarmDatePicker(sDate);
    }
    
    var start = getTime('#dpfrom'), end = getTime('#dpend');
    if (start != "" && end != "") {
        if (!isEndGreaterThanStart(start, end)) {
            alert("告警起止时间点设置不合法, 终止时间点不宜小于起始时间点!");
            $("#dpend").focus();
            return false;
        }
    } else {
        if (start == "") {
            alert("请选择查询起始时间!");
            $("#dpfrom").focus();
            return false;
        }
        if (end == "") {
            alert("请选择查询终止时间!");
            $("#dpend").focus();
            return false;
        }
    }
    setFilterTime(start, end);
    return true;
}

function setFilterTime(start, end) {
    g_param.filteredStartTime = start;
    g_param.filteredEndTime = end;
}

function initSortMenuTitle() {
    $("#sortDevice").text("告警源");
    $("#sortLevel").text("等级从高到低");
    $("#sortTime").text("告警产生时间");
}

function getAlarmCountUrl(sAlarmPageType) {
    var url;
    if (sAlarmPageType == g_AlarmPageType.Client_User) {
        url = apiurl + '/user/' + userId + '/warn-number/unprocessed/'
            + g_param.filteredStartTime + '/' + g_param.filteredEndTime + '?token=' + getCookie("token");
    } else {
        var structId = getAlarmStructId(sAlarmPageType);
        url = apiurl + '/struct/' + structId + '/warn-number/unprocessed/'
            + g_param.filteredStartTime + '/' + g_param.filteredEndTime + '?token=' + getCookie("token");
    }

    return url;
}

function getUnprocessedWarnCount(sAlarmPageType) {
    $('#loading-alarm').show();

    var url = getAlarmCountUrl(sAlarmPageType);
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        dataType: 'json',
        async: true, // note: 调试证明, 若省略该属性, 则ajax请求为同步请求, 这点和网络上对该属性的说明不一致.
        success: function (data) {
            $('#loading-alarm').hide();
            g_alarmLevels = {}; // empty it.
            showUnprocessedWarnCount(data);
        },
        error: function (xhr) {
            $('#loading-alarm').hide();
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) {
                alert("获取各级别新告警个数时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function showUnprocessedWarnCount(data) {
    initAlarmLevelsObj();

    for (var i = 0; i < data.length; i++) {
        var warns = data[i].stats;
        for (var j = 0; j < warns.length; j++) {
            var level = parseInt(warns[j].level);
            g_alarmLevels[level].count += warns[j].number;
        }
    }
    for (var key in g_alarmLevels) {
        $('#warnlevel_' + key).html(g_AlarmLevel[key] + "(" + g_alarmLevels[key].count + ")");
    }
}

function initAlarmLevelsObj() {
    for (var i = 1; i < 5; i++) {
        g_alarmLevels[i] = { count: 0 };
    }
}

/**
 * 获取指定时间(yyyy-MM-dd hh:mm:ss), 时间精确到秒
 */
function getDateAndTime(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    d = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    return d.replace(/\b(\w)\b/g, '0$1');
}

/* 
 * 处理用户侧结构物下传感器告警页面: 显示传感器全部告警.
 */
function getStructSensorsAlarm(urlSensors) {
    initFilter('SensorAlarmHref');

    var endTime = getDateAndTime(0);
    var urlAlarms = apiurl + '/sensor/' + urlSensors + '/warnings/all/1970-01-01 00:00:00/' + endTime + '?token=' + getCookie("token");
    var urlAlarmsCount = apiurl + '/sensor/' + urlSensors + '/warning-count/all/1970-01-01 00:00:00/' + endTime + '?token=' + getCookie("token");
    showAlarmsTable('warnTable', urlAlarms, urlAlarmsCount, null, "sensor");
}

/*
 * 获取告警信息
 */
function getAlarms(sAlarmPageType) {
    var urlAlarms, urlAlarmsCount;
    if (sAlarmPageType == g_AlarmPageType.Client_User) {
        urlAlarms = apiurl + '/user/' + userId + '/filtered-ordered/alarms' + '?token=' + getCookie("token");
        urlAlarmsCount = apiurl + '/user/' + userId + '/filtered-ordered/alarms-count' + '?token=' + getCookie("token");
    } else {
        var structId = getAlarmStructId(sAlarmPageType);
        urlAlarms = apiurl + '/struct/' + structId + '/filtered-ordered/alarms' + '?token=' + getCookie("token");
        urlAlarmsCount = apiurl + '/struct/' + structId + '/filtered-ordered/alarms-count' + '?token=' + getCookie("token");
    }
    
    if (g_param.filteredLevel == "") {
        g_param.filteredLevel = "1,2,3,4";
    }
    
    showAlarmsTable('warnTable', urlAlarms, urlAlarmsCount, g_param, "struct");
}

function showAlarmsTable(tableId, urlAlarms, urlAlarmsCount, params, sType) {
    $('#' + tableId).dataTable().fnDestroy();

    var urlParams = sType == "struct" ? "&Url_params=" + JSON.stringify(params) : "";

    $('#' + tableId).dataTable({
        "bAutoWidth": false,
        "aLengthMenu": [
             [10, 25, 50],
             [10, 25, 50]
        ],
        "iDisplayLength": 50,
        "bStateSave": false,
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aoColumns": [ // 这个属性下的设置会应用到所有列，按顺序没有是空
            { "mData": 'warning_source' },
            { "mData": 'warning_level' },
            { "mData": 'warning_time' },
            { "mData": 'warning_reason' },
            { "mData": 'warning_information' },
            { "mData": 'warning_count' },
            { "mData": 'warning_lastTime' },
            { "mData": 'warning_confirmInfo' },
            { "mData": 'warning_action' }
        ],
        "bSort": false,
        "sPaginationType": "full_numbers",
        //"bLengthChange": false,
        "bFilter": false,
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": "/AlarmManageHandler.ashx?now=" + Math.random() + "&type=" + sType
            + "&Url=" + urlAlarms + "&Url_count=" + urlAlarmsCount + urlParams
    });
}

function showWarningDetails(warningId, source) {
    var thead = "<tr><th>告警时间</th><th>告警内容</th></tr>";
    $("#alarmThead").html(thead);

    var userId = getCookie("userId");
    if (userId == "") {
        alert("获取用户id失败, 请检查浏览器Cookie是否已启用.");
        logOut();
        return;
    }

    $('#alarmModalLabel').text(source + "详细告警信息");
    
    $('#alarmDetail').modal();

    $('#alarmTable').dataTable().fnDestroy();

    var url = apiurl + '/warning/' + warningId + '/detail' + '?token=' + getCookie("token");
    var urlCount = apiurl + '/warning/' + warningId + '/detail-count' + '?token=' + getCookie("token");
    $('#alarmTable').dataTable({
        "bRetrieve": true,
        "aLengthMenu": [
            [10, 25, 50],
            [10, 25, 50]
        ],
        "iDisplayLength": 25,
        "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        // "bStateSave": true,
        "aoColumns": [ // 这个属性下的设置会应用到所有列，按顺序没有是空
            { "mData": 'StrTime', "sWidth": "12%" },
            { "mData": 'Content', "sWidth": "10%" }
        ],
        "bSort": false,
        "bFilter": false, // 禁用搜索框
        "sPaginationType": "full_numbers",
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": "/AlarmManageHandler.ashx?now=" + Math.random() + "&type=detail"
            + "&Url=" + url + "&Url_count=" + urlCount
    });
}

/******************************************** start Alarm Filter *************************************************/
function showDate(n) {
    var uom = new Date();
    uom.setDate(uom.getDate() + n);
    uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate() + " " + uom.getHours() + ":" + uom.getMinutes() + ":" + uom.getSeconds();
    return uom.replace(/\b(\w)\b/g, '0$1');
}

function initFilter(pageHref) {
    // init "告警查询"条目: "告警等级:全部", "设备类型:全部", "状态:新告警".
    var domFilterDevice = $('#filter_device_all')[0], domFilterStatus = $('#filter_status_unprocessed')[0];
    
    if (pageHref == 'SensorAlarmHref') {
        domFilterDevice = $('#filter_device_sensor')[0];
        domFilterStatus = $('#filter_status_all')[0];
    }
    
    levelAll();
    onclickAlarmFilterDevice(domFilterDevice);
    onclickAlarmFilterStatus(domFilterStatus);
    $(".select-no").hide();
    // init alarm time 
    initAlarmDatePicker("day"); // 最近一天
}

/**
 * 初始化告警时间面板
 */
function initAlarmDatePicker(dateType) {
    var startInDay = g_datePicker[dateType].start, endInDay = g_datePicker[dateType].end;
    var start = showDate(startInDay), end = showDate(endInDay);
    $("#dpfrom").val(start);
    $("#dpend").val(end);
}

function levelRemove(param1, param2) {
    $(param1).remove();
    $(param2).removeClass("selected");
    if (($("#selectAlarmLevel_1").length == 0) && ($("#selectAlarmLevel_2").length == 0)
        && ($("#selectAlarmLevel_3").length == 0) && ($("#selectAlarmLevel_4").length == 0)) {
        $("#filter_level_all").addClass("selected");
        if ($("#selectAlarmLevel").length > 0) {
            $("#selectAlarmLevel a").html("告警等级：&nbsp;" + $("#filter_level_all").text());
        } else {
            $(".select-result dl").append($("#filter_level_all").clone().attr("id", "selectAlarmLevel"));
            $("#selectAlarmLevel a").html("告警等级：&nbsp;" + $("#filter_level_all").text());
        }
        g_filteredLevels = [];
        g_param.filteredLevel = "";
    }
}

function levelAll() {
    $("#filter_level_all").addClass("selected").siblings().removeClass("selected");
    for (var i = 1; i < 5; i++) {
        if ($("#selectAlarmLevel_" + i.toString()).length > 0) {
            $("#selectAlarmLevel_" + i.toString()).remove();
        }
    }
    if ($("#selectAlarmLevel").length > 0) {
        $("#selectAlarmLevel a").html("告警等级：&nbsp;" + $("#filter_level_all").text());
    } else {
        $(".select-result dl").append($("#filter_level_all").clone().attr("id", "selectAlarmLevel"));
        $("#selectAlarmLevel a").html("告警等级：&nbsp;" + $("#filter_level_all").text());
    }
    g_filteredLevels = ["1", "2", "3", "4"];
    g_param.filteredLevel = "1,2,3,4";
}

function onclickAlarmFilterDevice(that) {
    $(that).addClass("selected").siblings().removeClass("selected");
    var $selectDeviceType = $("#selectDeviceType");
    if ($(that).hasClass("select-all")) {
        $selectDeviceType.remove();
    } else {
        if ($selectDeviceType.length > 0) {
            $("#selectDeviceType a").html("设备类型：&nbsp;" + $(that).text());
        } else {
            $(".select-result dl").append($(that).clone().attr("id", "selectDeviceType"));
            $("#selectDeviceType a").html("设备类型：&nbsp;" + $(that).text());
        }
    }

    g_param.filteredDeviceType = that.id.split('filter_device_')[1]; // { "all", "dtu", "sensor", "node", "gateway" }
}

function onclickAlarmFilterStatus(that) {
    $(that).addClass("selected").siblings().removeClass("selected");
    var $selectAlarmStatus = $("#selectAlarmStatus");
    if ($(that).hasClass("select-all")) {
        $selectAlarmStatus.remove();
    } else {
        if ($selectAlarmStatus.length > 0) {
            $("#selectAlarmStatus a").html("状态：&nbsp;" + $(that).text());
        } else {
            $(".select-result dl").append($(that).clone().attr("id", "selectAlarmStatus"));
            $("#selectAlarmStatus a").html("状态：&nbsp;" + $(that).text());
        }
    }
    var filterStatus;
    if ($(that).text() == "全部") {
        filterStatus = "all";
    } else if ($(that).text() == "历史告警") {
        filterStatus = "processed";
    } else {
        filterStatus = "unprocessed";
    }
    g_param.filteredStatus = filterStatus;
}

function bindAlarmFilterClickEvent() {
    // "告警等级"过滤条件选择
    $("#filter_level_all").click(levelAll);
    $("#filter_level_1, #filter_level_2, #filter_level_3, #filter_level_4").click(function () {
        onclickAlarmFilterLevel(this.id.split('filter_level_')[1]);
        tryShowDomSelectNo();
    });

    // "设备类型"过滤条件选择
    $("#groupAlarmFilterDevice dd").click(function () {
        onclickAlarmFilterDevice(this);
        tryShowDomSelectNo();
    });
    
    // 告警"状态"过滤条件选择
    $("#groupAlarmFilterStatus dd").click(function () {
        onclickAlarmFilterStatus(this);
        tryShowDomSelectNo();
    });

    // "搜索条件"条目中各组件点击事件
    $("#selectAlarmLevel").live("click", function () {
        $(this).remove();
        $("#filter_level_all").addClass("selected").siblings().removeClass("selected");
        g_filteredLevels = [];
        g_param.filteredLevel = "";
        tryShowDomSelectNo();
    });
    $("#selectAlarmLevel_1, #selectAlarmLevel_2, #selectAlarmLevel_3, #selectAlarmLevel_4").live("click", function () {
        removeSelectItem(this.id.split('selectAlarmLevel_')[1]);
        tryShowDomSelectNo();
    });
    $("#selectDeviceType").live("click", function () {
        $(this).remove();
        $("#filter_device_all").addClass("selected").siblings().removeClass("selected");
        g_param.filteredDeviceType = "all";
        tryShowDomSelectNo();
    });
    $("#selectAlarmStatus").live("click", function () {
        $(this).remove();
        $("#filter_status_unprocessed").addClass("selected").siblings().removeClass("selected");
        g_param.filteredStatus = "unprocessed";
        tryShowDomSelectNo();
    });

    // "告警时间"选择
    $('.date').datetimepicker({
        format: 'yyyy-MM-dd hh:mm:ss',
        language: 'pt-BR'
    });
}

function tryShowDomSelectNo() {
    var $selectNo = $('.select-no');
    if ($('.select-no+dd').length == 0) {
        $selectNo.show();
    } else {
        $selectNo.hide();
    }
}

function onclickAlarmFilterLevel(sIndex) {
    levelClickEvent('#filter_level_' + sIndex, 'selectAlarmLevel_' + sIndex, '#selectAlarmLevel_' + sIndex + ' a');
    uniqueArrayItem(sIndex);
}

function levelClickEvent(sDom1, sDom2, sDom3) {
    $("#filter_level_all").removeClass("selected");
    if ($("#selectAlarmLevel").length > 0) {
        $("#selectAlarmLevel").remove();
        g_filteredLevels = [];
    }
    var $dom1 = $(sDom1);
    $dom1.addClass("selected");
    if ($("#" + sDom2).length > 0) {
        $(sDom3).html("告警等级：&nbsp;" + $dom1.text());
    } else {//不存在追加
        $(".select-result dl").append($dom1.clone().attr("id", sDom2));
        $(sDom3).html("告警等级：&nbsp;" + $dom1.text());
    }
    if (($("#selectAlarmLevel_1").length > 0) && ($("#selectAlarmLevel_2").length > 0)
        && ($("#selectAlarmLevel_3").length > 0) && ($("#selectAlarmLevel_4").length > 0)) {
        levelAll();
    }
}

function uniqueArrayItem(param) {
    g_filteredLevels.push(param);
    g_filteredLevels = g_filteredLevels.filter(function (item, i) {
        return i == g_filteredLevels.indexOf(item);
    });
    g_param.filteredLevel = g_filteredLevels.join(',');
}

function removeSelectItem(sIndex) {
    levelRemove('#selectAlarmLevel_' + sIndex, '#filter_level_' + sIndex);
    g_filteredLevels.splice($.inArray(sIndex, g_filteredLevels), 1);
    g_param.filteredLevel = g_filteredLevels.join(',');
}

function getDateCompatibleWithIE(dateStr) {
    var str1 = dateStr.split('-');
    var year = str1[0];
    var month = str1[1];
    var str2 = str1[2].split(' '); // dd hh:mm:ss
    var day = str2[0];
    var str3 = str2[1].split(':');
    var hour = str3[0];
    var minute = str3[1];
    var second = str3[2];
    var date = new Date();
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second);
    return date;
}

function isEndGreaterThanStart(start, end) {
    var startTime = getDateCompatibleWithIE(start);
    var endTime = getDateCompatibleWithIE(end);
    if (endTime < startTime) {
        return false;
    }
    return true;
}

function getTime(param) {
    var date = $(param).val();
    date = date.replace(new RegExp("/", "g"), "-");
    return date;
}
/******************************************** end Alarm Filter *************************************************/


/******************************************** start Alarm Sort *************************************************/
function bindAlarmSortClickEvent(sAlarmPageType) {
    sortByDeviceClickEvent(sAlarmPageType);
    sortByLevelClickEvent(sAlarmPageType);
    sortByTimeClickEvent(sAlarmPageType);
}

// sort by Alarm Device
function sortByDeviceClickEvent(sAlarmPageType) {
    $("#deviceDesc").live("click", function () {
        $("#sortDevice").text("告警源位置降序");
        sortByDevice("down", sAlarmPageType);
    });

    $("#deviceAsc").live("click", function () {
        $("#sortDevice").text("告警源位置升序");
        sortByDevice("up", sAlarmPageType);
    });
}

function sortByDevice(param, sAlarmPageType) {
    $("#sortLevel").text("告警等级");
    $("#sortTime").text("告警产生时间");
    g_param.orderedDevice = param;
    g_param.orderedLevel = "none";
    g_param.orderedTime = "none";
    getAlarms(sAlarmPageType);
}

// sort by Alarm Level
function sortByLevelClickEvent(sAlarmPageType) {
    $("#levelDesc").live("click", function () {
        $("#sortLevel").text("等级从高到低");
        sortByLevel("up", sAlarmPageType);
    });
    $("#levelAsc").live("click", function () {
        $("#sortLevel").text("等级从低到高");
        sortByLevel("down", sAlarmPageType);
    });
}

function sortByLevel(param, sAlarmPageType) {
    $("#sortTime").text("告警产生时间");
    $("#sortDevice").text("告警源");
    g_param.orderedLevel = param;
    g_param.orderedDevice = "none";
    g_param.orderedTime = "none";
    getAlarms(sAlarmPageType);
}

// sort by Alarm Time
function sortByTimeClickEvent(sAlarmPageType) {
    $("#timeDesc").live("click", function () {
        $("#sortTime").text("告警时间降序");
        sortByTime("down", sAlarmPageType);
    });
    $("#timeAsc").live("click", function () {
        $("#sortTime").text("告警时间升序");
        sortByTime("up", sAlarmPageType);
    });
}

function sortByTime(param, sAlarmPageType) {
    $("#sortDevice").text("告警源");
    $("#sortLevel").text("告警等级");
    g_param.orderedTime = param;
    g_param.orderedLevel = "none";
    g_param.orderedDevice = "none";
    getAlarms(sAlarmPageType);
}
/******************************************** end Alarm Sort *************************************************/

/*
 * 确认告警
 */
function confirmAlarm(warningId) {
    $('#dlgAlarmConfirm').modal();
    
    var $confirm = $('#alarmConfirmInfo');
    $confirm.val("");
    
    $('#btnSubmitAlarmConfirm').unbind("click").click(function () {
        if ($.trim($confirm.val()) == "") {
            alert('告警确认信息不能为空!');
            $confirm.focus();
        } else {
            $('#dlgAlarmConfirm').modal('hide');

            var sAlarmPageType = $('#alarmPageIndentity').val();
            var userId = sAlarmPageType == g_AlarmPageType.Client_User ? g_userId : getCookie("userId");
            onconfirmAlert(warningId, userId, $confirm.val(), sAlarmPageType);
        }
    });
}

function onconfirmAlert(warningId, userId, msg, sAlarmPageType) {
    var url = apiurl + '/warnings/confirm/' + warningId + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'post',
        async: true, // note: 调试证明, 若省略该属性, 则ajax请求为同步请求, 这点和网络上对该属性的说明不一致.
        data: {
            "confirmor": userId,
            "suggestion": msg
        },
        statusCode: {
            202: function () {
                getUnprocessedWarnCount(sAlarmPageType);
                getAlarms(sAlarmPageType);

                if (sAlarmPageType == g_AlarmPageType.Client_User) {
                    createWarningBadgeAndContentByUser();
                } else if (sAlarmPageType == g_AlarmPageType.Client_Struct) {
                    createWarningBadgeAndContent(g_structId);
                }

                alert('确认成功');
            },
            400: function () {
                alert('下发失败');
            },
            500: function () {
                alert('处理出现异常');
            },
            403: function () {
                alert('权限验证出错');
                logOut();
            },
            404: function () {
                alert('url错误');
            },
            405: function () {
                alert('抱歉, 没有权限');
            }
        }
    });
}