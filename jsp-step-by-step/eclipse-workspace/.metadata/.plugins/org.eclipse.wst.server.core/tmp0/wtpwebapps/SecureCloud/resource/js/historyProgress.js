var locationUrl = decodeURI(location.href);
var urlParams = locationUrl.split('.aspx?')[1].split('&');
var lineId = urlParams[0].split('lineId=')[1];
$(function () {        
    document.getElementById('LineName').innerText = getCookie('LineName');
    GetLineProgtess();
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
function getProgress(a, b) {
    var nowProgress;
    nowProgress = parseFloat((a / b) * 100);
    return $.number(nowProgress, 2) + "%";
}
/**  
* 获取线路进度列表
*/
function GetLineProgtess() {
    $('#tableProgress').dataTable().fnDestroy();
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
                        var progressId = data[i].ProgressId;
                        var lineId = data[i].LineId;
                        var lineName = data[i].LineName;
                        var unit1 = data[i].Unit1;
                        var lineLength = data[i].LineLength + '(' + data[i].Unit1 + ')';
                        var constructLengthUnit = data[i].ConstructLength + '(' + data[i].Unit1 + ')';
                        var dataTime = TimeFormat(data[i].DataTime);
                        var nowProgress = getProgress(data[i].ConstructLength, data[i].LineLength);
                        var progressNumber = i + 1;
                        var constructDescription = data[i].ConstructDescription == null ? "无" : data[i].ConstructDescription
                        sb.append("<tr id='Line_" + data[i].ProgressId + "'><td style='display:none;'>" + progressId + "</td>");//线路编号
                        sb.append("<td><input type='checkbox' class='checkboxes' value='" + data[i].ProgressId + "' /></td>")
                        sb.append("<td>" + lineLength + "</td>");//线路长度 
                        sb.append("<td>" + constructLengthUnit + "</td>");//施工长度
                        sb.append("<td>" + nowProgress + "</td>");//进度
                        sb.append("<td>" + dataTime + "</td>");//时间
                        sb.append("<td >" + constructDescription + "</td>");//施工状况
                        var str = "<td><a href='#modifyProgressModal' class='editor_edit' data-toggle='modal' >修改</a>|";
                        str += "<a href='#deleteProgressModal' class='editor_delete' data-toggle='modal'>删除</a></td>";
                        sb.append(str);//操作
                        sb.append(" </tr>");
                    }
                }
                $('#tbodyProgress').html("");
                $('#tbodyProgress').html(sb.toString());
               // alert(sb.toString());
                Progress_Datatable();
            } else {
                $('#tbodyProgress').html("");
                Progress_Datatable();
            }
        }
    });
}

/** 
 * 渲染表格样式
 */
function Progress_Datatable() {
    $('#tableProgress').dataTable({
        "aLengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "All"]
        ],
        "iDisplayLength": 50,
        "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aoColumnDefs": [{
            'bSortable': false, // 不排序
            'aTargets': [1, 2, 3, 7] // 不排序的列
        }],
        "aaSorting": [[4, "asc"]] // 第1列升序排序
    });
}

/************************************** 修改 修改施工进度 **************************************/

var modifyProgressLine;
$('#tableProgress').on('click', 'a.editor_edit', function (e) {
    e.preventDefault();
    var tr = $(this).parents('tr');
    var selectedRow = tr[0];
    modifyProgressLine = selectedRow.cells[0].innerText;
    var url = apiurl + '/struct/' + lineId + '/' + parseInt(modifyProgressLine) + '/progressInfo?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function(data) {

            for (var i = 0; i < data.length; i++) {
                $('#modifyProgressName ').val(data[i].LineLength);
                $('#modifyProgressLength').val(data[i].ConstructLength);
                $('#modifyProgressUnit').val(data[i].Unit1);
                $("#modifyProgressLine").val(data[i].LineName);
                $("#modifyProgressContent").val(data[i].ConstructDescription);
                var dataTime = TimeFormat(data[i].DataTime);
                $("#modifyProgressData").val(dataTime);
            }
        }
    });
});


//进度 修改重置
$('#btnResetModifyProgress').on('click', function() {
    $("#modifyProgressData").val(showdate(0));
    $('#modifyProgressLength').val('');
});

//进度保存修改
$('#btnSaveModifyProgress').click(function () {
    var modifyaddProgressLength = document.getElementById("modifyProgressName").value;
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
            return;

        }
        var data = {

            "LineId": lineId,
            "ConstructLength": modifyProgressLength,
            "Unit": modifyProgressUnit,
            "dataTime": modifyProgressData,
            "ConstructDescription": modifyProgressContent
        };
        var url = apiurl + '/progress/modify/' + parseInt(modifyProgressLine) + '?token=' + getCookie('token');
        $.ajax({
            type: 'post',
            url: url,
            data: data,
            
            statusCode: {
                202: function () {
                    $('#tableProgress').dataTable().fnDestroy();
                    GetLineProgtess();
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

/************************************** 删除施工进度 **************************************/

//获取全选的checkbox元素的value属性
$('#btndelete').click(function () {
    var array = new Array();
    $("input.checkboxes:checked").each(function () {
        //console.log(this.value);
        array.push(this.value);
    });
    if (array.length == 0) {
        alert('请先选中进度再批量删除!');
    } else if (array.length > 25) {
        alert("一次处理的进度记录不能超过25条，请重新选择!");
    } else {
        if (!confirm("确定要删除吗？")) {
            return;
        }
        for (var i = 0; i < array.length; i++) {
            var url = apiurl + '/progress/remove/' + parseInt(array[i]) + '?token=' + getCookie('token');
            $.ajax({
                type: 'post',
                url: url,

                statusCode: {
                    202: function () {
                       
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
        $('#tableProgress').dataTable().fnDestroy();
        GetLineProgtess();
       
       
    }
});

//获取全选的checkbox元素的value属性
jQuery('#tableProgress .group-checkable').change(function () {
    var checked = $(this).is(":checked");
    $("#tableProgress .checkboxes").each(function () {
        $(this).prop("checked", checked); //添加属性对checkedbox是个特例        
    });
    jQuery.uniform.update("#tableProgress .checkboxes");
});

//删除单个
var deleteLineId;
$('#tbodyProgress').on('click', 'a.editor_delete', function (e) {
    e.preventDefault();
    var tr = $(this).parents('tr');
    var selectedRow = tr[0];
    deleteLineId = selectedRow.cells[0].innerText;
    $('#alertMsg').text("确定删除该记录？");

});

//线路确定删除
$('#btnProgressDelete').click(function () {
    var url = apiurl + '/progress/remove/' + parseInt(deleteLineId) + '?token=' + getCookie('token');
    $.ajax({
        type: 'post',
        url: url,
        statusCode: {
            202: function () {
                alert('删除成功');
                $('#tableProgress').dataTable().fnDestroy();
                GetLineProgtess();
                $("#deleteProgressModal").modal("hide");
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
});
/************************************** end 删除施工进度 ***********************************/