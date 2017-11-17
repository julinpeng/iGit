/**
 * ---------------------------------------------------------------------------------
 * <copyright file="alarmPushConfig.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2015 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：告警推送配置js文件
 *
 * 创建标识：PengLing20150824
 *
 * 修改标识：
 * 修改描述：
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var g_receivers = {};
var g_AlarmLevels = { 1: "一级", 2: "二级", 3: "三级", 4: "四级" };
var g_AlarmPolicy = { All: "1", None: "2", Device: "3", Data: "4", Device_Data: "5" };
var g_AlarmPolicyAndDomMap = {
    1: "#alarmType_all",
    3: "#alarmType_device",
    4: "#alarmType_data",
    5: "#alarmType_device, #alarmType_data"
};

$(function () {
    $('#systemConfig').addClass('active');
    $('#alarmPushConfig').addClass('active');
    
    getAlarmReceiversByUser(false);
    getStructsByUser();

    bindAlarmPushConfigClickEvent();
    bindAlarmPushConfigChangeEvent();
});

function bindAlarmPushConfigClickEvent() {
    $('#btnAddAlarmReceiver').click(function () {
        $('#headerSetAlarmReceiver').html('新增告警接收人');
        initReceiverAddModal();
    });

    $('#btnSave').click(function () {
        saveAlarmReceiver();
    });

    $('#btnReset').click(function () {
        var oldReceiver = $('#configReceiverId').val();
        var isModify = oldReceiver != '';
        if (isModify) {
            initReceiverModifyModal(parseInt(oldReceiver));
        } else { // Add
            initReceiverAddModal();
        }
    });
}

function bindAlarmPushConfigChangeEvent() {
    // "接收告警类型"Checkbox选择事件
    var $alarmTypeAll = $('#alarmType_all');
    $alarmTypeAll.change(function () {
        uniformCheckboxes($alarmTypeAll, '#alarmType_all');
    });
    $('#alarmType_data, #alarmType_device').change(function () {
        uniformCheckboxes($(this), '#alarmType_data, #alarmType_device');
    });

    // "关注结构物"Select多选事件
    $('#setConcernStructs').change(onchangeConcernStructs);

    // 接收方式Checkbox选择事件
    $("#setSmsMode, #setEmailMode").change(function () {
        onchangeAlarmReceiveMode($(this));
    });
}

function onchangeAlarmReceiveMode($target) {
    if ($target.prop("checked")) {
        disableAlarmLevelInputs($target, false);
    } else {
        disableAlarmLevelInputs($target, true);
        uncheckAlarmLevelInputs($target);
    }
}

/**
 * 禁用"接收告警级别"选择框
 * @param {object} $target 告警接收方式DOM对象
 * @param {boolean} isDisabled 是否禁用
 * @returns {} 
 */
function disableAlarmLevelInputs($target, isDisabled) {
    var targetId = $target[0].id;
    var domId = targetId === "setSmsMode" ? "groupSmsLevel" : "groupEmailLevel";
    var $smsLevelInputs = $("#" + domId + " input");
    $smsLevelInputs.each(function (i, eleObj) {
        $(eleObj).attr("disabled", isDisabled);
    });
}

function uncheckAlarmLevelInputs($target) {
    var targetId = $target[0].id;
    var domId = targetId === "setSmsMode" ? "groupSmsLevel" : "groupEmailLevel";
    var $smsLevelInputs = $("#" + domId + " input");
    $smsLevelInputs.each(function (i, eleObj) {
        $(eleObj).prop("checked", false);
    });
    jQuery.uniform.update($smsLevelInputs);
}

function onchangeConcernStructs(sFlag) {
    var width1 = 320, width2 = 340;
    var options = $('#setConcernStructs').val();
    var $structChosenNum = $('#structChosenNum');
    if (options != null) {
        $structChosenNum.html('已选择' + options.length + '个');
        var nw = $('#groupStructChosenNum').width();
        width1 = nw + 230;
        width2 = nw + 250;
    } else {
        $structChosenNum.html('可多选');
    }

    renderChosenAllStructs();

    if (sFlag == 'initModifyModal') { // note: Modal plugin cause "$('#groupStructChosenNum').width()" is always "0".
        width1 = 320, width2 = 340;
    }
    setChosenAllStructsPosition(width1, width2);
}

function renderChosenAllStructs() {
    var $setConcernStructs = $('#setConcernStructs'), $setChosenAllStructs = $('#setChosenAllStructs');
    if ($setConcernStructs.find('option:selected').length < $setConcernStructs.find('option').length) {
        $setChosenAllStructs.parent('span').removeClass('checked');
        $setChosenAllStructs.prop('checked', false);
    } else {
        $setChosenAllStructs.parent('span').addClass('checked');
        $setChosenAllStructs.prop('checked', true);
    }
}

function setChosenAllStructsPosition(width1, width2) {
    $('#uniform-setChosenAllStructs').css({ 'position': 'absolute', 'left': width1 + 'px', 'top': '5px' });
    $('#textChosenAllStructs').css('left', width2);
}

function uniformCheckboxes($target, sDom) {
    if ($target.prop('checked')) {
        $('#groupAlarmType input').not(sDom).each(function (i, item) {
            $(item).prop('checked', false);
        });
    }
    jQuery.uniform.update($('#groupAlarmType input'));
}

function initReceiverAddModal() {
    $('#formSetAlarmReceiver')[0].reset();
    $('#configReceiverId').val('');

    renderConcernStructChosen(null, null);
    $('#structChosenNum').html('可多选');
    
    $('#uniform-setChosenAllStructs').css({ 'position': 'absolute', 'left': '320px', 'top': '5px' });
    $('#textChosenAllStructs').css('left', 340);

    initCheckboxes();
}

function initCheckboxes() {
    var $inputs = $('#modalSetAlarmReceiver input');
    $inputs.each(function (i, eleObj) {
        var domId = eleObj.id;
        if (domId == 'alarmType_data' || domId == 'setReceiverEnable') {
            $(eleObj).prop('checked', true);
        } else {
            $(eleObj).prop('checked', false);
        }
    });
    jQuery.uniform.update($inputs); // this statement is vital to show the Checkbox checked or not.

    onchangeAlarmReceiveMode($("#setSmsMode"));
    onchangeAlarmReceiveMode($("#setEmailMode"));
}

function getStructsByUser() {
    $('#alarmPushConfigPageLoading').show();

    var url = apiurl + '/user/' + userId + '/struct/list?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        async: true,
        cache: false,
        success: function (data) {
            createUserStructsOptions(data);
            $('#alarmPushConfigPageLoading').hide();
        },
        error: function (xhr) {
            $('#alarmPushConfigPageLoading').hide();
            if (xhr.status == 403) { // 权限验证出错, 禁止访问
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户下结构物列表时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function createUserStructsOptions(data) {
    var userStructs = [];
    var options = '';
    var namalist = [];
    if (data == null || data.length == 0) {
        options = '<option value="-1">无任何结构物</option>';
        userStructs.push(-1);
    } else {
        
        for (var i = 0; i < data.length; i++) {
            var struct = data[i];
            options += '<option value="' + struct.structId + '">' + struct.structName + '</option>';
            userStructs.push(struct.structId);
            namalist.push(struct.structName.length);
        }
    }
    var maxSize = namalist.length==0?6:Math.max.apply(null, namalist);
    //bindChosenAllStructsChangeEvent(userStructs); // 关注结构物"全选"Checkbox选择事件
    renderConcernStructChosen(options, null, maxSize);
}

function bindChosenAllStructsChangeEvent(aUserStructs) {
    var $chosenAllStructs = $('#setChosenAllStructs');
    $chosenAllStructs.unbind('change').change(function () {
        var selectedOptions = aUserStructs.length == 0 ? null : aUserStructs;
        if (!$chosenAllStructs.prop('checked')) {
            selectedOptions = null;
        }
        renderConcernStructChosen(null, selectedOptions);
        onchangeConcernStructs();
    });
}

function renderConcernStructChosen(allOptions, selectedOptions, maxSize) {
    var lastmaxSize = maxSize == undefined ? 14 : maxSize;
    var obj = [lastmaxSize, 6, 222, 30];
    if (allOptions != null) {
        $('#setConcernStructs').html(allOptions);
    }
    initSelect(null, '#setConcernStructs', obj, null);
    $('#setConcernStructs').multiselect('select', selectedOptions);
    $('#setConcernStructs').multiselect('refresh');
}

function getAlarmReceiversByUser(isDataTableExist) {
    $('#alarmPushConfigPageLoading').show();
    var url = apiurl + '/user/' + getCookie("userId") + '/alarm-receivers' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        async: true,
        cache: false,
        success: function (data) {
            showAlarmReceivers(data, isDataTableExist);
            $('#alarmPushConfigPageLoading').hide();
        },
        error: function (xhr) {
            $('#alarmPushConfigPageLoading').hide();
            if (xhr.status == 403) { // 权限验证出错, 禁止访问
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户下告警接收人时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function showAlarmReceivers(data, isDataTableExist) {
    g_receivers = {}; // empty it.
    
    var content = '';
    $.each(data, function (i, item) {
        content += '<tr><td>' + item.name + '</td>';
        content += '<td>' + populateConcernStructs(item.concernStructs) + '</td>';
        content += '<td>' + item.policyName + '</td>';
        content += '<td>' + populateReceiveMode(item.smsMode, item.emailMode) + '</td>';
        content += '<td>' + item.phone + '</td>';
        content += '<td>' + item.email + '</td>';
        content += '<td>' + populateAlarmFilterLevel(item.smsFilterLevel) + '</td>';
        content += '<td>' + populateAlarmFilterLevel(item.emailFilterLevel) + '</td>';
        content += '<td>' + (item.enable ? "已启用" : "已禁用") + '</td>';
        content += '<td><a onclick="onmodifyReceiver(' + item.receiverId + ')" style="cursor: pointer;">修改</a>' +
            ' | <a onclick="removeAlarmReceiver(' + item.receiverId + ')" style="cursor: pointer;">删除</a></td></tr>';

        g_receivers[item.receiverId] = item; // assign value
    });

    if (isDataTableExist) { // auto size DataTable with screen.
        $('#tableAlarmReceiver').dataTable().fnDestroy();
    }
    $('#tbodyAlarmReceiver').html(content);
    renderAlarmReceiverTable();
}

/**
 * "修改"接收人点击方法
 * @param {int} receiverId 接收人id
 * @returns {} 
 */
function onmodifyReceiver(receiverId) {
    $('#headerSetAlarmReceiver').html('修改告警接收人');
    $('#configReceiverId').val(receiverId);
    initReceiverModifyModal(receiverId);
    onchangeConcernStructs('initModifyModal');
    $('#modalSetAlarmReceiver').modal();
}

function initReceiverModifyModal(receiverId) {
    var receiver = g_receivers[receiverId];
    
    $('#setReceiver').val(receiver.name);
    $('#setPhone').val(receiver.phone);
    $('#setEmail').val(receiver.email);
    
    // 关注结构物
    var selectedOptions = [];
    $.each(receiver.concernStructs, function (i, struct) {
        selectedOptions.push(struct.structId);
    });
    renderConcernStructChosen(null, selectedOptions);
    
    // "重置"已选择结构物个数
    $('#structChosenNum').html('已选择' + receiver.concernStructs.length + '个');
    renderChosenAllStructs();
    
    // 接收告警类型
    var pid = receiver.policyId;
    var $targets = $('#groupAlarmType input');
    var $others;
    if (pid == parseInt(g_AlarmPolicy.Device_Data)) {
        $('#alarmType_data').prop('checked', true);
        $('#alarmType_device').prop('checked', true);
        $others = $targets.not('#alarmType_data, #alarmType_device');
        $.each($others, function (i, item) {
            $(item).prop('checked', false);
        });
    } else {
        var dom = g_AlarmPolicyAndDomMap[pid];
        $(dom).prop('checked', true);
        $others = $targets.not(dom);
        $.each($others, function (i, item) {
            $(item).prop('checked', false);
        });
    }
    jQuery.uniform.update($targets); // this statement is vital.

    // 告警接收方式
    $('#setSmsMode').prop('checked', receiver.smsMode);
    $('#setEmailMode').prop('checked', receiver.emailMode);
    $('#setReceiverEnable').prop('checked', receiver.enable);
    jQuery.uniform.update($('#setSmsMode, #setEmailMode, #setReceiverEnable')); // this statement is vital.

    onchangeAlarmReceiveMode($("#setSmsMode"));
    onchangeAlarmReceiveMode($("#setEmailMode"));
    
    // 短信告警过滤级别
    var smsLevelDoms = [];
    $targets = $('#groupSmsLevel input');
    $.each(receiver.smsFilterLevel, function (i, item) {
        $('#sms_level' + item).prop('checked', true);
        smsLevelDoms.push('#sms_level' + item);
    });
    $others = $targets.not(smsLevelDoms.join(','));
    $.each($others, function (i, item) {
        $(item).prop('checked', false);
    });
    // 邮件告警过滤级别
    var emailLevelDoms = [];
    $targets = $('#groupEmailLevel input');
    $.each(receiver.emailFilterLevel, function (i, item) {
        $('#email_level' + item).prop('checked', true);
        emailLevelDoms.push('#email_level' + item);
    });
    $others = $targets.not(emailLevelDoms.join(','));
    $.each($others, function (i, item) {
        $(item).prop('checked', false);
    });
    jQuery.uniform.update($('#groupSmsLevel input, #groupEmailLevel input')); // this statement is vital.
}

function populateConcernStructs(concernStructs) {
    var sStructs = '';
    $.each(concernStructs, function (i, struct) {
        if (i == 0) {
            sStructs += struct.structName;
        } else {
            sStructs += ',' + struct.structName;
        }
    });

    return sStructs;
}

function populateReceiveMode(smsMode, emailMode) {
    var sMode;
    
    if (smsMode) {
        sMode = "短信";
        if (emailMode) {
            sMode += ",邮件";
        }
    } else {
        if (emailMode) {
            sMode = "邮件";
        } else {
            sMode = "无";
        }
    }

    return sMode;
}

function populateAlarmFilterLevel(aLevel) {
    var sLevels = '无';
    
    for (var i = 0; i < aLevel.length; i++) {
        if (i == 0) {
            sLevels = g_AlarmLevels[aLevel[i]];
        } else {
            sLevels += ',' + g_AlarmLevels[aLevel[i]];
        }
    }

    return sLevels;
}


function saveAlarmReceiver() {
    var isAllConfigsValid = checkAlarmReceiverValidity();
    if (!isAllConfigsValid) {
        return;
    }
    
    $('#alarmPushConfigSetModalLoading').show();

    var oldReceiver = $('#configReceiverId').val();
    var isModify = oldReceiver != '';

    var url;
    var configs = getReceiverConfigs();

    if (isModify) {
        url = apiurl + '/alarm-receiver/' + oldReceiver + '/modify' + '?token=' + getCookie('token');
    } else {
        url = apiurl + '/alarm-receiver/add' + '?token=' + getCookie('token');
    }
    $.ajax({
        type: 'post',
        url: url,
        data: configs,
        dataType: 'json',
        async: true,
        cache: false,
        statusCode: {
            200: function () {
                getAlarmReceiversByUser(true);

                if (isModify) {
                    $('#modalSetAlarmReceiver').modal('hide');
                }
            },
            202: function (data) {
                alert(data.Message);
            }
        },
        success: function () {
            $('#alarmPushConfigSetModalLoading').hide();
        },
        error: function (xhr) {
            $('#alarmPushConfigSetModalLoading').hide();
            if (xhr.status == 403) { // 权限验证出错, 禁止访问
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                var action = isModify ? '修改' : '新增';
                alert(action + "告警接收人时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function getReceiverConfigs() {
    var receiver = $('#setReceiver').val().trim();
    var phone = $('#setPhone').val().trim();
    var email = $('#setEmail').val().trim();
    
    var concernStructs = $('#setConcernStructs').val();
    // 关注结构物id
    var aConcernStructs = [];
    for (var i = 0; i < concernStructs.length; i++) {
        aConcernStructs.push(parseInt(concernStructs[i]));
    }
    
    var smsMode = $('#setSmsMode').attr("checked") == 'checked' ? true : false;
    var emailMode = $('#setEmailMode').attr("checked") == 'checked' ? true : false;
    var en = $('#setReceiverEnable').attr("checked") == 'checked' ? true : false;

    var aSmsFilterLevel = getAlarmFilterLevel('#groupSmsLevel');
    var aEmailFilterLevel = getAlarmFilterLevel('#groupEmailLevel');
    var policyId = getAlarmPolicy();
    
    var configs = {
        "name": receiver,
        "phone": phone,
        "email": email,
        "assignUserId": getCookie("userId"),
        "smsMode": smsMode,
        "emailMode": emailMode,
        "smsFilterLevel": aSmsFilterLevel.length == 0 ? null : aSmsFilterLevel.join(','),
        "emailFilterLevel": aEmailFilterLevel.length == 0 ? null : aEmailFilterLevel.join(','),
        "concernStructs": aConcernStructs.join(','),
        "policyId": policyId,
        "enable": en
    };

    return configs;
}

function getAlarmFilterLevel(sDom) {
    var levels = [];
    var $set = $(sDom + ' input:checked');
    $.each($set, function (i, item) {
        levels.push(parseInt(item.value));
    });

    return levels;
}

function getAlarmPolicy() {
    var policyId;
    var $set = $('#groupAlarmType input:checked');
    if ($set.length == 1) {
        policyId = parseInt($set.val());
    } else {
        if ($('#alarmType_data').attr("checked") == 'checked' && $('#alarmType_device').attr("checked") == 'checked') {
            policyId = parseInt(g_AlarmPolicy.Device_Data);
        } else {
            policyId = parseInt(g_AlarmPolicy.None);
        }
    }
    return policyId;
}

function checkAlarmReceiverValidity() {
    var $receiver = $('#setReceiver'), $phone = $('#setPhone'), $email = $('#setEmail'), 
        $concernStructs = $('#setConcernStructs'), $smsMode = $('#setSmsMode'), $emailMode = $('#setEmailMode');
    var receiver = $receiver.val(), phone = $phone.val(), email = $email.val(), concernStructs = $concernStructs.val();

    if (!/^([\u4E00-\uFA29 ]|[\uE7C7-\uE7F3 ]|[a-zA-Z ])*$/.test(receiver) || receiver.trim() == "") {
        $receiver.focus();
        return false;
    } else if (!/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(phone) || phone == "") {
        $phone.focus();
        return false;
    } else if (!/^([a-zA-Z0-9]+[_|\_|\.|\-]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.|\-]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(email) || email == "") {
        $email.focus();
        return false;
    } else if (concernStructs == null) {
        alert("请选择关注结构物");
        return false;
    } else if ($('#alarmType_all').attr("checked") != 'checked'
        && $('#alarmType_data').attr("checked") != 'checked'
        && $('#alarmType_device').attr("checked") != 'checked') {
        alert("请选择接收告警类型");
        return false;
    } else if ($smsMode.attr("checked") != 'checked' && $emailMode.attr("checked") != 'checked') {
        alert("请选择接收方式");
        return false;
    } else {
        if ($smsMode.attr("checked") == 'checked') {
            if ($('#sms_level1').attr("checked") != "checked"
                && $('#sms_level2').attr("checked") != "checked"
                && $('#sms_level3').attr("checked") != "checked"
                && $('#sms_level4').attr("checked") != "checked") {
                alert("请选择短信接收告警级别");
                return false;
            }
        }
        if ($emailMode.attr("checked") == 'checked') {
            if ($('#email_level1').attr("checked") != "checked"
                && $('#email_level2').attr("checked") != "checked"
                && $('#email_level3').attr("checked") != "checked"
                && $('#email_level4').attr("checked") != "checked") {
                alert("请选择邮件接收告警级别");
                return false;
            }
        }
    }

    return true;
}

function removeAlarmReceiver(receiverId) {
    $('#modalRemoveAlarmReceiver').modal();
    $('#btnRemoveReceiver').unbind("click").click(function () {
        $('#alarmPushConfigRemoveModalLoading').show();
        var url = apiurl + '/alarm-receiver/' + receiverId + '/remove' + '?token=' + getCookie('token');
        $.ajax({
            type: 'post',
            url: url,
            dataType: 'json',
            async: true,
            cache: false,
            statusCode: {
                200: function () {
                    getAlarmReceiversByUser(true);
                    $('#modalRemoveAlarmReceiver').modal('hide');
                },
                202: function (data) {
                    alert(data.Message);
                }
            },
            success: function () {
                $('#alarmPushConfigRemoveModalLoading').hide();
            },
            error: function (xhr) {
                $('#alarmPushConfigRemoveModalLoading').hide();
                if (xhr.status == 403) { // 权限验证出错, 禁止访问
                    logOut();
                } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                    alert("删除告警接收人时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
                }
            }
        });
    });
}

function renderAlarmReceiverTable() {
    $('#tableAlarmReceiver').dataTable({
        "aLengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "全部"]
        ],
        // set the initial value
        "iDisplayLength": 50,
        "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        "sPaginationType": "full_numbers",
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        // "bStateSave": true,
        "aoColumnDefs": [{
            'bSortable': false, // 不排序
            'aTargets': [9] // 不排序的列
        }],
        "aaSorting": [[0, "asc"]] // 第1列升序排序
    });
}