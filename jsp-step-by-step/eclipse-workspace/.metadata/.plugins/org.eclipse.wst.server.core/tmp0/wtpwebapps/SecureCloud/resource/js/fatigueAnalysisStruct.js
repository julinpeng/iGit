var nowstructId = null;
var g_userId = null;
$(function () {
    $('#data-contact').addClass('active');
    $('#FatigueAnalysis').addClass('active');
    g_userId = getCookie("userId");
    if (g_userId === "") {
        alert("获取用户编号失败, 请检查浏览器Cookie是否已启用");
        logOut();
        return;
    }
    nowstructId = getCookie("nowStructId");
    structSelectList(nowstructId);
});
   
$('#structList').change(function () {
    var struct = $('#structList').find('option:selected')[0];
    var structId = parseInt(struct.id.split('optionStruct-')[1]);
    getFactorInStrain(structId);
});

function structSelectList(nowstructId) {
    var url = apiurl + '/user/' + g_userId + '/structs' + '?token=' + getCookie("token");
    url += "&fatigueDamge=true";
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data == null || data.length === 0) {
                display('block');
                selectListFilter('structList', '<option>' + structString + '</option>');
                $("#factorList").html("");
                $("#factorList").selectpicker('refresh');
                // 刷新列表,下面两行必须！
                selectListFilter('sensorList', '<option>' + sensorString + '</option>');
                return;
            }
            var structOptions = "";
            $.each(data, function (i, item) {
                structOptions += "<option id='optionStruct-" + item.structId
                    + "' value='optionStruct-" + item.structId + "'>" + item.structName + "</option>";
            });
            $("#structList").removeClass("chzn-done");
            $("#structList_chzn").remove();
            $("#structList").html(structOptions);
            if (nowstructId != null && nowstructId != undefined && nowstructId !== "") {
                $("#structList").val("optionStruct-" + nowstructId);
            }
            $("#structList").chosen({
                no_results_text: "没有找到"
            });
            var struct = $('#structList').find('option:selected')[0];
            nowstructId = parseInt(struct.id.split('optionStruct-')[1]);
            getFactorInStrain(nowstructId);
        },
        error: function (xmlHttpRequest) {
            if (xmlHttpRequest.status === 403) {
                alert("权限验证出错");
                logOut();
            } else if (xmlHttpRequest.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取用户下结构物列表时发生异常.\r\n" + xmlHttpRequest.status + " : " + xmlHttpRequest.statusText);
            }
        }
    });
}

$('#factorList').change(function () {
    var struct = $('#structList').find('option:selected')[0];
    var structId = parseInt(struct.id.split('optionStruct-')[1]);
    var factor = $('#factorList').find('option:selected')[0];
    var factorId = parseInt(factor.id.split('optionFactor-')[1]);
    getConfiguredSensors(structId, factorId);
});

function getFactorInStrain(structId) {
    var themeIds = "3,24";
    var url = apiurl + '/struct/' + structId + '/' + themeIds + '/factors?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function(data) {
            if (data == null || data.length === 0) {
                display('block');
                $("#factorList").html("");
                $("#factorList").selectpicker('refresh');
                // 刷新列表,下面两行必须！
                selectListFilter('sensorList', '<option>' + sensorString + '</option>');
                return;
            }
            var factorOptions = "";
            $.each(data, function(i, item) {
                factorOptions += "<option id='optionFactor-" + item.factorId
                    + "' value='optionFactor-" + item.factorId + "'>" + item.factorName + "</option>";
            });
            $("#factorList").html(factorOptions);
            $("#factorList").selectpicker('refresh');
            var factor = $('#factorList').find('option:selected')[0];
            var factorId = parseInt(factor.id.split('optionFactor-')[1]);
            getConfiguredSensors(structId, factorId);
        },
        error: function(xmlHttpRequest) {
            if (xmlHttpRequest.status === 403) {
                alert("权限验证出错");
                logOut();
            } else if (xmlHttpRequest.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物应力应变、振动主题下监测因素列表时发生异常.\r\n" + xmlHttpRequest.status + " : " + xmlHttpRequest.statusText);
            }
        }
    });
}

//获取用户侧已配置参数的传感器
function getConfiguredSensors(structId, factorId) {
    var url = apiurl + '/struct/' + structId + '/factor/' + factorId + '/sensor/config?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function(data) {
            if (data == null || data.length === 0) {
                display("block");
                // 刷新列表,下面两行必须！
                selectListFilter('sensorList', '<option>' + sensorString + '</option>');
                return;
            }
            display("none");
            var sensorOptions = "";
            $.each(data, function(i, item) {
                sensorOptions += "<option id='sensor-" + item.sensorId
                    + "' value='optionSensor-" + item.sensorId + "'>" + item.location + "</option>";
            });
            //$("#sensorList").html(sensorOptions);
            //$("#sensorList").selectpicker('refresh');
            // 刷新列表,下面两行必须！
            selectListFilter('sensorList', sensorOptions);
            var sensor = $('#sensorList').find('option:selected')[0];
            var sensorId = parseInt(sensor.id.split('sensor-')[1]);
            var dpformTime = $('#dpform').val();
            showChartTable(sensorId, dpformTime);
        },
        error: function(xmlHttpRequest) {
            if (xmlHttpRequest.status === 403) {
                alert("权限验证出错");
                logOut();
            } else if (xmlHttpRequest.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取监测因素下传感器列表时发生异常.\r\n" + xmlHttpRequest.status + " : " + xmlHttpRequest.statusText);
            }
        }
    });
}

$('#sensorList').change(function () {
    var sensor = $('#sensorList').find('option:selected')[0];
    var sensorId = parseInt(sensor.id.split('sensor-')[1]);
    var dpformTime = $('#dpform').val();
    showChartTable(sensorId, dpformTime);
});

