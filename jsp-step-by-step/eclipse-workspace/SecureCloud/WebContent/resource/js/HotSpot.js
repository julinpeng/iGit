/**
 * ---------------------------------------------------------------------------------
 * <copyright file="HotSpot.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2014 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：前端Topo展示热点图js文件
 *
 * 创建标识：
 *
 * 修改标识：PengLing20141209
 * 修改描述：
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var g_struct = {}; // { structId: current struct id, structName: current struct name, heapMapName: current struct heap map name }
var g_thumbnails = {}; // { ssid: struct or section id, heapMapName: struct or section heap map name }
var g_sectionId = null;
var g_checkSvg = null;
var g_offsetWidth, g_offsetHeight;
var g_structSvgDoc;
var g_sectionHotspots = {};
var HEAPMAP_TYPE_STRUCT = 1;
var HEAPMAP_TYPE_SECTION = 2;
var g_heapMapType; // use for refresh heap map.
var g_legendIcon = {}; // { icontype: icon-productTypeId, isShown: true/false }
var g_thumbnailContent;
var g_currentThumbnail;

var realDataSensors = [];

var structType = "";
var structTypeRShell = "10900";//网壳结构物类型
var hotspotFishedLoad = 0;//初始热点未加载
var dataHotSpot = "";//暂存topo点数据，用于网壳tooltip
$(function () {
    setTimeout(initPage, 100);
    //initPage();
});

/* 
 * 初始化页面.
 */
function initPage() {
    var locationUrl = decodeURI(location.href);
    var urlParams = locationUrl.split('.aspx?')[1].split('&');
    var urlStructId = urlParams[0].split('id=')[1];
    var urlHeapMapName = urlParams[1].split('imagename=')[1];

    if (urlHeapMapName == undefined || urlHeapMapName == "" || urlHeapMapName == "null") {
        $('#spanHeapMap').html("<span class='label label-important label-mini'>获取热点图片失败</span>");
        g_struct = { structId: urlStructId, structName: "", heapMapName: '' }; // assign value.
        return;
    } else {
        g_struct = { structId: urlStructId, structName: "", heapMapName: urlHeapMapName }; // assign value.
        GetStructTypeRShell(urlStructId, urlHeapMapName);//先获取结构物类型
        //initHeapMap(urlHeapMapName);
    }
}



/* 
 * 初始化热点图
 */
function initHeapMap(heapMapName, structType) {
    g_checkSvg = isSvgGraph(heapMapName); // assign value, check the current img/graph is svg or not.
    showHeapMap(heapMapName);
    checkStructTypeForGanTan();
    if (structType == structTypeRShell) {
        setInterval(function () {
            if (hotspotFishedLoad) {//判断热点是否加载完成
                refreshLegendAndHotspot();
            }
        }, 60 * 1000);
    } else {
        setInterval(refreshLegendAndHotspot, 60 * 1000); // refresh legends and hotspots of heap map per one minute.
        
    }
}

/**
 * 判断结构物热点图是否为SVG图
 */
function isSvgGraph(src) {
    var suffix = src.substring(src.lastIndexOf('.'));
    if (suffix == '.svg') {
        return true;
    } else {
        return false;
    }
}

/* 
 * 显示结构物热点图.
 */
function showHeapMap(heapMapName) {
    var $heapMapEle = $("#heapMapEle");
    var src = "/resource/img/Topo/" + heapMapName;
    if (g_checkSvg) { // SVG热点图
        $heapMapEle.remove();
        var svgEle = $("#svgEle");
        svgEle.attr("data", src);
        svgEle.attr("id", "heapMapEle").show();

        handleHeapMapThumbnail(); // 处理施工截面缩略图
    } else {
        $heapMapEle.attr("src", src); // image热点图
    }
    bindHeapMapLoadEvent(HEAPMAP_TYPE_STRUCT);
}

/* 
 * 将函数绑定到热点图的load事件.
 */
function bindHeapMapLoadEvent(type) {
    $("#heapMapEle").one('load', function () {
        g_offsetWidth = document.getElementById("heapMapEle").offsetWidth; // assign values.
        g_offsetHeight = document.getElementById("heapMapEle").offsetHeight;
        if (g_checkSvg) { // handle svg
            if (type == HEAPMAP_TYPE_STRUCT) {
                onloadStructSvg(); // when svg is loaded, begin to handle it.
                SVGgetId();
            }
            crossBrowserForSvg();
        }
        var flagRefresh = false;
        setTimeout(" drawHotspot('" + type + "')", 0);//避免热点将比图先加载完
        //drawHotspot(type);
        initRealData();
    });
}

/**
 * 结构物SVG加载完成后处理.
 */
function onloadStructSvg() {
    var svgEle = document.getElementById("heapMapEle");
    g_structSvgDoc = svgEle.getSVGDocument(); // 获得当前svg的document对象
    g_structSvgDoc.addEventListener('click', clickStructSvg, false); // 监听SVG点击事件
}

/**
 * 跨浏览器情况下,使SVG本身大小能自适应SVG容器.
 */
function crossBrowserForSvg() {
    // Compatible with all kinds of browsers.
    var svgDoc = document.getElementById("heapMapEle").getSVGDocument(); // 获得svg的document对象
    svgDoc.firstChild.setAttribute("width", "100%");
    svgDoc.firstChild.setAttribute("height", "100%");
}

/**
 * 窗口重绘方法.
 */
window.onresize = function () {
    if (document.getElementById("heapMapEle") == null) {
        g_offsetWidth = 0;
        g_offsetHeight = 0;
        return;
    } else {
        g_offsetWidth = document.getElementById("heapMapEle").offsetWidth; // 宽
        g_offsetHeight = document.getElementById("heapMapEle").offsetHeight; // 高
    }

    refreshLegendAndHotspot();
  
    initRealData();
    checkStructTypeForGanTan();
};

/**
 * 刷新热点图的图例和热点.
 */
function refreshLegendAndHotspot() {
    var flagRefresh = true;
    drawHotspot(g_heapMapType, flagRefresh);
    if (!isEmptyObject(g_thumbnails)) {
        renewThumbnail();
    }
}

/**
 * 重建缩略图.
 */
function renewThumbnail() {
    slider = $('.bxslider').bxSlider();
    slider.destroySlider();
    $('#bxsliderThumbnailContainer').empty();
    $('#bxsliderThumbnailContainer').append('<ul id="bxsliderThumbnail" class="bxslider"></ul>');
    showHeapMapThumbnail(g_thumbnailContent);
}

/**
 * 结构物SVG的点击方法.
 */
function clickStructSvg(e) {
    var source = e.srcElement;
    if (source.localName == "path") {
        // handle path node
        var pathEleId = source.id;
        var sectionHotspot = g_sectionHotspots[pathEleId];
        showStructOrSectionHeapMap(sectionHotspot.sectionId, HEAPMAP_TYPE_SECTION);
    }
}

/**
 * 处理结构物的截面缩略图
 */
function handleHeapMapThumbnail() {
    var url = apiurl + '/struct/' + g_struct.structId + '/sections' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data==null||data.length == 0) {
                return;
            }
            createHeapMapThumbnail(data);
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
 * 创建结构物的截面缩略图
 */
function createHeapMapThumbnail(data) {
    var path = '/resource/img/Topo/';
    var sb = new StringBuffer();
    // struct thumbnail.
    var structId = g_struct.structId;
    var structName = data.structName;
    var structHeapMapName = g_struct.heapMapName;
    var pathStructImg = path + structHeapMapName;
    sb.append('<li id="thumbnail_1_' + structId + '"><a href="javascript:showStructOrSectionHeapMap(' + structId + ', HEAPMAP_TYPE_STRUCT)">');
    sb.append('<img src="' + pathStructImg + '" title="' + structName + '" />');
    sb.append('</a></li>');
    g_struct.structName = structName; // assign current struct name.
    g_thumbnails['thumbnail_1_' + structId] = { ssid: structId, heapMapName: structHeapMapName }; // assign value, "1" indicate "struct".
    g_currentThumbnail = { ssid: structId, type: HEAPMAP_TYPE_STRUCT };
    // section thumbnail.
    $.each(data.sections, function (i, item) {
        var sectionId = item.sectionId;
        var sectionName = item.sectionName;
        var sectionHeapMapName = item.heapMapName;
        if (sectionHeapMapName != null) {
            var pathSectionImg = path + sectionHeapMapName;
            sb.append('<li id="thumbnail_2_' + sectionId + '"><a href="javascript:showStructOrSectionHeapMap(' + sectionId + ', HEAPMAP_TYPE_SECTION)">');
            sb.append('<img src="' + pathSectionImg + '" title="' + sectionName + '" />');
            sb.append('</a></li>');
            g_thumbnails['thumbnail_2_' + sectionId] = { ssid: sectionId, heapMapName: sectionHeapMapName }; // assign values, "2" indicate "section".
        }
    });
    g_thumbnailContent = sb.toString();
    showHeapMapThumbnail(g_thumbnailContent);
}

/**
 * 显示结构物的截面缩略图
 */
function showHeapMapThumbnail(content) {
    $('#bxsliderThumbnail').html(content);
    renderSlider(); // this statement is vital, function to render the slider.
    highlightCurrentThumbnail(g_currentThumbnail.ssid, g_currentThumbnail.type);
}

function renderSlider() {
    $('.bxslider').bxSlider({ // the slider plugin work.
        mode: 'vertical',
        captions: true,
        infiniteLoop: false,
        hideControlOnEnd: true,
        slideWidth: 200,
        minSlides: 4,
        slideMargin: 10,
        onSliderLoad: function () {
            $('#bxsliderThumbnail li').css("width", "auto"); // it is vital.
        }
    });
    $('.bx-pager.bx-default-pager').remove();
}

/**
 * highlight the current thumbnail.
 */
function highlightCurrentThumbnail(ssid, type) {
    $('#bxsliderThumbnail li[id^="thumbnail_"]').css("border", "1px solid #E5E5E5");
    $('#thumbnail_' + type + '_' + ssid).css("border", "1px solid #ff0000");
}

/**
 * 显示施工截面热点图
 */
function showStructOrSectionHeapMap(ssid, type) {
    clearContext(type);
    
    highlightCurrentThumbnail(ssid, type);
    g_currentThumbnail = { ssid: ssid, type: type };
    
    var ss;
    if (type == HEAPMAP_TYPE_STRUCT) {
        ss = g_thumbnails['thumbnail_1_' + ssid]; // struct
    } else {
        ss = g_thumbnails['thumbnail_2_' + ssid]; // section
        g_sectionId = ssid; // assign value.
    }
    var src = '/resource/img/Topo/' + ss.heapMapName;
    var svgEle = $('#heapMapEle');
    svgEle.attr("data", src); // create struct/section heap map.
    if (checkSafari()) {
        svgEle.load(src);
    }
    bindHeapMapLoadEvent(type);
}

//获取施工进度:施工长度的单位需要判断！
function SVGgetId() {
    var structid = getCookie("nowStructId");

    var url = apiurl + '/struct/' + structid + '/constructInfo/list?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        cache: false,
        success: function (data) {

            if (data.length >= 1) {
                var con_progress = $("#Progress");
                con_progress.show();

                for (var i = 0; i < data.length; i++) {
                    if (data[i].LineLength > 0) {
                        var svgId;
                        var ConstructLength = data[i].ConstructLength;

                        if (ConstructLength <= data[i].LineLength) {
                            svgId = parseInt((ConstructLength / data[i].LineLength) * (data[i].EndId - data[i].StartId + 1)) + parseInt(data[i].StartId) - 1;

                        } else if (ConstructLength > data[i].LineLength) {
                            svgId = data[i].EndId;
                        } else if (ConstructLength == null || ConstructLength < 0) {
                            svgId = data[i].StartId;
                        }
                        SVGHotPointColorH(data[i].StartId, svgId, data[i].Color);
                    }
                }
            }
        }
    });
}

//有施工的地方进行填充
function SVGHotPointColorH(start, svgId, color) {
    if (color == null||color=="#ffffff"||color=="#FFFFFF") {
        color = "#FF0000";
    }
    var svgEle = document.getElementById("heapMapEle");
    var svgDoc = svgEle.getSVGDocument();//获得svg的document对象
    var svgRoot = svgDoc.rootElement;
    for (var i = start; i <= svgId; i++) {
        // 对SVG施工图制作相关要求， 请参考。。。。这里一个格子代表0.5m
        var a = $("#cb" + i, svgRoot);//SVG的id
        if (a[0] != null) {
            a[0].style.fill = color;
        } 
    }
}

/**
 * 绘制结构物/截面的图例和热点
 */
function drawHotspot(type, flagRefresh) {
    if (type == null) {
        type = HEAPMAP_TYPE_STRUCT;
    }
    var url;
    g_heapMapType = type; // assign value.
    if (type == HEAPMAP_TYPE_STRUCT) { // 结构物热点
        if (g_struct.structId == null || g_struct.structId == "") {
            alert("获取结构物id失败！");
            return;
        }
        if (structType == structTypeRShell) {
            url = apiurl + '/struct/' + g_struct.structId + '/hotspotsRShell?token=' + getCookie('token');
        } else {
            url = apiurl + '/struct/' + g_struct.structId + '/hotspots?token=' + getCookie('token');
        }
    } else {
        url = apiurl + "/section/" + g_sectionId + "/hotspots" + '?token=' + getCookie("token");
    }
    $.ajax({
        url: url,
        type: 'get',
        beforeSend: function (xhr) {
            $('#loading').remove();
            var posLeft = $("#topoContainer").width() / 2 - 50; // width of the img loading is 100px. 
            var hotSpot = "<a href='#' id='loading' class='marker' style='display:block; top:0px; left:" + posLeft + "px;' ></a>";
            $('#topoContainer').append(hotSpot);
        },
        success: function (data) {
            if (data.length == 0) {
                // alert("没有热点数据");
                clearContext(type);
                $('#loading').remove();
            }
            else {
                $('#loading').remove(); // 移除加载gif
                clearContext(type);
                createLegendAndHotspot(data, type); // 创建图例和热点
            }
            if (g_checkSvg && type == HEAPMAP_TYPE_STRUCT) {
                getSectionHotspotOfStruct(flagRefresh); // 获取施工截面类型热点
            }
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物热点时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * if SVG graphic existed, clear the context.
 */
function clearContext(type) {
    $("#spanHeapMapLegend").empty(); // clear up the legends.
    $('#topoContainer img.spot').remove(); // 移除传感器热点
    $('#topoContainer div.tooltip').remove(); // 移除热点提示信息
    if (g_checkSvg) {
        $('#topoContainer img.sectionSpot').remove(); // 移除截面热点
        //if (type == HEAPMAP_TYPE_STRUCT) {
        //    removeSectionPathItem();
        //}
    }
}

/**
 * 创建结构物/截面热点图的图例和热点
 */
function createLegendAndHotspot(data, type) {
    hotspotFishedLoad = 0;//初始热点加载未完成
    g_offsetWidth = document.getElementById("heapMapEle").offsetWidth;
    g_offsetHeight = document.getElementById("heapMapEle").offsetHeight;
    // g_svgWidth = parseInt(g_svgDoc.documentElement.getAttribute('width')); // the width is inaccurate 
    // g_svgHeight = parseInt(g_svgDoc.documentElement.getAttribute('height'));
    if (structType == structTypeRShell) {
        dataHotSpot = data;
        for (var i = 0; i < data.length; i++) {
            createHotspotItemRShell(data[i], type);
        }
        hotspotFishedLoad = 1;//热点是加载完成
    } else {
        for (var i = 0; i < data.length; i++) {
            createHotspotItem(data[i], type);
        }
    }
    createHeapMapLegend(data); // 各传感器最高告警等级图例
}

//暂存topo点数据，用于网壳tooltip
function HotSpotData_tooltip() {
    return dataHotSpot;
}

/**
 * 热点图上创建热点
 */
function createHotspotItem(hotspot, type) {
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
    var x = hotspot.xAxis * g_offsetWidth - 8;
    var y = hotspot.yAxis * g_offsetHeight - 8;
    var title = getTooltipContent(hotspot, type);
    // add hotspot.
    var src;
    if (hotspot.warningLevel == 5) {
        src = '/resource/img/factorIcon/icon-' + hotspot.productTypeId + '-' + hotspot.warningLevel + '.png';
    } else {
        src = '/resource/img/factorGif/icon-' + hotspot.productTypeId + '-' + hotspot.warningLevel + '.gif';
    }
    var iconType = "icon-" + hotspot.productTypeId;
    var imgEle = '<img id="' + hotspot.sensorId + '" class="' + iconType + ' spot"' + ' src="' + src + '" data-toggle="tooltip" title="' + title
        + '" style="top: ' + y + 'px; left: ' + x + 'px; position: absolute; cursor: pointer;" width="16" height="16"'
        + ' onclick="clickMonitorFactor(' + parseInt(hotspot.factorId) + ',' + parseInt(sensorId) + ')" />';
    $('#topoContainer').append(imgEle);

    $(".spot").tooltip({
        html: true,
        placement: 'bottom'
    });
}

/**
 * 获取热点tooltip内容
 */
function getTooltipContent(hotspot, type) {
    var title = new StringBuffer();
    title.append('项目：' + hotspot.structName);
    if (type == HEAPMAP_TYPE_SECTION) {
        title.append('<br />截面：' + hotspot.sectionName);
    }
    title.append('<br />设备：' + hotspot.productName);
    title.append('<br />位置：' + hotspot.location);
    if (hotspot.warningLevel == 5) {
        title.append('<br />告警：无');
    } else {
        title.append('<br />告警等级：' + hotspot.warningLevel);
    }
    if (hotspot.data == null) {
        title.append('<br />无最新数据');
    } else {
        title.append('<br />' + hotspot.data);
        title.append('<br/>采集时间：' + hotspot.time);
    }

    return title.toString();
}

/**
 * 获取结构物的截面热点
 */
function getSectionHotspotOfStruct(flagRefresh) {
    var url = apiurl + '/struct/' + g_struct.structId + '/hotspot-config/sections' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data.length == 0) {
                return;
            }
            drawSectionLegendAndHotspot(data, flagRefresh);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取截面热点时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function drawSectionLegendAndHotspot(sectionHotspots, flagRefresh) {
    g_offsetWidth = document.getElementById("heapMapEle").offsetWidth;
    g_offsetHeight = document.getElementById("heapMapEle").offsetHeight;
    $.each(sectionHotspots, function (i, item) {
        createSectionHotspotItem(item);
        if (!flagRefresh) {
            createSectionPathItem(item);
        }
    });
    createSectionLegendsOfStruct(sectionHotspots);
}

/**
 * 主SVG图上创建截面热点
 */
function createSectionHotspotItem(sectionHotspot) {
    if (sectionHotspot.sectionSpotX == null || sectionHotspot.sectionSpotY == null) {
        return;
    }
    var src = "";
    var status = sectionHotspot.sectionStatus;
    switch (status) {
        case 0: // 未施工
            src = "/resource/img/icon-section-0.png"; // gray
            break;
        case 1: // 施工中
            src = "/resource/img/icon-section-1.png"; // red
            break;
        case 2: // 施工完成
            src = "/resource/img/icon-section-2.png"; // green
            break;
        default:
            break;
    }
    var x = sectionHotspot.sectionSpotX * g_offsetWidth - 8; // it is vital! absolute calibration as positive 8.
    var y = sectionHotspot.sectionSpotY * g_offsetHeight - 8;
    var title = sectionHotspot.sectionName;
    var imgEle = '<img id="' + sectionHotspot.sectionId + '" class="icon-section sectionSpot"' + ' src="' + src + '" data-toggle="tooltip" title="' + title
        + '" style="top: ' + y + 'px; left: ' + x + 'px; position: absolute; cursor: pointer;" width="16" height="16"'
        + ' onclick="showStructOrSectionHeapMap(' + parseInt(sectionHotspot.sectionId) + ', HEAPMAP_TYPE_SECTION)" />';
    $('#topoContainer').append(imgEle); // create section hotspot on main(structure) svg.

    $(".sectionSpot").tooltip({
        html: true,
        placement: 'bottom'
    });
}

/**
 * 主SVG图上创建截面Path
 */
function createSectionPathItem(sectionHotspot) {
    if (sectionHotspot.sectionSpotPath == null || sectionHotspot.sectionSpotPath.trim() == "") {
        return;
    }
    // path node
    var pathEleId = 'path_section_' + sectionHotspot.hotspotId;
    var svgPath = g_structSvgDoc.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('id', pathEleId);
    svgPath.setAttribute('d', sectionHotspot.sectionSpotPath);
    // svgPath.setAttribute('d', 'M 590,218 608,300'); // use for test.
    switch (sectionHotspot.sectionStatus) {
        case 0: // 未施工
            svgPath.setAttribute('style', 'stroke: gray; stroke-width: 4;');
            break;
        case 1: // 施工中
            svgPath.setAttribute('style', 'stroke: red; stroke-width: 4;');
            break;
        case 2: // 施工完成
            svgPath.setAttribute('style', 'stroke: green; stroke-width: 4;');
            break;
        default:
            break;
    }
    svgPath.setAttribute("hotspotId", sectionHotspot.hotspotId);
    svgPath.setAttribute('sectionId', sectionHotspot.sectionId);
    g_structSvgDoc.documentElement.appendChild(svgPath);

    g_sectionHotspots[pathEleId] = sectionHotspot; // 保存SVG图中截面热点信息
}

/**
 * 主SVG图上移除截面Path
 */
function removeSectionPathItem() {
    for (var key in g_sectionHotspots) {
        var pathEle = g_structSvgDoc.getElementById(key); // IE下该语句会产生错误.
        $(pathEle).remove();
    }
}

/**
 * 创建传感器图例
 */
function createHeapMapLegend(data) {
    var hotspots = [];
    $.each(data, function (i, item) {
        if (item.xAxis == null || item.yAxis == null) {
            return;
        }
        hotspots.push(item);
    });
    if (hotspots.length == 0) {
        return;
    }
    var legends = inArrayProductType(hotspots);
    showHeapMapLegend($.makeArray(legends));
}

function inArrayProductType(hotspots) {
    var legends = {}; // { pid: productTypeId, pname: productName, wl: warningLevel }
    var arrLegend = [];
    $.each(hotspots, function (i, item) {
        var productId = item.productTypeId;
        if (i == 0) {
            legends["legend_" + productId] = { pid: productId, pname: item.productName, wl: item.warningLevel };
            arrLegend.push(productId);
            return;
        }
        if ($.inArray(item.productTypeId, arrLegend) != -1) { // get top warning level for the same product type.
            if (item.warningLevel < legends["legend_" + productId].wl) {
                legends["legend_" + productId].wl = item.warningLevel;
            }
        } else {
            legends["legend_" + productId] = { pid: productId, pname: item.productName, wl: item.warningLevel };
            arrLegend.push(productId);
        }
    });
    return legends;
}

/**
 * 显示传感器图例
 */
function showHeapMapLegend(legends) {
    var sb = new StringBuffer();
    var legendObj = legends[0];
    for (var key in legendObj) {
        var iconType = 'icon-' + legendObj[key].pid;
        var src = '/resource/img/factorIcon/icon-' + legendObj[key].pid + '-' + legendObj[key].wl + '.png';
        var svgLegend = '<div style="margin-left: 5px; display: inline-block">'
            + '<a href="javascript:;" onclick="toggleHeapMapLegend(\'' + key + '\',\'' + src + '\')" style="color: #0088cc; font-size:13px; font-weight:normal;">'
            + '<img id="legendIcon_' + iconType + '" style="width: 18px; height: 18px; margin-top: -7px;" src="' + src + '"></img>'
            + '<span class="legendtext">' + legendObj[key].pname + '</span></a></div><br />';
        sb.append(svgLegend);

        g_legendIcon[key] = { iconType: iconType, isShown: true };
    }
    $("#spanHeapMapLegend").html(sb.toString());
}

/**
 * 创建结构物SVG热点图的截面图例
 */
function createSectionLegendsOfStruct(sectionHotspots) {
    var legends = inArraySectionStatus(sectionHotspots);
    showSectionLegends($.makeArray(legends));
}

function inArraySectionStatus(sectionHotspots) {
    var legends = {}; // { id: index, ss: sectionStatus, sd: stateDescription }
    var arrLegend = [];
    $.each(sectionHotspots, function (i, item) {
        var sectionStatus = item.sectionStatus;
        var stateDescription = null;
        switch (item.sectionStatus) {
            case 0:
                stateDescription = '未施工截面';
                break;
            case 1:
                stateDescription = '施工中截面';
                break;
            case 2:
                stateDescription = '施工完成截面';
                break;
            default:
                break;
        }
        if (i == 0) {
            legends["legend_" + sectionStatus] = { ss: item.sectionStatus, sd: stateDescription };
            arrLegend.push(sectionStatus);
            return;
        }
        if ($.inArray(item.sectionStatus, arrLegend) == -1) {
            legends["legend_" + sectionStatus] = { ss: item.sectionStatus, sd: stateDescription };
            arrLegend.push(sectionStatus);
        }
    });
    return legends;
}

/**
 * 显示结构物SVG热点图的截面图例
 */
function showSectionLegends(legends) {
    var sb = new StringBuffer();
    var legendObj = legends[0];
    for (var key in legendObj) {
        var iconType = 'icon-section-' + legendObj[key].ss;
        var src = '/resource/img/icon-section-' + legendObj[key].ss + '.png';
        var svgLegend = '<div style="margin-left: 5px; display: inline-block;">'
            + '<span style="color: #0088cc; font-size: 13px;">'
            + '<img id=' + iconType + ' style="width: 18px; height: 18px; margin-top: -7px;" src="' + src + '"></img>'
            + '<span class="legendtext">' + legendObj[key].sd + '</span></span></div><br />';
        sb.append(svgLegend);
    }
    $("#spanHeapMapLegend").append(sb.toString());
}

/**
 * 切换传感器图例(隐藏/显示)
 */
function toggleHeapMapLegend(key, iconsrc) {
    g_legendIcon[key].isShown = !(g_legendIcon[key].isShown);
    var imgEle = document.getElementById("legendIcon_" + g_legendIcon[key].iconType);
    imgEle.src = g_legendIcon[key].isShown ? iconsrc : "/resource/img/factorIcon/" + g_legendIcon[key].iconType + "-0.png";

    if (g_legendIcon[key].isShown) {
        $("." + g_legendIcon[key].iconType).css("display", "block");
    }
    else {
        $("." + g_legendIcon[key].iconType).css("display", "none");
    }
}

//初始化实时数据展示
function initRealData() {
    var structid = getCookie("nowStructId");
    if (structid == null || structid == "") {
        alert("获取结构物id失败！");
        return;
    }
    var url = apiurl + '/struct/' + structid + '/rt-sensors?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            if (data == null || data.length < 1) {
                return;
            }
            else {
                var sb = new StringBuffer();
                for (var i = 0; i < data.length; i++) {
                    realDataSensors[i] = data[i].sensorId;
                    var y;
                    var x;
                    y = data[i].yAxis * g_offsetHeight;
                    x = data[i].xAxis * g_offsetWidth;
                    sb.append('<div id="realData_' + data[i].sensorId + '" style="left: ' + x + 'px; position: absolute; top: ' + y + 'px;color:#00CC00;font-size:16px; "></div>');
                }

                $('#realData').html(sb.toString());
                setInterval(showRealData, 2000);
            }
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物实时数据时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

//填充实时数据
function showRealData() {
    if (realDataSensors.length > 0) {
        var sensorStr = realDataSensors[0];
        for (var i = 1; i < realDataSensors.length; i++) {
            sensorStr += ',' + realDataSensors[i];
        }
        var url = apiurl + '/sensor/' + sensorStr + '/last-data?token=' + getCookie('token');
        $.ajax({
            url: url,
            type: 'get',
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var value = data[i].data[0].value;
                        var tempData = '';
                        for (var j = 0; j < value.length; j++) {
                            tempData += value[j] + data[i].unit[j];
                        }
                        $('#realData_' + data[i].sensorid).html(tempData);
                    }
                }
            },
            error: function (xhr) {
                if (xhr.status == 403) {
                    alert("权限验证出错");
                    logOut();
                } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                    alert("获取传感器实时数据时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
                }
            }
        });
    }
}

function checkStructTypeForGanTan() {
    var structId = location.href.split('=')[1].split('&')[0];
    var url = apiurl + '/struct/' + structId + '/info?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            if (data == null) {
                return;
            }
            if (data.structType == "尾矿库") {
                checkGanTanMonitoring(structId);
            }
        },
        error: function(xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错,禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物信息时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function checkGanTanMonitoring(structId) {
    var url = apiurl + '/struct/' + structId + '/factors?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].children.length; j++) {
                    if (data[i].children[j].factorId == 35) {
                        $('#divGanTan').show();
                        $('#gantanData').html("");
                        // 获取干摊数据
                        showGanTanData(structId);
                    }
                }
            }
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错,禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物监测因素时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

function showGanTanData(structId) {
    var url = apiurl + '/struct/' + structId + '/beach/last-data' + '?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            if (data == null || data.length == 0) {
                return;
            } else {
                var sb = new StringBuffer();
                sb.append('<div style="left:' + 0.6 * document.getElementById("imgGanTan").offsetWidth + 'px; top:'
                    + (0.40 * document.getElementById("imgGanTan").offsetHeight)
                    + 'px; position:absolute; color:red; font-size:16px;">' + data[0].Length + 'm</div>');
                sb.append('<div style="left:' + 0.45 * document.getElementById("imgGanTan").offsetWidth
                    + 'px; top:' + (0.56 * document.getElementById("imgGanTan").offsetHeight)
                    + 'px; position:absolute; color:red; font-size:16px;">' + data[0].WaterLevel + 'm</div>');
                $('#gantanData').html(sb.toString());
            }
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                alert("权限验证出错,禁止访问");
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取结构物干滩数据时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 判断空对象:{}
 */
function isEmptyObject(obj) {
    for (var name in obj) {
        return false;
    }
    return true;
}

/**
 * Check whether the Safari browser.
 */
function checkSafari() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/safari\/([\d.]+)/) && !ua.match(/chrome\/([\d.]+)/)) {
        return true;
    }
    return false;
}
