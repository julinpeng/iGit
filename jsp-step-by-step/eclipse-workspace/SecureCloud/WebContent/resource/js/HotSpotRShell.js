function GetStructTypeRShell(structId, urlHeapMapName) {
    var url = apiurl + '/structTypeRShell/' + structId + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            structType = data;
            initHeapMap(urlHeapMapName, structType);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错,禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取截面信息时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 热点图上创建热点
 */
function createHotspotItemRShell(hotspot, type) {
    if (hotspot.xAxis == null || hotspot.yAxis == null) {
        return;
    }
    var sensorId = "";
    if (hotspot.groupId != null) {
        sensorId = hotspot.groupId;
    } else if (hotspot.sensorId != null) {
        sensorId = hotspot.sensorId;
    } else {
        alert("获取传感器失败");
    }
    addHotspotTitle(hotspot, sensorId);
}
function addHotspotTitle( hotspot, sensorId) {
    var x = hotspot.xAxis * g_offsetWidth - 8;
    var y = hotspot.yAxis * g_offsetHeight - 8;
    var src;
    if (hotspot.warningLevel == 5) {
        src = '/resource/img/factorIcon/icon-' + hotspot.productTypeId + '-' + hotspot.warningLevel + '.png';
    } else {
        src = '/resource/img/factorGif/icon-' + hotspot.productTypeId + '-' + hotspot.warningLevel + '.gif';
    }
    var iconType = "icon-" + hotspot.productTypeId;
    var imgEle = '<img id="' + sensorId + '" class="' + iconType + ' spot"' + ' src="' + src + '"  style="top: '
        + y + 'px; left: ' + x + 'px; position: absolute; cursor: pointer;" width="16" height="16"'
        + ' onclick="clickMonitorFactor(' + parseInt(hotspot.factorId) + ',' + parseInt(sensorId) + ')" />';

    $('#topoContainer').append(imgEle);

    $(".spot").tooltip({
        html: true,
        placement: 'bottom'
    });

}
