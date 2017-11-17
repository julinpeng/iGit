$(function () {
    $('#systemConfig').addClass('active');
    $('#userLog').addClass('active');
    GetUserLogTable();

    $('#btnDownload').click(function () {
        var url_dowmload = apiurl + '/user/' + getCookie("userId") + '/log' + '?token=' + getCookie("token");
        var href = '/ExcelDownload.ashx?Url=' + url_dowmload;
        window.open(href);
    })
})

function GetUserLogTable() {
    $('#UserLogTable').dataTable().fnDestroy();
    var url = apiurl + '/user/' + getCookie("userId") + '/log' + '?token=' + getCookie("token");
    var url_count = apiurl + '/user/' + getCookie("userId") + '/log-count' + '?token=' + getCookie("token");
    $('#UserLogTable').dataTable({
        "aLengthMenu": [
                [10, 25, 50],
                [10, 25, 50]
        ],

        "iDisplayLength": 25,
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aoColumns": [
               { "mData": 'userlog_name' },
               { "mData": 'userlog_time' },
               { "mData": 'userlog_clientType' },
               { "mData": 'userlog_content' },
               { "mData": 'userlog_parameter' }
        ],
        "bSort": false,
        "sPaginationType": "full_numbers",
        //"bFilter": false,//禁用搜索框
        "bProcessing": true,
        "bServerSide": true,
        "sAjaxSource": "/userlog.ashx?now=" + Math.random() + "&Url=" + url + "&Url_count=" + url_count
    });
}

function showMsg(msg) {
    alert(msg);
}