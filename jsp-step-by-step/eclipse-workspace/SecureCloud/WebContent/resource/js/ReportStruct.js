var nowstructId;
$(function () {
    $('#data-contact').addClass('active');
    $('#ReportStruct').addClass('active');

    if (location.href.split('=')[1] == null || location.href.split('=')[1] == undefined) {
        nowstructId = getCookie("nowStructId");
    } else {
        nowstructId = location.href.split('=')[1];
    }

    if (nowstructId != null && nowstructId != undefined && nowstructId != "") {
        setCookie('nowStructId', nowstructId);
    }
    structShow(nowstructId);

});

$('#structList').change(function () {
    nowstructId = document.getElementById("structList").value;
    getReportTables(nowstructId);
});


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
        cache: false,
        success: function (data) {
            if (data === null || data.length === 0) {
                return;
            }
            var sb = new StringBuffer();
            for (var i = 0; i < data.length; i++) {
                if (data[i].structId == parseInt(nowstructId)) { //选择那个哪个为第一个
                    sb += '<option id="optionStruct-' + data[i].structId + '" value="' + data[i].structId + '" selected="selected">' + data[i].structName + '</option>';

                } else {
                    sb += '<option id="optionStruct-' + data[i].structId + '" value="' + data[i].structId + '">' + data[i].structName + '</option>';

                }
            }
            $('#structList').removeClass('chzn-done');
            $('#structList_chzn').remove();
            $('#structList').html(sb.toString());

            // 筛选框,必须！
            $('#structList').chosen({
                no_results_text: "没有找到",
                allow_single_de: true
            });
            getReportTables(nowstructId);
        },
        error: function (xmlHttpRequest) {
            if (xmlHttpRequest.status == 403) {
                alert("权限验证出错");
                logOut();
            }
            else if (xmlHttpRequest.status == 400) {
                //alert("参数错误");
            }
            else if (xmlHttpRequest.status == 500) {
                //alert("内部异常");
            }
            else {
                //alert('url错误');
            }
        }
    });
}

function getReportTables(structId) {

    var url_day = apiurl + '/struct/' + structId + '/report/day' + '?token=' + getCookie("token");
    var url_day_count = apiurl + '/struct/' + structId + '/report-count/day' + '?token=' + getCookie("token");
    setTableOption('DayTable', url_day, url_day_count);

    var url_week = apiurl + '/struct/' + structId + '/report/week' + '?token=' + getCookie("token");
    var url_week_count = apiurl + '/struct/' + structId + '/report-count/week' + '?token=' + getCookie("token");
    setTableOption('WeekTable', url_week, url_week_count);

    var url_month = apiurl + '/struct/' + structId + '/report/month' + '?token=' + getCookie("token");
    var url_month_count = apiurl + '/struct/' + structId + '/report-count/month' + '?token=' + getCookie("token");
    setTableOption('MonthTable', url_month, url_month_count);

    var url_year = apiurl + '/struct/' + structId + '/report/year' + '?token=' + getCookie("token");
    var url_year_count = apiurl + '/struct/' + structId + '/report-count/year' + '?token=' + getCookie("token");
    setTableOption('YearTable', url_year, url_year_count);
}

function setTableOption(tableId, url, url_count) {
    $('#' + tableId).dataTable().fnDestroy();
    $('#' + tableId).dataTable({
        "bAutoWidth": false,
        "aLengthMenu": [
                [10, 25, 50, -1],
                [10, 25, 50, "All"]
        ],

        "iDisplayLength": 10,//每页显示个数
        "bStateSave": true,
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aoColumns": [
               { "mData": 'report_name' },
               { "mData": 'report_time' },
               { "mData": 'report_download' }

        ],
        "bSort": false,//是否启动各个字段的排序功能
        "sPaginationType": "full_numbers",//默认翻页样式设置
        //"bFilter": false,//禁用搜索框
        "bProcessing": true,//table数据载入时，是否显示进度提示
        "bServerSide": true,//是否启动服务端数据导入，即要和AjaxSource结合使用
        "sAjaxSource": "/reportHandler.ashx?now=" + Math.random() + "&Url=" + url + "&Url_count=" + url_count
    });
}


