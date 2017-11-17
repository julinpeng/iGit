/**
 * ---------------------------------------------------------------------------------
 * <copyright file="topoSettingSVG.js" company="江苏飞尚安全监测咨询有限公司">
 * Copyright (C) 2014 飞尚科技
 * 版权所有。
 * </copyright>
 * ---------------------------------------------------------------------------------
 * <summary>
 * 文件功能描述：结构物SVG图热点配置js文件
 *
 * 创建标识：PengLing20141101
 *
 * 修改标识：PengLing20150209
 * 修改描述：增加"批量删除"功能.
 * </summary>
 * ---------------------------------------------------------------------------------
 */
var structId = location.href.split('=')[1].split('&')[0];
var imageName = location.href.split('=')[2];
var g_svgIsLoaded = false;
var g_svgDoc;
var g_hotspots = {};
var g_sinfo = {}; // { type-sensor/section-id => { pid:productTypeId, pname:productName, l:location } }
var HOTSPOT_TYPE_SENSOR = 1;
var HOTSPOT_TYPE_SECTION = 2;
var g_offsetWidth, g_offsetHeight;
var g_arraySection = [];
var g_productSensors = {};

var g_hotspotsBatchSelected = {}; // it is used to save the hotspots which are red.

$(function() {
    document.getElementById('mainHeapMapStructName').innerText = getCookie('MainHeapMapStructName'); // 主热点图结构物名称
    // init loading marker.
    initLoader();
    // dropdown菜单
    $("#theDropDownMenu").dropdown();
    var svgContainer = $("#svgContainer");
    $("#theDropDownMenu").detach().appendTo(svgContainer);
    // SVG图
    $('<embed src="/resource/img/Topo/' + imageName + '" id="svgEle" onload="onloadSvg();" type="image/svg+xml" />').appendTo('#svgContainer');
    // 获取未配置热点
    getUnconfiguredSensors();
    getUnconfiguredSections();

    bindChangeEvent();
    bindClickEvent();
    
    addTooltipOfPath();
});

function addTooltipOfPath() {
    var tooltip = '<div>';
    tooltip += '<p>"path"为SVG图中用以描述曲线路径的节点, 常见命令有:</p>';
    tooltip += '<table border="1" width="100%">';
    tooltip += '<tr><th style="width: 20%">命令</th><th style="width: 40%;">含义</th><th style="width: 40%;">语法</th></tr>';
    tooltip += '<tr><td>M</td><td>moveto</td><td>M X,Y</td></tr>';
    tooltip += '<tr><td>L</td><td>lineto</td><td>L X,Y</td></tr>';
    tooltip += '<tr><td>H</td><td>horizontal lineto</td><td>H X</td></tr>';
    tooltip += '<tr><td>V</td><td>vertical lineto</td><td>V Y</td></tr>';
    tooltip += '<tr><td>C</td><td>curveto</td><td>C X1,Y1,X2,Y2,ENDX,ENDY</td></tr>';
    tooltip += '<tr><td>Z</td><td>closepath</td><td>Z</td></tr></table>';
    tooltip += '<p style="margin-bottom: 0;">注意: 上面所有的命令也可以表示成小写形式. 大写字母表示绝对位置, 小写字母表示相对位置.<br />' +
        '<span style="color: green;">例子: "M 0,0 100,100" 表示 "SVG图中起点(0,0)至终点(100,100)的一条线段".</span></p></div>';
    $('#labelPath').attr('title', tooltip);

    $('#labelPath').tooltip({
        html: true,
        placement: 'bottom'
    });
}

function bindChangeEvent() {
    // 热点类型/产品类型 change event.
    $('#configHotspotType').change(onchangeHotspotType);
    $('#configProductType').change(onchangeProductType);
}

function bindClickEvent() {
    // 新建/编辑modal中"保存"点击事件.
    $('#btnConfigModalSave').click(onsaveHotspot);
    // handle the Close menu item.
    var pop = $("#theDropDownMenu");
    var pop3 = $(pop.children("li").children("a")[2]);
    pop3.text("关闭").bind("click", function () {
        $(this).parent().parent().hide();
    });
    // "选择全部" "取消选择" "删除" click event.
    $('#btnSelectAll').click(onselectAllHotspots);
    $('#btnCancelSelect').click(oncancelSelect);
    $('#btnBatchDelete').click(ondeleteHotspots);
}

/**
 * "选择全部"按钮点击方法.
 */
function onselectAllHotspots() {
    renderHotspotIcons('red');
    $('#btnCancelSelect').removeClass('gray').addClass('blue').removeAttr('disabled');
    $('#btnBatchDelete').removeClass('gray').addClass('red').removeAttr('disabled');
}

function renderHotspotIcons(color) {
    for (var key in g_hotspots) {
        var hotspot = g_hotspots[key];
        if (hotspot == null) {
            continue;
        }
        if (hotspot.sectionId != null) {
            if (color == 'red') {
                hotspot.svg.href.baseVal = "/resource/img/icon-section-1.png";
                g_hotspotsBatchSelected[key] = hotspot;
            } else {
                hotspot.svg.href.baseVal = "/resource/img/icon-section-2.png";
            }
        } else {
            if (color == 'red') {
                hotspot.svg.href.baseVal = "/resource/img/factorIcon/icon-" + hotspot.productTypeId + "-1.png";
                g_hotspotsBatchSelected[key] = hotspot;
            } else {
                hotspot.svg.href.baseVal = "/resource/img/factorIcon/icon-" + hotspot.productTypeId + "-5.png";
            }
        }
    }
}

/**
 * "取消选择"按钮点击方法.
 */
function oncancelSelect() {
    for (var key in g_hotspotsBatchSelected) {
        var hotspot = g_hotspotsBatchSelected[key];
        if (hotspot == null) {
            continue;
        }
        if (hotspot.sectionId != null) {
            hotspot.svg.href.baseVal = "/resource/img/icon-section-2.png";
        } else {
            hotspot.svg.href.baseVal = "/resource/img/factorIcon/icon-" + hotspot.productTypeId + "-5.png";
        }
        delete g_hotspotsBatchSelected[key];
    }
    $('#btnCancelSelect').removeClass('blue').addClass('gray').attr('disabled', 'disabled');
    $('#btnBatchDelete').removeClass('red').addClass('gray').attr('disabled', 'disabled');
}

function ondeleteHotspots() {
    popupDeletionConfirmDialog('batch');
}

/**
 * 初始化加载图片
 */
function initLoader() {
    var offsetLeft = $('#boxContent').offset().left;
    var posLeft = offsetLeft + $('#svgContainer').width() / 2 - 50;
    $('#svgLoading').attr("style", "left:" + posLeft + "px;"); // init and show the loading marker.
}

/**
 * SVG加载方法
 */
function onloadSvg() {
    g_svgIsLoaded = true; // SVG已加载完成
}

window.onload = function () {
    if (g_svgIsLoaded) {
        showSvg();
    } else {
        setTimeout(function () {
            showSvg();
        }, 2000);
    }
};

function showSvg() {
    var svgEle = document.getElementById("svgEle");
    g_svgDoc = svgEle.getSVGDocument(); // 获得svg的document对象
    if (g_svgDoc == null) {
        $('#svgLoading').hide();
    }
    g_svgDoc.addEventListener('click', clickSvg, false); // 监听SVG点击事件
    g_svgDoc.addEventListener('contextmenu', popupContextMenuOnSvg, false); // 监听SVG弹出上下文菜单

    g_offsetWidth = svgEle.offsetWidth;
    g_offsetHeight = svgEle.offsetHeight;

    // 获取已配置热点
    getConfiguredSensors();
    getConfiguredSections();
}

function clickSvg(event) {
    $("#theDropDownMenu").hide(); // close the popup menu.
    handleBatchSelect(event); // batch select.
    handleCancelSelect();
}

function popupContextMenuOnSvg(event) {
    event.preventDefault();
    handlePopupMenu(event);
}

/**
 * 获取未配置的传感器
 */
function getUnconfiguredSensors() {
    var url = apiurl + "/struct/" + structId + "/product/non-hotspot" + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            g_productSensors = {}; // 清空
            if (data.length == 0) {
                return;
            }
            $.each(data, function (i, productSensors) {
                g_productSensors["product_" + productSensors.productTypeId] = productSensors;
                $.each(productSensors.sensors, function (j, sensor) {
                    g_sinfo[HOTSPOT_TYPE_SENSOR + "_" + sensor.sensorId] = { pid: productSensors.productTypeId, pname: productSensors.productName, l: sensor.location };
                });
            });
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert('获取未配置的传感器时发生异常.\r\n' + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 获取未配置的施工截面
 */
function getUnconfiguredSections() {
    var url = apiurl + '/struct/' + structId + '/non-hotspot/sections' + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            g_arraySection = []; // 清空
            if (data.length == 0) {
                return;
            }
            g_arraySection = data;
            for (var i = 0; i < g_arraySection.length; i++) {
                var si = g_arraySection[i];
                g_sinfo[HOTSPOT_TYPE_SECTION + "_" + si.sectionId] = { pid: "N/A", pname: "N/A", l: si.sectionName };
            }
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert('获取未配置的施工截面时发生异常.\r\n' + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 获取已配置的传感器热点信息
 */
function getConfiguredSensors() {
    var url = apiurl + "/struct/" + structId + "/hotspot-config" + '?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data.length == 0) {
                $('#svgLoading').hide(); // hide the loading marker.
                return;
            }
            drawHotspots(data, HOTSPOT_TYPE_SENSOR);
        },
        error: function (xhr) {
            $('#svgLoading').hide(); // hide the loading marker.
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status == 405) { // aborted requests should be just ignored and no error message be displayed
                alert('抱歉，没有布点权限');
            } else if (xhr.status !== 0 ) { // aborted requests should be just ignored and no error message be displayed
                alert("获取已配置的传感器热点信息时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });
}

/**
 * 获取已配置的施工截面热点信息
 */
function getConfiguredSections() {
    var url = apiurl + '/struct/' + structId + '/hotspot-config/sections' + '?token=' + getCookie("token");    
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            if (data.length == 0) {
                $('#svgLoading').hide(); // hide the loading marker.
                return;
            }
            drawHotspots(data, HOTSPOT_TYPE_SECTION);
        },
        error: function (xhr) {
            $('#svgLoading').hide(); // hide the loading marker.
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取已配置的截面信息时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
        }
    });  
}

function drawHotspots(data, type) {
    // var isIE = checkBrowser();
    for (var i = 0; i < data.length; i++) {
        createHotspotItem(data[i], type);
        
        if (type == HOTSPOT_TYPE_SENSOR) {
            g_sinfo[type + "_" + data[i].sensorId] = { pid: data[i].productTypeId, pname: data[i].productName, l: data[i].location };
        }
        else {
            g_sinfo[type + "_" + data[i].sectionId] = { pid: "N/A", pname:"N/A", l: data[i].sectionName };
        }
    }
    $('#svgLoading').hide(); // hide the loading marker.
    $('#btnSelectAll').removeClass('gray').addClass('blue').removeAttr('disabled'); // enable "选择全部"按钮.
}

/**
 * SVG图上创建热点
 */
function createHotspotItem(hotspot, type, check) {
    var hotspotEleId = "hotspot_" + type + "_" + hotspot.hotspotId;
    
    var checkExisted = check == null ? false : check;
    if (checkExisted) removeHotspotItem(hotspotEleId); // remove from SVG if existed.
    
    var svgImg = g_svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image');
    svgImg.setAttribute('id', hotspotEleId); // type_hotspotid as element's id
    svgImg.setAttribute('width', '16');
    svgImg.setAttribute('height', '16');
    svgImg.setAttribute("hotspotId", hotspot.hotspotId);
    svgImg.setAttribute("type", type);
    if (type == HOTSPOT_TYPE_SENSOR) {
        svgImg.href.baseVal = "/resource/img/factorIcon/icon-" + hotspot.productTypeId + "-5.png";
        svgImg.setAttribute('x', hotspot.xAxis * g_offsetWidth - 8);
        svgImg.setAttribute('y', hotspot.yAxis * g_offsetHeight - 8);
    } else {
        svgImg.href.baseVal = "/resource/img/icon-section-2.png";
        svgImg.setAttribute('x', hotspot.sectionSpotX * g_offsetWidth - 8);
        svgImg.setAttribute('y', hotspot.sectionSpotY * g_offsetHeight - 8);
        // path node
        if (hotspot.sectionSpotPath != null && hotspot.sectionSpotPath.trim() != "") {
            var svgPath = g_svgDoc.createElementNS('http://www.w3.org/2000/svg', 'path');
            var pathId = "path_" + type + "_" + hotspot.hotspotId;
            svgPath.setAttribute('id', pathId);
            svgPath.setAttribute('d', hotspot.sectionSpotPath);
            // svgPath.setAttribute('d', 'M 590,218 608,300'); // use for test.
            svgPath.setAttribute('style', 'stroke: #00ff00; stroke-width: 4;');
            g_svgDoc.documentElement.appendChild(svgPath);
        }
    }
    g_svgDoc.documentElement.appendChild(svgImg);
    
    hotspot.svg = svgImg;
    g_hotspots[hotspotEleId] = hotspot; // 保存SVG图中热点信息
}

/**
 * SVG图上移除热点
 */
function removeHotspotItem(hotspotElmId) {
    var imageEle = g_svgDoc.getElementById(hotspotElmId);
    $(imageEle).remove();
}

function handleBatchSelect(e) {
    var source = e.srcElement;
    var key = source.id;
    if (source.localName == "image") { // 渲染红色图标.
        var hotspotIcon = source.href.baseVal;
        if (/(-5.png)|(-2.png)$/.test(hotspotIcon)) {
            source.href.baseVal = hotspotIcon.slice(0, -6) + '-1.png'; // red icon.
            g_hotspotsBatchSelected[key] = g_hotspots[key];
        } else {
            if (hotspotIcon.indexOf('-section-1.png') != -1) {
                source.href.baseVal = hotspotIcon.split('-1.png')[0] + '-2.png'; // green icon of section.
            } else {
                source.href.baseVal = hotspotIcon.split('-1.png')[0] + '-5.png'; // green icon of sensor.
            }
            if (g_hotspotsBatchSelected[key] != null) {
                delete g_hotspotsBatchSelected[key];
            }
        }
    }
}

/**
 * 点击SVG时, 启用/禁用"取消选择"按钮.
 */
function handleCancelSelect() {
    var flag = false;
    for (var key in g_hotspotsBatchSelected) {
        var hotspot = g_hotspotsBatchSelected[key];
        if (hotspot == null) {
            continue;
        }
        flag = true;
        break;
    }
    if (flag) {
        $('#btnCancelSelect').removeClass('gray').addClass('blue').removeAttr('disabled');
        $('#btnBatchDelete').removeClass('gray').addClass('red').removeAttr('disabled');
        
    } else {
        $('#btnCancelSelect').removeClass('blue').addClass('gray').attr('disabled', 'disabled');
        $('#btnBatchDelete').removeClass('red').addClass('gray').attr('disabled', 'disabled');
    }
}

function handlePopupMenu(e) {
    var x = e.offsetX;
    var y = e.offsetY;

    var pop = $("#theDropDownMenu");
    var pop1 = $(pop.children("li").children("a")[0]);
    var pop2 = $(pop.children("li").children("a")[1]);

    var source = e.srcElement;
    if (source.localName == "image") { // 编辑或删除
        var hotspotEleId = source.id;
        var hotspot = g_hotspots[hotspotEleId];
        var text = hotspot.location != undefined ? hotspot.location : hotspot.sectionName;
        $(pop.children("li").children("a")[0]).removeAttr("style"); // restore the popup.
        pop1.text("编辑热点：" + text + " ...").unbind().one("click", function () {
            $(this).parent().parent().hide();
            $('#titleConfigHotspot').text('编辑热点');
            showHotspotModal(x, y, hotspot);
        });
        pop2.show().text("删除本热点").unbind().one("click", function () {
            // hide dropdown menu.
            $(this).parent().parent().hide();
            // popup deletion confirm dialog.
            popupDeletionConfirmDialog('single', hotspotEleId);
        });
    } else { // 新建
        if (isEmptyObject(g_productSensors) && g_arraySection.length == 0) { // 禁用新建
            $(pop.children("li").children("a")[0]).html("此处新建热点...").attr("style", "color: gray; cursor: text;");
        } else {
            $(pop.children("li").children("a")[0]).removeAttr("style"); // restore the popup.
            $(pop.children("li").children("a")[0]).html("此处新建热点...").unbind().one("click", function () {
                $(this).parent().parent().hide();
                $('#titleConfigHotspot').text('新建热点');
                $("#configPath").val(''); // clear up path
                $('#configHotspotType option').removeAttr('disabled');
                showHotspotModal(x, y, null);
            });
        }
        pop2.hide();
    }

    var svgContainer = $("#svgContainer");
    var l = x + svgContainer.offset().left;
    var t = y + svgContainer.offset().top;
    pop.css("left", l).css("top", t);
    pop.show(200);
}

/**
 * 显示“新建/编辑热点”对话框
 */
function showHotspotModal(x, y, oldHotspot) {
    var dlg = $("#modalConfigHotspot");
    dlg.data("oldData", oldHotspot);

    var type = HOTSPOT_TYPE_SENSOR; // initial type for new modal
    var path = "M " + x + "," + y; // initial path for new modal
    var ssidToModify = null;
    // show Old value
    if (oldHotspot != null) {
        // 显示要编辑的热点信息.
        type = parseInt(oldHotspot.svg.getAttribute("type"));
        if (type == HOTSPOT_TYPE_SENSOR) {
            $('#configHotspotType option[value="' + HOTSPOT_TYPE_SENSOR + '"]').removeAttr('disabled');
            $('#configHotspotType option[value="' + HOTSPOT_TYPE_SECTION + '"]').attr('disabled', 'disabled'); // stop user from modifying the sensor hotspot to section hotspot
            x = Math.round(oldHotspot.xAxis * g_offsetWidth);
            y = Math.round(oldHotspot.yAxis * g_offsetHeight);
            path = oldHotspot.svgPath == null ? ("M " + x + "," + y) : oldHotspot.svgPath;
            ssidToModify = oldHotspot.sensorId;
        } else {
            $('#configHotspotType option[value="' + HOTSPOT_TYPE_SECTION + '"]').removeAttr('disabled');
            $('#configHotspotType option[value="' + HOTSPOT_TYPE_SENSOR + '"]').attr('disabled', 'disabled'); // stop user from modifying the section hotspot to sensor hotspot
            x = Math.round(oldHotspot.sectionSpotX * g_offsetWidth);
            y = Math.round(oldHotspot.sectionSpotY * g_offsetHeight);
            path = oldHotspot.sectionSpotPath == null ? ("M " + x + "," + y) : oldHotspot.sectionSpotPath;
            ssidToModify = oldHotspot.sectionId;
        }
    }
    $('#configHotspotType').val("" + type); // must use val() method to set the value;
    $('#configAxis').val('X=' + x + '      Y=' + y);
    $("#configHotspotX").val(x);
    $("#configHotspotY").val(y);
    $("#configPath").val(path);

    onchangeHotspotType(null, ssidToModify);
    
    dlg.modal(); // show modal. this statement is vital!
}

/**  
 * 弹出删除确认框
 */
function popupDeletionConfirmDialog(type, hotspotEleId) {
    $('#modalDeleteHotspot').modal();
    var confirmContent = '确认删除本热点吗?';
    if (type == 'batch') {
        confirmContent = '确认删除这些热点吗?';
    }
    $('#deletionMsg').text(confirmContent);
    $('#btnDeleteConfirm').unbind("click").click(function () {
        // delete it
        $('#modalDeleteHotspot').modal('hide');
        if (type == 'single') {
            onremoveHotspot('single', hotspotEleId);
        } else {
            // delete multiple/all hotspots.
            onremoveHotspot('batch');
        }
    });
}

/**
 * 改变热点类型（传感器热点/施工截面热点）时，展示对应的"产品类型"或"施工截面名称"
 */
function onchangeHotspotType(event, ssidToModify) {
    var spotType = $('#configHotspotType').val();
    if (spotType == HOTSPOT_TYPE_SENSOR) {
        $('#group_configProductType').attr("style", "display:block"); // show productType
        $('#labelSensorOrSection').text("传感器");
    } else {
        $('#group_configProductType').attr("style", "display:none"); // hide productType
        $('#labelSensorOrSection').text("截面");
    }
    showSensorOrSection(spotType == HOTSPOT_TYPE_SENSOR ? 'Sensor' : "Section", ssidToModify);
}

/**
 * 改变"产品类型"时，展示对应的"传感器位置"
 */
function onchangeProductType(event, targetObj, ssidToModify) {
    var productTypeId = $('#configProductType').val();
    var sb = new StringBuffer();
    // 编辑modal
    if (ssidToModify != null) {
        var ss = g_sinfo[HOTSPOT_TYPE_SENSOR + '_' + ssidToModify].l;
        sb.append('<option value="' + ssidToModify + '">' + ss + '</option>'); // 编辑modal中显示待编辑的传感器位置
    } else if (productTypeId == 'N/A') {
        sb.append('<option value="N/A">无可布点传感器<option>');
    }
    if (g_productSensors["product_" + productTypeId] != null) {
        var sensors = g_productSensors["product_" + productTypeId].sensors;
        $.each(sensors, function (j, sensor) {
            sb.append('<option value="' + sensor.sensorId + '">' + sensor.location + '</option>');
        });
    }
    // 刷新传感器位置列表,下面两行必须！
    $('#configSensorOrSection').removeClass('chzn-done');
    $('#configSensorOrSection_chzn').remove();
    $('#configSensorOrSection').html(sb.toString());
    // 筛选框,必须！
    $('#configSensorOrSection').chosen({
        no_results_text: "没有找到",
        allow_single_de: true
    });
}
 
/**
 * 显示产品类型/截面名称列表
 */
function showSensorOrSection(sensorOrSection, ssid) {
    var type = null;
    var sbProductType = new StringBuffer();
    var sb = new StringBuffer();
    if (sensorOrSection == 'Sensor') {
        type = HOTSPOT_TYPE_SENSOR;
        // 编辑modal
        if (ssid != null) {
            var sensor = g_sinfo[type + '_' + ssid];
            sbProductType.append('<option value="' + sensor.pid + '">' + sensor.pname + '</option>');
        } else {
            if (isEmptyObject(g_productSensors)) {
                sbProductType.append('<option value="N/A">无可布点产品类型<option>');
            }
            // create the struct productType.
            $.each(g_productSensors, function (key, productSensors) {
                sbProductType.append('<option value="' + productSensors.productTypeId + '">' + productSensors.productName + '</option>');
            });
        }
        // show the struct productType.
        $('#configProductType').removeClass('chzn-done'); // these statements are vital.
        $('#configProductType_chzn').remove();
        $('#configProductType').html(sbProductType.toString()); // 产品类型
        $('#configProductType').chosen({
            no_results_text: "没有找到",
            allow_single_de: true
        });
        // show the product sensors.
        onchangeProductType(null, null, ssid);
    } else {
        type = HOTSPOT_TYPE_SECTION;
        // 编辑modal
        if (ssid != null) {
            var ss = g_sinfo[type + '_' + ssid].l;
            sb.append('<option value="' + ssid + '">' + ss + '</option>'); // 编辑modal中显示待编辑的截面名称
        } else if (g_arraySection.length == 0) {
            sb.append('<option value="N/A">无可布点截面<option>');
        }
        $.each(g_arraySection, function (i, item) {
            sb.append('<option value="' + item.sectionId + '">' + item.sectionName + '</option>');
        });
        // 刷新截面名称列表，下面两行必须！
        $('#configSensorOrSection').removeClass('chzn-done');
        $('#configSensorOrSection_chzn').remove();
        $('#configSensorOrSection').html(sb.toString());
        // 筛选框
        $('#configSensorOrSection').chosen({
            no_results_text: "没有找到",
            allow_single_de: true
        });
    }

    // enable or disable the save button. 
    var val = $("#configSensorOrSection").val();
    var checkValidity = val == 'N/A' ? false : true;
    if (!checkValidity) {
        document.getElementById("btnConfigModalSave").disabled = true; // 禁用"保存"
        $('#btnConfigModalSave').removeClass('red').css('cursor', 'text');
        return false;

    } else {
        document.getElementById("btnConfigModalSave").disabled = false; // 使能"保存"
        $('#btnConfigModalSave').addClass('red').css('cursor', 'pointer');
    }
}

/**
 * 保存热点
 */
function onsaveHotspot() {
    var val = $("#configSensorOrSection").val();
    var checkValidity = val == 'N/A' ? false : true;
    if (!checkValidity) {
        return;
    }
    
    var dlg = $("#modalConfigHotspot");
    var path = $('#configPath').val();
    var oldData = dlg.data("oldData");
    var isModifyHotspot = oldData != null;
    // 编辑?  新建?   
    var url = null;
    var hotspotId = null;
    var dataToSave = {};
    var posx = parseInt($("#configHotspotX").val()) / g_offsetWidth;
    var posy = parseInt($("#configHotspotY").val()) / g_offsetHeight;
    var hotspotType = $("#configHotspotType").val();
    var token = getCookie("token");
    var ssid = $("#configSensorOrSection").val(); //section/sensor's ID
    
    if (hotspotType == HOTSPOT_TYPE_SENSOR) {
        // Sensor
        dataToSave.sensorId = ssid;
        dataToSave.xAxis = posx;
        dataToSave.yAxis = posy;
        dataToSave.svgPath = path;
        if (isModifyHotspot) {
            if (oldData == null) {
                return;
            }
            hotspotId = oldData.hotspotId;
            url = apiurl + '/hotspot-config/' + hotspotId + '/modify' + '?token=' + token; // sensor
        } else {
            url = apiurl + "/hotspot-config/add" + '?token=' + token; // sensor
        }
    } else {
        // Section
        dataToSave.sectionId = ssid;
        dataToSave.sectionSpotX = posx;
        dataToSave.sectionSpotY = posy;
        dataToSave.sectionSpotPath = path;
        if (isModifyHotspot) {
            if (oldData == null) {
                return;
            }
            hotspotId = oldData.hotspotId;
            url = apiurl + '/hotspot-config/' + hotspotId + '/section/modify' + '?token=' + token;
        } else {
            url = apiurl + "/hotspot-config/section/add" + '?token=' + token;
        }
    }
    // 保存
    $.ajax({
        url: url,
        type: "post",
        dataType: "json",
        data: dataToSave,
        success: function(data) {
            handleHotspotSaved(data, dataToSave, hotspotType, isModifyHotspot);
        },
        error: function (xhr) {
            if (xhr.status == 403) {
                logOut();
            } else if (xhr.status ==405) { // aborted requests should be just ignored and no error message be displayed
                alert("抱歉，没有布点的权限");
            } else if (xhr.status !== 0 ) { // aborted requests should be just ignored and no error message be displayed
                alert("保存数据时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
            }
            $('#modalConfigHotspot').modal('hide');
        }
    });
}

function handleHotspotSaved(data, dataToSave, type, isModify) {
    // 保存成功, 将已保存对象传递至调用者.
    var jsonData = $.parseJSON(data);
    $("#btnConfigModalCancel").click(); // 保存成功后关闭热点配置对话框
    if (dataToSave != null) {
        // 需要区别 sensor/section
        var sectionOrSensorInfo = null;
        dataToSave.hotspotId = jsonData.hotspotId; 
        if (type == HOTSPOT_TYPE_SENSOR) {
            sectionOrSensorInfo = g_sinfo[type + "_" + dataToSave.sensorId];
            getUnconfiguredSensors();
        } else {
            sectionOrSensorInfo = g_sinfo[type + "_" + dataToSave.sectionId];
            getUnconfiguredSections();
        }
        dataToSave.productTypeId = sectionOrSensorInfo.pid; // vital, use to show the icon of sensor product type in SVG image
        dataToSave.location = sectionOrSensorInfo.l; // vital, use to show sensor localtion or section name in popup menu
        createHotspotItem(dataToSave, type, isModify);
        if (!isModify) { // enable "选择全部"按钮.
            $('#btnSelectAll').removeClass('gray').addClass('blue').removeAttr('disabled');
        }
    }
}

/**
 * 删除热点
 */
function onremoveHotspot(typeSingleOrBatch, hotspotElmId) {
    if (typeSingleOrBatch == 'batch') {
        removeBatchHotspot();
    } else {
        removeSingleHotspot(hotspotElmId);
    }
}

function removeBatchHotspot() {
    var arrHotspotSensor = [];
    var arrHotspotSection = [];
    for (var key in g_hotspotsBatchSelected) {
        var hotspot = g_hotspotsBatchSelected[key];
        if (hotspot == null) {
            continue;
        }
        if (hotspot.sectionId != null) {
            arrHotspotSection.push(hotspot.hotspotId);
        } else {
            arrHotspotSensor.push(hotspot.hotspotId);
        }
    }
    var url;
    if (arrHotspotSensor.length > 0) {
        url = apiurl + '/hotspot-config/remove/' + arrHotspotSensor + '?token=' + getCookie("token");
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function () {
                var arrImageEle = [];
                for (var i = 0; i < arrHotspotSensor.length; i++) {
                    var hotspotEleId = "hotspot_" + HOTSPOT_TYPE_SENSOR + "_" + arrHotspotSensor[i];
                    var imageEle = g_svgDoc.getElementById(hotspotEleId);
                    if (imageEle != null) {
                        arrImageEle.push($(imageEle));
                    }
                }
                if (arrImageEle.length > 0) {
                    handleHotspotRemoved(HOTSPOT_TYPE_SENSOR, arrImageEle);
                } else {
                    alert('不存在待移除的热点(传感器).');
                }
            },
            error: function (xhr) {
                if (xhr.status == 403) {
                    logOut();
                } else if (xhr.status== 405) { // aborted requests should be just ignored and no error message be displayed
                    alert('抱歉，没有删除热点的权限');
                } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                    alert('批量删除传感器热点时发生异常.\r\n' + xhr.status + ' : ' + xhr.statusText);
                }
            }
        });
    }
    if (arrHotspotSection.length > 0) {
        // remove Section hotspot
        url = apiurl + '/hotspot-config/' + arrHotspotSection + '/section/remove' + '?token=' + getCookie("token");
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function () {
                var arrImageEle = [];
                for (var i = 0; i < arrHotspotSection.length; i++) {
                    var hotspotEleId = "hotspot_" + HOTSPOT_TYPE_SECTION + "_" + arrHotspotSection[i];
                    var imageEle = g_svgDoc.getElementById(hotspotEleId);
                    if (imageEle != null) {
                        arrImageEle.push($(imageEle));
                    }
                }
                if (arrImageEle.length > 0) {
                    handleHotspotRemoved(HOTSPOT_TYPE_SECTION, arrImageEle);
                } else {
                    alert('不存在待移除的热点(截面).');
                }
            },
            error: function (xhr) {
                if (xhr.status == 403) {
                    logOut();
                } else if (xhr.status == 405) { // aborted requests should be just ignored and no error message be displayed
                    alert('抱歉，没有删除热点的权限');
                } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                    alert('批量删除截面热点时发生异常.\r\n' + xhr.status + ' : ' + xhr.statusText);
                }
            }
        });
    }
}


function removeSingleHotspot(hotspotElmId) {
    var imageEle = g_svgDoc.getElementById(hotspotElmId);
    if (imageEle == null) {
        return;
    }
    var type = imageEle.getAttribute("type");
    // remove it.
    var hotspotId = imageEle.getAttribute("hotspotId");
    var url;
    if (type == HOTSPOT_TYPE_SENSOR) {
        url = apiurl + '/hotspot-config/remove/' + hotspotId + '?token=' + getCookie("token");
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function () {
                handleHotspotRemoved(type, new Array($(imageEle)));
            },
            error: function (xhr) {
                if (xhr.status == 403) {
                    logOut();
                } else if (xhr.status == 405) { // aborted requests should be just ignored and no error message be displayed
                    alert('抱歉，没有删除热点的权限');
                } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                    alert('删除传感器热点时发生异常.\r\n' + xhr.status + ' : ' + xhr.statusText);
                }
            }
        });
    } else {
        // remove Section hotspot
        url = apiurl + '/hotspot-config/' + hotspotId + '/section/remove' + '?token=' + getCookie("token");
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function () {
                handleHotspotRemoved(type, new Array($(imageEle)));
            },
            error: function (xhr) {
                if (xhr.status == 403) {
                    logOut();
                } else if (xhr.status == 405) { // aborted requests should be just ignored and no error message be displayed
                    alert('抱歉，没有删除热点的权限');
                } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                    alert('删除截面热点时发生异常.\r\n' + xhr.status + ' : ' + xhr.statusText);
                }
            }
        });
    }
}

/**
 * handle on the hotspots which have been removed successfully.
 */
function handleHotspotRemoved(type, hotspotObj) {
    if (type == HOTSPOT_TYPE_SENSOR) {
        getUnconfiguredSensors();
    } else if (type == HOTSPOT_TYPE_SECTION) {
        getUnconfiguredSections();
    }
    for (var i = 0; i < hotspotObj.length; i++) {
        hotspotObj[i].remove();

        var key = hotspotObj[i][0].id;
        delete g_hotspots[key];
        delete g_hotspotsBatchSelected[key];
    }
    if (isEmptyObject(g_hotspotsBatchSelected)) {
        $('#btnCancelSelect').removeClass('blue').addClass('gray').attr('disabled', 'disabled');
        $('#btnBatchDelete').removeClass('red').addClass('gray').attr('disabled', 'disabled');
    }
    if (isEmptyObject(g_hotspots)) {
        $('#btnSelectAll').removeClass('blue').addClass('gray').attr('disabled', 'disabled');
    }
}

/**
 * 检查当前浏览器是否为IE浏览器
 */ 
function checkBrowser() {
    return navigator.appName == "Microsoft Internet Explorer";
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
