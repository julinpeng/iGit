
$(function () {
    $('#Report').addClass('active');
    getReportTables();
})

function getReportTables()
{
    var userId = getCookie('userId');
    if (userId === '' || userId === null) {
        alert('获取用户Id失败，请检查浏览器Cookie是否已启用');
        logOut();
        return;
    }
    var orgId = getCookie("orgId");
    if (orgId === '' || orgId === null) {
        alert('获取组织Id失败，请检查浏览器Cookie是否已启用');
        logOut();
        return;
    }
    var url_day = apiurl + '/user/' + userId + '/report/day' + '?token=' + getCookie("token");
    var url_day_count = apiurl + '/user/' + userId + '/report-count/day' + '?token=' + getCookie("token");
    setTableOption('table_day', url_day, url_day_count);
    
    var url_week = apiurl + '/user/' + userId + '/report/week' + '?token=' + getCookie("token");
    var url_week_count = apiurl + '/user/' + userId + '/report-count/week' + '?token=' + getCookie("token");
    setTableOption('table_week', url_week, url_week_count);
    
    var url_month = apiurl + '/user/' + userId + '/report/month' + '?token=' + getCookie("token");
    var url_month_count = apiurl + '/user/' + userId + '/report-count/month' + '?token=' + getCookie("token");
    setTableOption('table_month', url_month, url_month_count);

    var url_year = apiurl + '/user/' + userId + '/report/year' + '?token=' + getCookie("token");
    var url_year_count = apiurl + '/user/' + userId + '/report-count/year' + '?token=' + getCookie("token");
    setTableOption('table_year', url_year, url_year_count);
}

function setTableOption(tableId, url, url_count)
{
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




