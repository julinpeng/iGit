
$(function () {
    $('#Progress').show();
    $('#Progress').addClass('active');
    if (location.href.split('=')[1] == null || location.href.split('=')[1] == undefined) {
        var nowstructId = location.href.split('=')[1];
    }
    else {
        var nowstructId = location.href.split('=')[1].replace(/#/, "");
    }
    if (nowstructId != null && nowstructId != undefined && nowstructId != "") {
        setCookie('nowStructId', nowstructId);
    }
    showStructList(getCookie("nowStructId"));
    getLine(getCookie("nowStructId"));   
});
//时间控件
$('#dpform1').datetimepicker({
    format: 'yyyy-MM-dd hh:dd:ss',
    language: 'pt-BR'
});
$('#dpdend1').datetimepicker({
    format: 'yyyy-MM-dd hh:dd:ss',
    language: 'pt-BR'
});
function showdate(n) {
    var uom = new Date();
    uom.setDate(uom.getDate() + n);
    uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate() + " " + uom.getHours() + ":" + uom.getMinutes() + ":" + uom.getSeconds();
    return uom.replace(/\b(\w)\b/g, '0$1');//时间的格式
}
//结构物
function showStructList(structId) {
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
        cache: false,
        success: function (data) {
            if (data == null || data.length == 0) {
                return;
            }
            var sb = new StringBuffer();
            var flag = true;
            for (var i = 0; i < data.length; i++) {
                if (data[i].structId == parseInt(structId)) {//选择那个哪个为第一个
                    $('.breadcrumb li small a').html(data[i].structName + '<i class="icon-angle-down"></i>');

                    setCookie('nowStructName', data[i].structName, null);
                    if (i == 0) {
                        flag = false;
                    }
                } else {
                    if (i > 0 && flag) {
                        sb.append('<li class="divider"></li>');
                    }
                    flag = true;
                    sb.append('<li><a href="/ProgressConfig.aspx?id=' + data[i].structId + '">' + data[i].structName + '</a></li>');
                }
            }
            $('.breadcrumb li small ul').html(sb.toString());
            $('.breadcrumb li small ul').selectpicker('refresh');
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                alert("权限验证出错");
                logOut();
            }
            else if (XMLHttpRequest.status == 400) {
            }
            else if (XMLHttpRequest.status == 500) {
            }
            else {
            }
        }
    });
}

//毫秒级时间
function TimeFormat(jsonDate) {
    jsonDate = jsonDate.replace("/Date(", "").replace(")/", "");
    if (jsonDate.indexOf("+") > 0) {
        jsonDate = jsonDate.substring(0, jsonDate.indexOf("+"));
    }
    else if (jsonDate.indexOf("-") > 0) {
        jsonDate = jsonDate.substring(0, jsonDate.indexOf("-"));
    }
    var milliseconds = parseInt(jsonDate, 10);
    var date = new Date(milliseconds);
    //转换成标准的“月：MM”
    var normalizedMonth = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    var dateTime = date.getFullYear() + "-" + normalizedMonth + "-" + normalizeTimeFormat(date.getDate())
                    + " " + normalizeTimeFormat(date.getHours()) + ":" + normalizeTimeFormat(date.getMinutes()) + ":" + normalizeTimeFormat(date.getSeconds());
    return dateTime;
}

//标准化时间格式
function normalizeTimeFormat(time) {
    if (time < 10) {
        time = "0" + time;
    }
    return time;
}

function getProgress( a, b) {
    var nowProgress;
     nowProgress = parseFloat((a / b) * 100);
    return $.number(nowProgress, 2)+"%";
}


function getLine(structId) {
    var url = apiurl + '/struct/' + structId + '/constructInfo/list?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function (data) {
            if (data.length >= 1) {
                var sb = new StringBuffer();
                for (var i = 0; i < data.length; i++) {
                    if (data[i].ConstructLength != null) {
                        var progressId = data[i].ProgressId;
                        var lineId = data[i].LineId;
                        var lineName = data[i].LineName;
                        var unit1 = data[i].Unit1;
                        var lineLength = data[i].LineLength + ' (' + data[i].Unit1 + ')';
                        var constructLengthUnit = data[i].ConstructLength + ' (' + data[i].Unit1 + ')';
                        var dataTime = TimeFormat(data[i].DataTime);
                        var nowProgress = getProgress(data[i].ConstructLength, data[i].LineLength);
                        var constructDescription = data[i].ConstructDescription == null ? "无" : data[i].ConstructDescription
                        sb.append("<tr id='Line_" + data[i].ProgressId + "'><td style='display:none;'>" + progressId + "</td>");//线路编号
                        sb.append("<td style='display:none;'>" + lineId + "</td>");//线路id
                        sb.append("<td >" + lineName + "</td>");//线路名称
                        sb.append("<td >" + lineLength + "</td>");//线路长度 
                        sb.append("<td >" + constructLengthUnit + "</td>");//施工长度
                        sb.append("<td >" + nowProgress + "</td>");//当前进度
                        sb.append("<td >" + constructDescription + "</td>");//施工状况
                        sb.append("<td >" + dataTime + "</td>");//时间

                        var str = "<td><a href='#modifyProgressModal' class='editor_edit' data-toggle='modal' >修改当前记录</a>|";
                        str += "<a class='aProgressLook' href='javascript:;'>编辑历史记录</a></td>";
                        sb.append(str);//操作 
                        sb.append(" </tr>");
                    }
                }
                $('#tbodyProgress').html("");
                
                $('#tbodyProgress').html(sb.toString());
                Progress_Datatable();
            }
        }
    });
}

/**
 * “查看”点击事件
 */
$('#tableProgress').on('click', 'a.aProgressLook', function (e) {
    e.preventDefault();
    var tr = $(this).parents('tr');
    var selectedRow = tr[0];
    var lineName = selectedRow.cells[2].innerText;    
    var lineId = selectedRow.cells[1].innerText;
    setCookie('LineName', lineName);

    window.location.href = 'ProgressLook.aspx?lineId=' + lineId;
});

function Progress_Datatable() {
    $('#tableProgress').dataTable({
        "aLengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "All"]
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
            'aTargets': [1,2,8,3,4] // 不排序的列
        }],
        "aaSorting": [[6, "asc"]] // 第1列升序排序
    });
}

/************************************** 增加施工进度 **************************************/
$('#btnAddProgress').on('click', function () {
    $('#addProgressNumber').val('');
    $('#addProgressLength').val('');
    $('#addProgressContent').val('');
    $("#addProgressData").val(showdate(0));
    var url = apiurl + '/struct/' + getCookie("nowStructId") + '/constructInfo/list?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function(data) {
            if (data.length == 0) {
                alert("该结构物没有配置施工线路");
                return;
            }
            var progress = '';
            for (var i = 0; i < data.length; i++) {
                progress += '<option  value=" ' + i + ' ">' + data[i].LineName + '</option>';
            }
            //线路选择
            $('#addProgressLine').html(progress);
            $('#addProgressLine').selectpicker('refresh');
            $('#addProgressLine').change(function() {
                var pi = 0;
                if (document.getElementById("addProgressLine").value == 0) {
                    pi = 0;
                } else {
                    pi = parseInt(document.getElementById("addProgressLine").value);
                }
                $('#addProgressName').val(data[pi].LineLength);
                $('#addLineId').val(data[pi].LineId); //线路编号
                var dataTime = data[pi].DataTime != null ? TimeFormat(data[pi].DataTime) : "";
                var progress1 = getProgress(data[pi].ConstructLength, data[pi].LineLength);
                var constructLength = data[pi].ConstructLength;
                if (constructLength == null) {
                    constructLength = 0;
                }
                $('#addProgressNumber').val(constructLength + data[pi].Unit1 + "/" + progress1 + "(" + dataTime + ')');
                $('#addLineUnit').val(data[pi].Unit1);
            });
            $('#addProgressLine').change();
        }
    });
});

//进度 增加重置
$('#btnResetProgress').on('click', function () {
    var url = apiurl + '/struct/' + getCookie("nowStructId") + '/constructInfo/list?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function(data) {
            var progress = '';
            for (var i = 0; i < data.length; i++) {
                progress += '<option  value="' + data[i].LineId + '">' + data[i].LineName + '</option>';
                $('#addProgressName').val(data[0].LineLength);
                $('#addLineId').val(data[0].LineId) //线路编号
                var nowProgress = getProgress(data[0].ConstructLength, data[0].LineLength);
                var dataTime = TimeFormat(data[0].DataTime);
                var constructLength = data[0].ConstructLength;
                if (constructLength == null) {
                    constructLength = 0;
                }
                $('#addProgressNumber').val(constructLength + data[0].Unit1 + "/" + nowProgress + "(" + dataTime + ')');
            }
            //线路选择
            $('#addProgressLine').html(progress);
            $('#addProgressLine').selectpicker('refresh');
        }
    });
    $("#addProgressData").val(showdate(0));
    //$('#addProgressNumber').val('');
    $('#addProgressLength').val('');    
    
});
//进度增加
var addLineId;
$('#btnSaveProgress').click(function () {
    
    var a = document.getElementById("addLineId").value;//线路编号    
    var flag = 0;
    var lineLength = document.getElementById("addProgressName").value;//长度
    var addProgressLength = document.getElementById("addProgressLength").value;//长度
    var addLineUnit = document.getElementById("addLineUnit").value;//长度单位
    var addProgressContent = document.getElementById("addProgressContent").value
    var addProgressData = document.getElementById("addProgressData").value;//时间
    if (!/^\d{1,8}$/.test(addProgressLength) || addProgressLength == "") {
        if (!/^\d{1,8}\.\d{1,4}$/.test(addProgressLength)) {
            alert("请输入正确的格式！");
            $('#addProgressLength').focus();
            return flag = 1;
        }
    }
    
    if (flag == 0) {
        if (parseFloat(addProgressLength) > parseFloat(lineLength)) {
            alert('已施工长度不能大于线路长度！');
            $('#addProgressLength').focus();
            return;

        }

        var data = {
            "LineId": a,
            "ConstructLength": addProgressLength,
            "Unit": addLineUnit,
            "dataTime": addProgressData,
            "ConstructDescription":addProgressContent
        };
        addLineId = parseInt(a);
        var url = apiurl + '/struct/' + addLineId + '/progress/add?token=' + getCookie('token');
        $.ajax({
            type: 'post',
            url: url,
            data: data,
            statusCode: {
                202: function () {
                    alert('保存成功');
                    $('#tableProgress').dataTable().fnDestroy();
                    getLine(structId);
                    $("#addProgressModal").modal("hide");
                },
                403: function () {
                    alert("权限验证出错");
                    logOut();
                },
                400: function () {
                    alert("添加失败");
                },
                500: function () {
                    alert("添加失败");
                },
                404: function () {
                    alert('url错误');
                },
                406: function () {
                    alert('添加失败');
                }
            }
        });
    }    
});
/************************************** end 增加施工进度 **************************************/
/************************************** 修改 修改施工进度 **************************************/

var modifyProgressLine;
$('#tableProgress').on('click', 'a.editor_edit', function (e) {
    e.preventDefault();
    var tr = $(this).parents('tr');
    var selectedRow = tr[0];
    modifyProgressLine = selectedRow.cells[0].innerText;
    var url = apiurl + '/struct/' + getCookie("nowStructId") + '/constructInfo/list?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function(data) {
            var progress = '';
            var bselect = '';
            for (var i = 0; i < data.length; i++) {
                if (data[i].ProgressId == modifyProgressLine) {
                    $('#modifyLineId ').val(data[i].LineId);
                    $('#modifyProgressName ').val(data[i].LineLength);
                    $('#modifyProgressLength').val(data[i].ConstructLength);
                    $('#modifyProgressUnit').val(data[i].Unit1);
                    $("#modifyProgressLine").val(data[i].LineName);
                    $('#modifyProgressContent').val(data[i].ConstructDescription == null ? "" : data[i].ConstructDescription);
                    var dataTime = TimeFormat(data[i].DataTime);
                    $("#modifyProgressData").val(dataTime);
                }
            }
        }
    });
});


//进度 修改重置
$('#btnResetModifyProgress').on('click', function() {
    $("#modifyProgressData").val(showdate(0));
    $('#modifyProgressLength').val('');
    $('#modifyLineId').val('');
});

//进度保存修改
$('#btnSaveModifyProgress').click(function () {
    var modifyaddProgressLength = document.getElementById("modifyProgressName").value;
    var modifyProgress = document.getElementById("modifyLineId").value;//线路编号              
    var modifyProgressLength = document.getElementById("modifyProgressLength").value;
    var modifyProgressUnit = document.getElementById("modifyProgressUnit").value;
    var modifyProgressData = document.getElementById("modifyProgressData").value;
    var modifyProgressContent = document.getElementById("modifyProgressContent").value;
    var flag = 0;
    if (!/^\d{1,8}$/.test(modifyProgressLength) || modifyProgressLength == "") {
        if (!/^\d{1,8}\.\d{1,4}$/.test(modifyProgressLength)) {
            alert("请输入正确的格式！");
            $('#modifyProgressLength').focus();
            return flag = 1;
        }
    }
      
    if (flag == 0) {
        if (parseFloat(modifyProgressLength) > parseFloat(modifyaddProgressLength)) {
            alert('已施工长度不能大于线路长度！');
            $('#modifyProgressLength').focus();
            return ;

        }
       var data = {
           "LineId": modifyProgress,
            "ConstructLength": modifyProgressLength,
            "Unit": modifyProgressUnit,            
            "dataTime": modifyProgressData,
            "ConstructDescription":modifyProgressContent
        };
        var url = apiurl + '/progress/modify/' + parseInt(modifyProgressLine) + '?token=' + getCookie('token');
        $.ajax({
            type: 'post',
            url: url,
            data: data,
            statusCode: {
                202: function () {
                    $('#tableProgress').dataTable().fnDestroy();
                    getLine(structId);
                    alert("修改成功");
                    $("#modifyProgressModal").modal("hide");
                },
                403: function () {
                    alert("权限验证出错");
                    logOut();
                },
                400: function () {
                    alert("修改失败");
                },
                500: function () {
                    alert("修改失败");
                },
                404: function () {
                    alert('url错误');
                }
            }
        });
    }
});
/************************************** end 修改施工进度 **************************************/
