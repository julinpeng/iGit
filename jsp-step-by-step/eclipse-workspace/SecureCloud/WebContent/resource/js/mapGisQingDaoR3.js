/**
 * ---------------------------------------------------------------------------------
 * <copyright file="mapGisQingDaoR3.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2015 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：青岛地铁R3需求定制——在地图上标示青岛地铁R3线路和站点文本标注.
 *
 * 创建标识：PengLing20150602
 *
 * 修改标识：PengLing20150605
 * 修改描述：优化代码, 合入系统原有结构物marker展示功能.
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var g_map;
var g_stations = [];
var g_arrStationName = [];
var g_points = [];
var g_arrStructId = [];
var g_arrStructName = [];
var g_arrStructImageName = [];
var g_structWorstWarningLevel = [];
var g_mapInfoWindowsContent = []; // 保存GIS图上各结构物信息窗口的内容
var g_mapInfoWindowsContentCreated = false; // GIS图上各结构物信息窗口的内容是否创建完成
var g_structIdAndStation = [];

function StringBuffer() {
    this.data = [];
}
StringBuffer.prototype.append = function () {
    this.data.push(arguments[0]);
    return this;
};
StringBuffer.prototype.toString = function () {
    return this.data.join("");
};


$(function () {
    resizeGisAndStructStatusDoms();

    window.setTimeout(createGIS, 500);
});

/** 
 * 扩大"GIS拓扑"和"结构物健康状态"面板展示的高度.
 */
function resizeGisAndStructStatusDoms() {
    $('#map_canvas').attr('style', 'height: 500px;');
    $('#structure-status').attr({'data-height': '500', 'data-always-visible': '0'});
}

/**
 * 初始化GIS图
 */
function initGIS() {
    g_map = new BMap.Map("map_canvas"); // 创建地图实例
    g_map.disableScrollWheelZoom(); // 禁用滚轮放大缩小
    //g_map.enableScrollWheelZoom(); // 启用滚轮放大缩小
    //g_map.enableDragging(); // 拖拽
    g_map.addControl(new BMap.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, offset: new BMap.Size(5, 5) }));
    g_map.addControl(new BMap.NavigationControl({ type: BMAP_NAVIGATION_CONTROL_LARGE }));
    g_map.addControl(new BMap.MapTypeControl({ mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP] })); // 普通街道视图，卫星图，卫星和路网的混合视图
    g_map.addControl(new BMap.MapTypeControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_MAPTYPE_CONTROL_DROPDOWN })); // 地图类型控件位置及展示方式
}

/**
 * 根据所有markers自适应调整GIS图视野.
 * @param {Array} points used to adjust the map viewport to make all the markers visible
 */
function showGIS(points) {
    g_map.setViewport(points, { enableAnimation: false, margins: [0, 0, 0, 0] });
    var zoomLevel = g_map.getZoom();
    if (zoomLevel > 15) {
        g_map.setZoom(15);
    }
}

/**
 * 获取数据, 创建GIS图
 */
function createGIS() {
    var userId = getCookie("userId");
    if (userId == null || userId == "") {
        alert("获取用户信息失败！");
        return;
    }
    var url = apiurl + '/user/' + userId + '/struct-state?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            if (data.length == 0) {
                $('#tipNoData-map').html('<span class="label label-important label-mini">当前用户无结构物</span>');
                return;
            }
            
            initGIS();
           
            for (var index = 0; index < data.length; index++) {
                g_points.push(new BMap.Point(data[index].longitude, data[index].latitude)); // 标记点, 百度坐标点(经度,维度)和谷歌坐标点顺序相反
                g_arrStructId.push(data[index].structId);
                g_arrStructName.push(data[index].structName);
                g_arrStructImageName.push(data[index].imageName);
                g_structIdAndStation.push({ id: data[index].structId, station: data[index].longitude + ',' + data[index].latitude });
            }

            getStations();
            addStructMarkers();
            getNowWeather(g_structIdAndStation[0].station);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("登录已超时，请重新登录");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                $('#map_canvas').html("<span class='label label-important label-mini'>GIS加载失败</span>");
            }
        }
    });
}

/**
 * 获取青岛R3线相关站点信息
 */
function getStations() {
    $.ajax({
        url: "resource/data/QingDaoR3StationsConfig.txt",
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data.length > 0) {
                var arrPoints = [];

                for (var index = 0; index < data.length; index++) {
                    g_stations.push(new BMap.Point(data[index].longitude, data[index].latitude)); // 标记点, 百度坐标点(经度,维度)和谷歌坐标点顺序相反
                    g_arrStationName.push(data[index].stationName); // 站点名称

                    arrPoints.push(new BMap.Point(data[index].longitude, data[index].latitude));
                }

                for (var i = 0; i < g_points.length; i++) {
                    arrPoints.push(g_points[i]);
                }

                showGIS(arrPoints);

                addStationMarkersAndLineOnMap();
            } else {
                showGIS(g_points);
            }
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status != 0) {
                alert("获取青岛R3线站点数据时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
            
            showGIS(g_points);
        }
    });
}

/**
 * 在地图上添加站点和线路标记
 */
function addStationMarkersAndLineOnMap() {
    var len = g_stations.length;
    for (var i = 0; i < len; i++) {
        var icon, marker;
        if (i == 0) {
            icon = new BMap.Icon("resource/img/googleMap/subway-start-26.png", new BMap.Size(32, 35)); // 创建起点图标
        } else if (i == len - 1) {
            icon = new BMap.Icon("resource/img/googleMap/subway-end-26.png", new BMap.Size(32, 35)); // 创建终点图标
        } else {
            icon = new BMap.Icon("resource/img/googleMap/subway-18.png", new BMap.Size(18, 18)); // 创建站点图标
        }
        marker = new BMap.Marker(g_stations[i], { icon: icon });
        
        g_map.addOverlay(marker); // 向地图添加标注
    }

    addStationLabelsOnMap();

    // 添加"折线"覆盖物
    var polyline = new BMap.Polyline(g_stations, { strokeColor: "red", strokeWeight: 6, strokeOpacity: 0.5 });  // 红色、宽度为6
    g_map.addOverlay(polyline);
}

/**
 * 在地图上添加站点文本标注
 */
function addStationLabelsOnMap() {
    // 复杂的自定义覆盖物
    function ComplexCustomOverlay(point, text, mouseoverText) {
        this._point = point;
        this._text = text;
        this._overText = mouseoverText;
    }
    ComplexCustomOverlay.prototype = new BMap.Overlay();
    ComplexCustomOverlay.prototype.initialize = function (map) {
        this._map = map;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
        div.style.backgroundColor = "white";
        div.style.border = "1px solid #0D638F";
        div.style.color = "black";
        div.style.height = "18px";
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px";
        //div.style.cursor = "pointer";
        var span = this._span = document.createElement("span");
        div.appendChild(span);
        span.appendChild(document.createTextNode(this._text));
        var that = this;

        div.onmouseover = function () {
            this.style.backgroundColor = "#6BADCA";
            this.style.borderColor = "#0D638F";
            this.style.color = "white";
            this.getElementsByTagName("span")[0].innerHTML = that._overText;
        };

        div.onmouseout = function () {
            this.style.backgroundColor = "white";
            this.style.borderColor = "#0D638F";
            this.style.color = "black";
            this.getElementsByTagName("span")[0].innerHTML = that._text;
        };

        g_map.getPanes().labelPane.appendChild(div);

        return div;
    };

    ComplexCustomOverlay.prototype.draw = function() {
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);
        switch (this._text) {
            case "灵山卫站":
                this._div.style.left = pixel.x - 60 + "px";
                this._div.style.top = pixel.y - 35 + "px";
                break;
            case "北京路站":
                this._div.style.left = pixel.x - 30 + "px";
                this._div.style.top = pixel.y - 35 + "px";
                break;
            case "黄海东路站":
                this._div.style.left = pixel.x + 10 + "px";
                this._div.style.top = pixel.y - 10 + "px";
                break;
            case "两河站":
                this._div.style.left = pixel.x - 10 + "px";
                this._div.style.top = pixel.y + 10 + "px";
                break;
            case "泰山路站":
                this._div.style.left = pixel.x - 65 + "px";
                this._div.style.top = pixel.y - 10 + "px";
                break;
            default:
                this._div.style.left = pixel.x + 10 + "px";
                this._div.style.top = pixel.y + "px";
                break;
        }
    };
    
    // 创建站点文本标注 【 警示: 这个地方的代码位置不能随便放置!!! 】
    for (var i = 0; i < g_stations.length; i++) {
        var mouseoverTxt = "站点：" + g_arrStationName[i];
        var compOverlay = new ComplexCustomOverlay(g_stations[i], g_arrStationName[i], mouseoverTxt);
        g_map.addOverlay(compOverlay);
    }
}


/**
 * 在地图上添加结构物标记
 */
function addStructMarkers() {
    getFactorStatus(g_arrStructId);

    for (var i = 0; i < g_points.length ; i++) {
        var imageUrl;
        switch (g_structWorstWarningLevel[i]) { // 根据结构物最严重告警等级, 确定对应颜色的结构物地图图标
            case "差": // 红
                imageUrl = "resource/img/googleMap/red-dot.png";
                break;
            case "劣": // 橙
                imageUrl = "resource/img/googleMap/orange-dot.png";
                break;
            case "中": // 紫
                imageUrl = "resource/img/googleMap/purple-dot.png";
                break;
            case "良": // 蓝
                imageUrl = "resource/img/googleMap/blue-dot.png";
                break;
            case "优": // 绿
                imageUrl = "resource/img/googleMap/green-dot.png";
                break;
            default: // 绿
                imageUrl = "resource/img/googleMap/green-dot.png";
                break;
        }
        var myIcon = new BMap.Icon(imageUrl, new BMap.Size(30, 30), { anchor: new BMap.Size(15, 30) });
        var marker = new BMap.Marker(g_points[i], { icon: myIcon });

        marker.setTitle(g_arrStructName[i]); // 鼠标移到marker上时显示结构物名称.

        (function (i, marker) {
            marker.addEventListener("click", function () {
                getNowWeather(g_structIdAndStation[i].station);
                if (g_mapInfoWindowsContentCreated) {
                    var infoWindow = new BMap.InfoWindow(g_mapInfoWindowsContent[i].toString(), { enableMessage: false });  // 创建信息窗口对象
                    marker.openInfoWindow(infoWindow);
                    setCookie('nowStructId', g_arrStructId[i]); // 监测因素跳转用
                }
            });
        })(i, marker);

        g_map.addOverlay(marker); // 向地图添加结构物标注 
    }
}

/**
 * 获取用户关注结构物下监测因素的状态
 */
function getFactorStatus(structidArrayid) {
    var dataFactor = [];
    var url = apiurl + '/struct/' + structidArrayid + '/factor-status?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                var idNumber = [0, ""]; // 结构物id，描述"监测主题: 状态"
                var str = new StringBuffer();
                idNumber[0] = data[i].structId;
                for (var j = 0; j < data[i].entry.length; j++) {
                    if (j != 0) {
                        str.append("<br/>");
                    }
                    str.append("<a href='/MonitorProject/Tab.aspx?themeId=" + data[i].entry[j].factorId + "'>");
                    if (data[i].entry[j].status == null) {
                        str.append("" + data[i].entry[j].factorName + "监测状态：无</a>");
                    } else {
                        str.append("" + data[i].entry[j].factorName + "监测状态：" + data[i].entry[j].status + "</a>");
                    }
                }
                idNumber[1] = str;
                dataFactor.push(idNumber);
            }
            
            getUnprocessedAlarmCount(structidArrayid, dataFactor);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物监测因素状态时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
            
            getUnprocessedAlarmCount(structidArrayid, dataFactor);
        }
    });
}

/**
 * 获取用户关注结构物下未确认告警个数
 */
function getUnprocessedAlarmCount(structidArrayid, dataFactor) {
    var url = apiurl + '/struct/' + structidArrayid + '/warn-number/unprocessed?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            var dataWarn = [];
            for (var i = 0; i < data.length; i++) {
                var str = new StringBuffer();
                var idNumber = [0, ""];
                idNumber[0] = data[i].structId;
                if (data[i].stats.length == 0) {
                    str.append("无");
                }
                else {
                    for (var j = 0; j < data[i].stats.length; j++) {
                        if (j != 0) {
                            str.append("<br/>");
                        }
                        str.append("" + data[i].stats[j].level + "级告警：" + data[i].stats[j].number + "条");
                    }
                }
                str.append("</div>");
                idNumber[1] = str;
                dataWarn.push(idNumber);
            }
            populateMapInfoWindowsContent(dataFactor, dataWarn);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物未确认告警数目时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
            populateMapInfoWindowsContent(dataFactor, new Array());
        }
    });
}

/**
 * 填充GIS图信息窗口内容
 */
function populateMapInfoWindowsContent(datafactor, datawarn) {
    g_mapInfoWindowsContentCreated = false;
    
    for (var i = 0; i < g_points.length; i++) {
        g_mapInfoWindowsContent[i] = new StringBuffer();

        g_mapInfoWindowsContent[i].append("<div><span style='font-weight:bold;font-size:10pt'> "
            + g_arrStructName[i] + "</span> <a href='/structure.aspx?id=" + g_arrStructId[i] + "&imagename=" + g_arrStructImageName[i]
            + "'><span class='label label-info label-mini'><i class='icon-share-alt'></i> </span></a>");
        var j;
        if (datafactor.length == 0) {
            for (j = 0; j < datawarn.length; j++) {
                if (datawarn[j][0] == g_arrStructId[i]) {
                    g_mapInfoWindowsContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
                    g_mapInfoWindowsContent[i].append("<i class='icon-warning-sign'></i> 未处理告警<a href='DataWarningTest.aspx?structId=" + g_arrStructId[i]
                        + "'><span class='label label-important label-mini'> 处理 <i class='icon-share-alt'></i> </span></a></span>");
                    g_mapInfoWindowsContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
                    g_mapInfoWindowsContent[i].append("" + datawarn[j][1] + ""); // 未处理告警
                }
            }
        } else {
            for (var k = 0; k < datafactor.length; k++) {
                if (datafactor[k][0] == g_arrStructId[i]) {
                    g_mapInfoWindowsContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
                    g_mapInfoWindowsContent[i].append("" + datafactor[k][1] + ""); // 因素超链接
                    g_mapInfoWindowsContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'><span style='font-weight:bold;font-size:10pt'>");
                    g_mapInfoWindowsContent[i].append("<i class='icon-warning-sign'></i> 未处理告警<a href='DataWarningTest.aspx?structId=" + g_arrStructId[i]
                        + "'><span class='label label-important label-mini'> 处理 <i class='icon-share-alt'></i> </span></a></span>");

                    for (j = 0; j < datawarn.length; j++) {
                        if (datawarn[j][0] == g_arrStructId[i]) {
                            g_mapInfoWindowsContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
                            g_mapInfoWindowsContent[i].append("" + datawarn[j][1] + ""); // 未处理告警
                        }
                    }
                }
            }
        }
    }
    
    g_mapInfoWindowsContentCreated = true;
}
