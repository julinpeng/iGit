var structs;
var sensorNum;
var dataNum;
var map;
var slider;
var shigongMarkers = [];
var yunyingMarkers = [];
var markers = [];
var markersByType = [];
var selectedMarker;

function onstructTypeChange() {
    var items = '';
    var count = 0;
    var type = $('#structType').val();
    if (type == '所有类型') {
        count = markers.length;
        for (var i = 0; i < markers.length; i++) {
            items += '<p class="structItem" onclick="onstructItemClick(this)" onmouseover="onstructItemMouseover(this)" onmouseout="onstructItemMouseout(this)">' +
                markers[i][0] +
                '</p>';
            markers[i][1].show();
        }
    } else {
        for (var i = 0; i < markers.length; i++) {
            markers[i][1].hide();
        }
        count = markersByType[type].length;
        for (var i = 0; i < markersByType[type].length; i++) {
            items += '<p class="structItem" onclick="onstructItemClick(this)" onmouseover="onstructItemMouseover(this)" onmouseout="onstructItemMouseout(this)">' +
                markersByType[type][i][0] +
                '</p>';
            markersByType[type][i][1].show();
        }
    }
    $('#structList').html(items);
    $('#structCount').html(count);
    map.centerAndZoom(new BMap.Point(112.381382, 35.00116), 5);
}

function onstructItemClick(sender) {
    var structName = $(sender).html();
    if (selectedMarker != null) {
        selectedMarker.setAnimation(null);
    }
    for (var i = 0; i < markers.length; i++) {
        var m = markers[i];
        if (m[0] == structName) {
            m[1].setAnimation(BMAP_ANIMATION_BOUNCE);
            map.centerAndZoom(m[1].getPosition(), 13);
            var _iw = createInfoWindow(i);
            m[1].openInfoWindow(_iw);

            selectedMarker = m[1];
            break;
        }
    }
}

function onstructItemMouseover(sender) {
    $(sender).css('background', '#ccc');
}

function onstructItemMouseout(sender) {
    $(sender).css('background', '#f2f2f2');
}

function createInfoWindow(i) {
    var struct = structs[i];
    var iw = new BMap.InfoWindow("", { enableMessage: false });
    iw.setTitle("<label style=\"font-size: 13px;font-weight: bold;color: #CD533F;font-family: 'microsoft yahei';\">" + struct.structName + "</label>");
    if(struct.description != null){
        iw.setContent();
    }

    return iw;
}

function StructListControl() {
    // 设置默认停靠位置和偏移量  
    this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMap.Size(0, 0);
}

function drawMap() {
    map = new BMap.Map("map");
    map.setMapStyle({ style: 'hardedge' });
    map.centerAndZoom(new BMap.Point(112.381382, 35.00116), 5);
    map.enableInertialDragging();
    map.disableScrollWheelZoom();
    map.clearOverlays();

    // 标点
    var fsOrgId = 67;
    var url = apiurl + '/struct/intro/' + fsOrgId + '?token=';
    $.support.cors = true;
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function (d) {
            console.log(d);
            structs = d.stc;
            sensorNum = d.sen;
            dataNum = d.num;
            drawMarkers(d)
        },
        error: function(xhr){
            console.log(xhr.responseText);
        }
    });
}

function drawMarkers(d){
    // 转换 marker
    var data = structs;
    for (var index = 0; index < data.length; index++) {
        var struct = data[index];
        var point = new BMap.Point(struct.longitude, struct.latitude);
        var myIcon;
        var marker;
        if (struct.projectStatus == "施工期") {
            myIcon = new BMap.Icon("resource/img/googleMap/marker_orange.png", new BMap.Size(20, 34), { anchor: new BMap.Size(10, 34) });
            marker = new BMap.Marker(point, { icon: myIcon }); // 创建标注
            shigongMarkers.push(marker);
        } else {
            myIcon = new BMap.Icon("resource/img/googleMap/marker_green.png", new BMap.Size(20, 34), { anchor: new BMap.Size(10, 34) });
            marker = new BMap.Marker(point, { icon: myIcon }); // 创建标注
            yunyingMarkers.push(marker);
        }
        markers.push([struct.structName, marker]);
        if (markersByType[struct.structType] == null) {
            markersByType.push(struct.structType);
            markersByType[struct.structType] = [];
            markersByType[struct.structType].push([struct.structName, marker]);
        } else {
            markersByType[struct.structType].push([struct.structName, marker]);
        }

        map.addOverlay(marker);

        (function() {
            var i = index;
            var _iw = createInfoWindow(i);
            var _marker = marker;
            _marker.addEventListener("click", function () {
                if (selectedMarker != null) {
                    selectedMarker.setAnimation(null);
                }
                _marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                map.centerAndZoom(_marker.getPosition(), 13);
                selectedMarker = _marker;

                this.openInfoWindow(_iw);
            });
        })();
    }

    // 控件
    StructListControl.prototype = new BMap.Control();

    StructListControl.prototype.initialize = function(map) {
        // 类型option
        var options = '';
        for (var i = 0; i < markersByType.length; i++) {
            options += '<option value="' + markersByType[i] + '">' + markersByType[i] + '</option>';
        }
        // 结构物item
        var items = '';
        for (var i = 0; i < markers.length; i++) {
            items += '<p class="structItem" onclick="onstructItemClick(this)" onmouseover="onstructItemMouseover(this)" onmouseout="onstructItemMouseout(this)">' +
            markers[i][0] +
            '</p>';
        }

        var div = document.createElement("div");
        $(div).html('<div id="mapIcon" onselectstart="return false;">' +
        '<div id="iconBg"></div>' +
        '<div id="iconWrap">' +
        '<div>' +
        '现云平台共接入<br />结构物数量:<strong>' + data.length.toString() + '</strong>个' +
        '</div>' +
        '<div>' +
        '传感器数量:<strong>' + sensorNum + '</strong>个' +
        '</div>' +
        '<div>' +
        '数据量:<strong>' + dataNum + '</strong>条' +
        '</div>' +
        '<br />' +
        '<div class="yyWrap">' +
        '<span class="colorFlag"></span>' +
        '<span class="txt">运营期:<strong>' + yunyingMarkers.length.toString() + '</strong>个</span>' +
        '</div>' +
        '<div class="sgWrap">' +
        '<span class="colorFlag"></span>' +
        '<span class="txt">施工期:<strong>' + shigongMarkers.length.toString() + '个</strong></span>' +
        '</div>' +
        '<br />' +
        '<div>' +
        '<select id="structType" style="width: 150px;margin-right:6px; " onchange="onstructTypeChange()" >' +
        '<option value="所有类型">所有类型</option>' +
        options +
        '</select>' +
        '<strong id="structCount">' + data.length.toString() + '</strong>个' +
        '</div>' +
        '<div id="structList">' +
        items +
        '</div>' +
        '</div>' +
        '</div>');

        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
    };

    var cr = new StructListControl();
    map.addControl(cr);

    var opts = { anchor: BMAP_ANCHOR_BOTTOM_RIGHT, offset: new BMap.Size(5, 5) };
    map.addControl(new BMap.ScaleControl(opts));
    map.addControl(new BMap.NavigationControl());
}

$(document).ready(function () {
    drawMap();
});



