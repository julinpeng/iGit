/**
 * ---------------------------------------------------------------------------------
 * <copyright file="mapGIS.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2014 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：GIS图操作, 如初始化,标记及其click事件,信息窗口等.
 *
 * 创建标识：
 *
 * 修改标识：PengLing20150108
 * 修改描述：(1)用户无结构物情况下的无数据提示. (2)调整地图视野使所有marker全部可见.
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var g_map;
//var infowindow;
var lastInfWnd;
var points = [];
var structidArray = [];
var structnameArray = [];
var structimagename = [];
var structworstWarningLevel = [];
var g_structIdAndStation = [];
// 由于index和mapGIS被拆开，获取struct-state的接口调用了两次，因此在两边定义一个cache，互为缓存
var structStateCache;

//存在弹出信息框的数组
var sbInfoContent = new Array();

//标记弹出框内容是否加载结束,每完成一个结构物+1
var flag = 0;


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
    window.setTimeout(createGIS, 500);
    //createGIS();
    //window.setInterval(setWarnning, 10 * 1000);//更新地图标识
});

//函数功能：初始化GIS图
function createGIS() {
    g_structIdAndStation = [];
    var userId = getCookie("userId");
    if (userId == null || userId == "") {
        alert("获取用户信息失败！");
        return;
    }

    if (structStateCache2 != undefined) {
        buildGis(structStateCache2);
        for (var index = 0; index < structStateCache2.length; index++) {
            g_structIdAndStation.push({ id: structStateCache2[index].structId, station: structStateCache2[index].longitude + ',' + structStateCache2[index].latitude });
        }
        getNowWeather(g_structIdAndStation[0].station);
        return;
    }
    var url = apiurl + '/user/' + userId + '/struct-state?token=' + getCookie('token');
    $.ajax({
        //async: false,   //同步
        url: url,
        type: 'get',
        success: function (data) {
            structStateCache = data;
            buildGis(data);
            for (var i = 0; i < data.length; index++) {
                g_structIdAndStation.push({ id: data[i].structId, station: data[i].longitude + ',' + data[i].latitude });
            }
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

function buildGis(data) {
    if (data.length == 0) {
        $('#tipNoData-map').html('<span class="label label-important label-mini">当前用户无结构物</span>');
        return;
    }
    initGIS();

    var arrPoint = []; // the variable is use to adjust the viewport to make all the markers visible.
    for (var index = 0; index < data.length; index++) {
        arrPoint.push(new BMap.Point(data[index].longitude, data[index].latitude)); // assign the structs axis for arrPoint.

        points.push(new BMap.Point(data[index].longitude, data[index].latitude)); // 标记点, 百度坐标点(经度,维度)和谷歌坐标点顺序相反
        structidArray.push(data[index].structId);//结构物id
        structnameArray.push(data[index].structName);//结构物名称
        structimagename.push(data[index].imageName);//结构物 热点图名

        structworstWarningLevel.push(data[index].status);
    }

    showGIS(arrPoint);
    addMarker();
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
 * 根据所有marker自适应调整GIS图视野.
 * 地图上动态添加几个marker, 要求自动调整地图的视野(zoomLevel)使得所有marker可见, google提供了map.fitBounds(bounds)方法:
 * map.fitBounds(myCity.getBounds()); // getBounds()获取myCity可视区域，以地理坐标表示
 * 百度调整地图视野(zoomLevel)使得这些marker能全部可见的方法是"setViewport":
 * var pointArr = [new BMap.Point(lng,lat),new BMap.Point(lng,lat)]; // pointArr是point点坐标的数组
 * map.setViewport(pointArr);
 */
function showGIS(arrPoint) {
    g_map.setViewport(arrPoint, { enableAnimation: false, margins: [0, 0, 0, 0] });
    var zoomLevel = g_map.getZoom();
    if (zoomLevel > 15) {
        g_map.setZoom(15);
    } else if (zoomLevel < 4) { // min zoom level is 3
        // set margin-top=-32 to align top with map area
        g_map.setViewport(arrPoint, { enableAnimation: false, margins: [-32, 0, 0, 0] });
    }
}


function setWarnning() {
    structworstWarningLevel = [];
    if (getCookie("userId") == null || getCookie("userId") == "") {
        alert("获取用户信息失败！");
        return;
    }    
    var userId = getCookie('userId');
    var url = apiurl + '/user/' + userId + '/structs?token=' + getCookie('token');
    $.ajax({
        //async: false,   //同步
        url: url,
        type: 'get',
        success: function (data) {            
            if (data.length == 0) {
                $('#tipNoData-map').html('<span class="label label-important label-mini">当前用户无结构物</span>');
                return;
            }            
            for (var index = 0; index < data.length; index++) {
                structworstWarningLevel.push(data[index].status);
            }            
            addMarker();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("权限验证出错");
                //logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                //alert("内部异常");
            }
            else {
                //alert('url错误');
            }
        }
    });
}

//函数功能：在地图上处理多个标记
function addMarker() {
    for (var i = 0; i < points.length ; i++) {
        var imageURL = "";
        switch (structworstWarningLevel[i]) {//判断最高告警等级，选择对应颜色地图标记
            case "差"://红
                imageURL = "resource/img/googleMap/red-dot.png";
                break;
            case "劣"://橙
                imageURL = "resource/img/googleMap/orange-dot.png";
                break;
            case "中"://紫
                imageURL = "resource/img/googleMap/purple-dot.png";
                break;
            case "良"://蓝
                imageURL = "resource/img/googleMap/blue-dot.png";
                break;
            case "优"://绿
                imageURL = "resource/img/googleMap/green-dot.png";
                break;
            default://绿
                imageURL = "resource/img/googleMap/green-dot.png";
                break;
        }
        var myIcon = new BMap.Icon(imageURL, new BMap.Size(30, 30), { anchor: new BMap.Size(15, 30) });
        var marker = new BMap.Marker(points[i], { icon: myIcon });

        marker.setTitle(structnameArray[i]);//移至，结构物名称
        
        (function (i, marker) {           
            marker.addEventListener("click", function () {
                getNowWeather(g_structIdAndStation[i].station);
                factorStatus(structidArray, marker, i);
                if(flag>=1){
                    var infoWindow = new BMap.InfoWindow(sbInfoContent[i].toString(), { enableMessage: false });  // 创建信息窗口对象
                    marker.openInfoWindow(infoWindow);
                }
                flag = 0;
            });
        })(i, marker);

        g_map.addOverlay(marker); //向地图添加标注 
    }
    $('#map_canvas div.anchorBL').remove();
}

function markerClick(datafactor,marker, datawarn, index,desp) {
    var i = index;
    sbInfoContent[i] = new StringBuffer();

    sbInfoContent[i].append("<div><span style='font-weight:bold;font-size:10pt'> "
        + structnameArray[i] + "</span> <a href='/structure.aspx?id=" + structidArray[i] + "&imagename=" + structimagename[i] + "'><span class='label label-info label-mini'><i class='icon-share-alt'></i> </span></a>");

    if (datafactor.length == 0 || datafactor[i] == null) {
        if (datawarn[i] != null) {
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append("<i class='icon-warning-sign'></i> 未处理告警");
            if (datawarn[i][1].data[0] != '无') {
                sbInfoContent[i].append("<a href='DataWarningTest.aspx?structId=" + structidArray[i] + "'><span class='label label-important label-mini'> 处理 <i class='icon-share-alt'></i> </span></a>");
            }
            sbInfoContent[i].append("</span>");
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append("" + datawarn[i][1] + ""); //未处理告警
            //简介
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append("简介");
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append(""+desp+"");
        }

    } else {
        sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
        sbInfoContent[i].append("" + datafactor[i][1] + ""); //因素超链接
        sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
        if (datawarn[i] != null) {
            sbInfoContent[i].append("<span style='font-weight:bold;font-size:10pt'>");
            sbInfoContent[i].append("<i class='icon-warning-sign'></i> 未处理告警");
            if (datawarn[i][1].data[0] != '无') {
                sbInfoContent[i].append("<a href='DataWarningTest.aspx?structId=" + structidArray[i] + "'><span class='label label-important label-mini'> 处理 <i class='icon-share-alt'></i> </span></a>");
            }
            sbInfoContent[i].append("</span>");
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append("" + datawarn[i][1] + ""); //未处理告警        
            //简介
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append("简介");
            sbInfoContent[i].append("<hr style='margin-top:auto; margin-bottom:auto'>");
            sbInfoContent[i].append("" + desp + "");
        }
    }
    flag++;
}

//告警个数
function warnNumber(structidArrayid, dataFactor, marker, index) {
    var description;
    var dataWarn = [];
    var url = apiurl + '/struct/' + structidArrayid[index] + '/warn-number/unprocessed?token=' + getCookie('token');
    setCookie('nowStructId', structidArrayid[index]);
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
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
                dataWarn[index] = idNumber;
            }
            for (var k = 0; k < structStateCache2.length; k++) {
                if (structStateCache2[k].structId == structidArrayid[index]) {
                    description = structStateCache2[k].description;
                    break;
                }
            }
            if (!description || description == "") {
                description = "无";
            }
            markerClick(dataFactor, marker, dataWarn, index,description);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("权限验证出错");
                //logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                //for (var j = 0; j < structidArray.length; j++) {
                //    var str = new StringBuffer();
                //    var idNumber = [0, ""];
                //    idNumber[0] = structidArray[j];
                //    str.append("获取失败");
                //    str.append("</div>");
                //    idNumber[1] = str;
                //    dataWarn.push(idNumber);
                //}

                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                //alert("内部异常");
            }
            else {
                //alert('url错误');
            }
            if (textStatus == 'timeout') {
            }
            markerClick(dataFactor,marker, dataWarn);
        }
    });
    return dataWarn;
}
//监测因素
function factorStatus(structidArrayid, marker, index) {
    var dataFactor = [];
    var url = apiurl + '/struct/' + structidArrayid[index] + '/factor-status?token=' + getCookie('token');
    setCookie('nowStructId', structidArrayid[index]);
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {         
            for (var i = 0; i < data.length; i++) {
                var idNumber = [0, ""];//结构物id，描述"因素name因素状态"
                var str = new StringBuffer();
                idNumber[0] = data[i].structId;
                for (var j = 0; j < data[i].entry.length; j++) {
                    if (j != 0) {
                        str.append("<br/>");
                    }
                    str.append("<a href='/MonitorProject/Tab.aspx?themeId=" + data[i].entry[j].factorId + "'>");
                    if (data[i].entry[j].status == null) {
                        str.append("" + data[i].entry[j].factorName + "监测状态：无</a>");
                    }
                    else {
                        str.append("" + data[i].entry[j].factorName + "监测状态：" + data[i].entry[j].status + "</a>");
                    }

                }
                idNumber[1] = str;
                dataFactor[index] = idNumber;
            }
            warnNumber(structidArrayid, dataFactor, marker, index);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("权限验证出错");
                //logOut();
            }
            else if (XMLHttpRequest.status == 400) {
                //for (var j = 0; j < structidArray.length; j++) {
                //    var str = new StringBuffer();
                //    var idNumber = [0, ""];
                //    idNumber[0] = structidArray[j];
                //    str.append("监测状态获取失败");
                //    str.append("</div>");
                //    idNumber[1] = str;
                //    dataFactor.push(idNumber);
                //}

                //alert("参数错误");
            }
            else if (XMLHttpRequest.status == 500) {
                //alert("内部异常");
            }
            else {
                //alert('url错误');
            }         
            warnNumber(structidArrayid, dataFactor, marker, index);
        }            
    })  
}

