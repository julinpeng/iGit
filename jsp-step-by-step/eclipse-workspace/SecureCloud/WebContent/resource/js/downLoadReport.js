function DownLoadReport(rptId) {
    var url = 'http://anxinyun.cn/Support/DownloadReport.ashx?rptId=' + rptId + '&token=' + getCookie("token");
    //var url = '/Support/DownloadReport.ashx?rptId=' + rptId;
    window.open(url);
}
