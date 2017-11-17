/*!  
 * all structures chart show 
 * Xu Hang, 2014/3/5
 * Copyright 2014, 江苏飞尚
 */
var data_depth_time_y = [];
var data_values_y = [];
var data_depth_time_x = [];
var data_values_x = [];
var factorList = [];
var events = $.Callbacks();

var structId = '';

$(function () {
    Highcharts.setOptions({
        global: {
            useUTC: false //关闭UTC
        },
        lang: {
            printChart: "打印",
            downloadJPEG: "下载JPEG 图片",
            downloadPDF: "下载PDF文档",
            downloadPNG: "下载PNG 图片",
            downloadSVG: "下载SVG 矢量图",
            exportButtonTitle: "导出图片",
            resetZoom: "回到原始大小",
            resetZoomTitle: "重置缩放比例 1:1"
        },
       
    });
});

var chartEvent = $.Callbacks();

var chartTemplet =
{
    chart: {
        type: 'spline'
    },
    title: {
        text: '',
        x: -20 //center
    },
    subtitle: {
        text: '',
        x: -20
    },
    xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
            //second: '%H:%M:%S',
            minute: '%H:%M:%S',
            //hour: '%H:%M:%S',
            day: '%Y-%m-%d',
            month: '%b %y',
            //year: '%Y-%m-%d'
        },
        //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: { rotation: -25, align: 'right', style: { font: 'normal 13px Verdana, sans-serif' } }
    },
    yAxis: {
        title: {
            //text: '应变(με)'
        },
        labels: {
            align: 'left',
            x: 3,
            y: 16,
            //formatter: function () {
            //    return Highcharts.numberFormat(this.value, 0);
            //}
        },

        showFirstLabel: false

    },
    exporting: {
        url: 'HighchartsExport.axd',
        width: 1200
    },
    credits: {
        enabled: false
        //href: 'http://www.f-song.com',
        //text: '江西飞尚科技有限公司'
    },
    plotOptions: {
        spline: {
            lineWidth: 1.5,
            states: {
                hover: {
                    lineWidth: 1.5
                }
            },
            marker: {
                enabled: false
            }
            //pointInterval: 3600000, // one hour
            //pointStart: Date.UTC(2013, 9, 27, 0, 0, 0)
        }
    },

    tooltip: {
        shared: true,
        crosshairs: true
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    },
    series: []
};

var sensorListChangeHander = function (sensorId, index) {
    var startime = new Date();
    startime.setDate(startime.getDate() - 1);
    if (factorList[index].factorId == 10) {
        internalDisplacement(index,startime);

    } else {

        $('#error_' + index).hide();
        $('#load_statistics_loading_' + index).show();
        $('#load_statistics_content_' + index).hide();

        var url = apiurl + '/sensor/' + sensorId + '/data/' + date2string(startime) + '/' + date2string(new Date()) + '?token=' + getCookie("token");

        var chart = chartTemplet;

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            //async: false,
            success: function(data) {
                if (data === null) {
                    alert('查询编号' + sensorId + '传感器数据失败。');
                    index++;
                    return;
                } else if (data.length === 0 || data[0].data.length === 0) {
                    $('#load_statistics_loading_' + index).hide();
                    $('#load_statistics_content_' + index).hide();
                    $('#error_' + index).show();
                    return;
                }

                try {
                    chart.series = [];

                    //一个值的情况

                    var isSameUnit = true;

                    var unit = data[0].unit[0];

                    for (var i = 0; i < data[0].unit.length; i++) {
                        if (unit != data[0].unit[i]) {
                            isSameUnit = false;
                        }

                    }

                    //if (isSameUnit) {

                    chart.tooltip.formatter = function() {
                        var tooltipString = '<b>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '</b>';
                        for (var i = 0; i < this.points.length; i++) {

                            tooltipString = tooltipString + '<br/>' + this.points[i].series.name + ':' + this.points[i].y + '<b>' + data[0].unit[i] + '</b>';
                        }
                        return tooltipString;
                    };
                    // }
                    //else {
                    //    chart.tooltip.formatter = function () {
                    //        var tooltipString = '<b>' + this.series.name + '</b>';
                    //        tooltipString = tooltipString + '<br/><br/>采集时间:' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x);

                    //        tooltipString = tooltipString + '<br/>' + '监测数据:' + this.y.toString() + '<b>' + unit[this.series.index] + '</b>';

                    //        return tooltipString;
                    //    }
                    //}

                    for (var i = 0; i < data[0].unit.length; i++) {

                        chart.yAxis.title = { text: factorList[index].factorName + '(' + unit + ')' };

                        var array = new Array();
                        for (var j = 0; j < data[0].data.length; j++) {
                            var time = data[0].data[j].acquisitiontime.substring(6, 19);
                            if (data[0].data[j].value[i] != null) {
                                array.push([parseInt(time), data[0].data[j].value[i]]);
                            }
                        }
                        chart.series.push({ name: data[0].columns[i], data: array });
                    }
                    if (factorList[index].factorId === 6) {
                        chart.chart = {
                            type: 'column',
                            renderTo: 'chart_' + index,
                            zoomType: 'x',
                            resetZoomButton: {
                                position: {
                                    x: -40,
                                    y: 10
                                },
                                relativeTo: 'chart'
                            }
                        }
                    } else {
                        chart.chart = {
                            type: 'spline',
                            renderTo: 'chart_' + index,
                            zoomType: 'x',
                            resetZoomButton: {
                                position: {
                                    x: -40,
                                    y: 10
                                },
                                relativeTo: 'chart'
                            }
                        }
                    }
                    $('#load_statistics_loading_' + index).hide();
                    $('#error_' + index).hide();
                    $('#load_statistics_content_' + index).show();

                    if (factorList[index].factorId === 5) {
                        var doubleAxis = twoAxis(data);
                        var seriesData = series(data);
                        var tableValus = seriesData.tableValues;
                        var columns = data[0].columns;
                        var unit = data[0].unit;
                        chart = createHighchartComm1('chart_' + index, '趋势图', doubleAxis, seriesData.dataSeries, factorList[index].factorId);
                        chart.tooltip.formatter = function () {
                            var tooltipString = '<b>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '</b>';
                            tooltipString = tooltipString + '<br/>' + this.series.name+':' + this.y.toString() + '<b>' + unit[this.series.index] + '</b>';

                            return tooltipString;
                        }
                    }
                    var tempchart = new Highcharts.Chart(chart);
                } catch (err) {

                    alert(err);
                }

            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.status == 403) {
                    alert("登录已超时，请重新登录");
                    logOut();
                } else if (XMLHttpRequest.status == 400) {
                    $('#load_statistics_loading_' + index).hide();
                    $('#error_' + index).show();
                    $('#error_' + index).html("<span class='label label-important label-mini'>抱歉，查询失败</span>");
                    //alert("参数错误");
                } else if (XMLHttpRequest.status == 500) {
                    $('#load_statistics_loading_' + index).hide();
                    $('#error_' + index).show();
                    $('#error_' + index).html("<span class='label label-important label-mini'>抱歉，查询失败</span>");
                    //alert("内部异常");
                } else {
                    $('#load_statistics_loading_' + index).hide();
                    $('#error_' + index).show();
                    $('#error_' + index).html("<span class='label label-important label-mini'>抱歉，查询失败</span>");
                    //alert('url错误');
                }
            }
        });
    }
};


var StructChart = {

    isLocalLog: false, //本地是否有记录需要展示监测项图表
    apiurl: '',

    structId: '',

    setStructId: function (aStructId) {
        this.structId = aStructId;
        structId = aStructId;
    },

    init: function (interfaceUrl, structId) {



        this.setApiurl(interfaceUrl);

        this.setStructId(structId);

        chartEvent.add(this.allChartShow);

        events.add(this.frameShow);

        this.setFactorList(structId);

        setTimeout(function () {
            $('.sensorList').change(function (e) {
                e.preventDefault();

                var value = this.value;
                var index = parseInt(this.id.split('_')[1]);

                sensorListChangeHander(value, index);

            });
        }, 1000);

    },

    setApiurl: function (interfaceUrl) {
        this.apiurl = interfaceUrl;
    },

    setFactorList: function (structId) {


        var url = this.apiurl + '/struct/' + structId + '/factors' + '?token=' + getCookie("token");

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            success: function(data) {
                if (data.length === null || data.length === 0) {
                    //alert('获取监测项失败');
                    $('#structchart').html("<span class='label label-important label-mini'>未获取到监测项</span>");
                    return;
                }

                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].children.length; j++) {
                        //24小时数据曲线不加载浸润线和振动的
                        if (data[i].children[j].factorId != 33 && data[i].children[j].factorId != 34 && data[i].children[j].factorId != 54) {
                            if (data[i].children[j].factorId == 51) {//网壳 应力/应变主题 杆件应变
                                continue;
                            } else {
                                factorList.push({
                                    parentFactorName: data[i].factorName,
                                    factorId: data[i].children[j].factorId,
                                    factorName: data[i].children[j].factorName,
                                    valueNumber: data[i].children[j].valueNumber
                                });
                                break;
                            }
                        };
                    }
                }

                events.fire();

            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.status == 403) {
                    //alert("权限验证出错");
                    logOut();
                } else if (XMLHttpRequest.status == 400) {
                    $('#structchart').html("<span class='label label-important label-mini'>获取监测项失败</span>");
                    //alert("参数错误");
                } else if (XMLHttpRequest.status == 500) {
                    $('#structchart').html("<span class='label label-important label-mini'>获取监测项失败</span>");
                    //alert("内部异常");
                } else {
                    $('#structchart').html("<span class='label label-important label-mini'>获取监测项失败</span>");
                    // alert('url错误');
                }
            }
        });
    },

    frameShow: function () {

        var chartDiv = new StringBuffer();
        for (var i = 0; i < factorList.length; i++) {
            if (i % 2 === 0) {
                chartDiv.append('<div class="row-fluid"><div class="span12">');
            }
            chartDiv.append('<div class="span6"><div class="portlet solid bordered light-grey"><div class="portlet-title">');
            chartDiv.append('<h4><i class="icon-bar-chart"></i>' + factorList[i].parentFactorName + '-' + factorList[i].factorName + '-最近24小时</h4>');
            chartDiv.append('<div class="tools"><div class="btn-group pull-right">');
            chartDiv.append('<select id="sensorList_' + i + '" name="sensorList" class="selectpicker sensorList" data-size="10" title="请选择">');

            //微震监测因素不需要监测项图表
            if (factorList[i].factorId == 56) {
                return;
            }

            if (factorList[i].factorId == 10) {
                var url = apiurl + '/struct/' + structId + '/factor/deep-displace/groups' + '?token=' + getCookie("token");
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    //async: false,
                    success: function(data) {
                        if (data == null || data.length == 0) {
                            // alert('获取传感器列表失败，请重试');
                            return;
                        }
                        for (var index = 0; index < data.length; index++) {
                            var value = [data[index].groupId, data[index].maxDepth];
                            chartDiv.append('<option value=\'' + value + '\'>' + data[index].groupName + '</option>');
                        }

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        if (XMLHttpRequest.status == 403) {
                            //alert("登录已超时，请重新登录");
                            logOut();
                        } else if (XMLHttpRequest.status == 400) {
                            //alert("参数错误");
                        } else if (XMLHttpRequest.status == 500) {
                            //alert("内部异常");
                        } else {
                            //alert('url错误检测项个数');
                        }
                    }
                });
                chartDiv.append('</select></div></div></div>');
                chartDiv.append('<div class="portlet-body" ><div id="load_statistics_loading_' + i + '"><img src="resource/img/loading.gif" alt="loading" /></div>');
                chartDiv.append('<div id="error_' + i + '" class="hide"> <span class="label label-important" >抱歉，最近24小时此测点无数据</span></div>');
                chartDiv.append('<div id="load_statistics_content_' + i + '" class="hide"><div class="span1"></div><div id="chartx_' + i + '" class="chart span4"></div> <div class="span2"></div><div id="charty_' + i + '" class="chart span4"></div><div class="span1"></div></div></div></div></div>');

            }else {
                var url = apiurl + '/struct/' + structId + '/factor/' + factorList[i].factorId + '/sensors' + '?token=' + getCookie("token");
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    //async: false,
                    success: function(data) {

                        if (data == null || data.length == 0 || data[0].sensors.length === 0) {
                            // alert('获取传感器列表失败，请重试');
                            return;
                        }


                        for (var index = 0; index < data.length; index++) {
                            for (var j = 0; j < data[index].sensors.length; j++) {

                                chartDiv.append('<option value="' + data[index].sensors[j].sensorId + '" >' + data[index].sensors[j].location + '</option>');
                            }
                        }

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        if (XMLHttpRequest.status == 403) {
                            //alert("登录已超时，请重新登录");
                            logOut();
                        } else if (XMLHttpRequest.status == 400) {
                            //alert("参数错误");
                        } else if (XMLHttpRequest.status == 500) {
                            //alert("内部异常");
                        } else {
                            //alert('url错误检测项个数');
                        }
                    }
                });

                chartDiv.append('</select></div></div></div>');
                chartDiv.append('<div class="portlet-body" ><div id="load_statistics_loading_' + i + '"><img src="resource/img/loading.gif" alt="loading" /></div>');
                chartDiv.append('<div id="error_' + i + '" class="hide"> <span class="label label-important" >抱歉，最近24小时此测点无数据</span></div>');
                chartDiv.append('<div id="load_statistics_content_' + i + '" class="hide"><div id="chart_' + i + '" class="chart"></div></div></div></div></div>')

            }

           

            if (i % 2 === 1) {
                chartDiv.append('</div></div><div class="clearfix"></div>');
            }

        }
        if (factorList.length % 2 === 1) {
            chartDiv.append('</div></div><div class="clearfix"></div>');
        }

        var content = chartDiv.toString();

        $('#structchart').html(content);
        $('.sensorList').selectpicker();

        chartEvent.fire();

    },

    allChartShow: function () {
        var index = 0;

        while (index < factorList.length) {

            var sensorId = $('#sensorList_' + index).val();
            if (sensorId == undefined) {
                $('#load_statistics_loading_' + index).hide();
                $('#error_' + index).show();
                $('#error_' + index).html("<span class='label label-important label-mini'>获取传感器失败</span>");
                index++;
            } else {
                var startime = new Date();
                startime.setDate(startime.getDate() - 1);

                if (factorList[index].factorId == 10) {

                    var gm = $('#sensorList_' + index + ' :selected').attr('value').split(",");
                    var groupId = gm[0];
                    var maxDepth = gm[1];
                    var url_date_time = apiurl + '/deep-displace/' + groupId + '/data-by-time/xy/' + date2string(startime) + '/' + date2string(new Date()) + '?token=' + getCookie('token');//累计
                    $.ajax({
                        url: url_date_time,
                        type: 'get',
                        dataType: 'json',
                        //async: false,
                        success: function(data) {
                            if (data === null) {
                                alert('查询编号' + sensorId + '传感器数据失败。');
                                index++;
                                return;
                            } else if (data.length === 0 || data[0].values.length === 0) {
                                $('#load_statistics_loading_' + index).hide();
                                $('#load_statistics_content_' + index).hide();
                                $('#error_' + index).show();
                                index++;
                                return;
                            } else {
                                data_depth_time_y = [];
                                data_depth_time_x = [];
                                var i = 0;
                                i = data.length - 1;
                                for (i; i < data.length; i++) {
                                    data_values_y = [];
                                    data_values_x = [];
                                    for (var j = 0; j < data[i].values.length; j++) {
                                        var time = new Date(parseInt(data[i].acquistiontime.substring(6, 19)));
                                        time = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                                        
                                        if (j == 0) {
                                            var value = [parseFloat(maxDepth), 0];
                                            //data_values_y.push(value);
                                            //data_values_x.push(value);
                                        }
                                        if (data[i].values[j].yvalue != null) {
                                            var value_y = [data[i].values[j].depth, data[i].values[j].yvalue];
                                            data_values_y.push(value_y);
                                        }
                                        if (data[i].values[j].xvalue != null) {
                                            var value_x = [data[i].values[j].depth, data[i].values[j].xvalue];
                                            data_values_x.push(value_x);
                                        }
                                    }
                                    data_values_y = [time, data_values_y];
                                    data_values_x = [time, data_values_x];
                                    data_depth_time_y.push(data_values_y);
                                    data_depth_time_x.push(data_values_x);
                                }

                                $('#error_' + index).hide();
                                $('#load_statistics_loading_' + index).hide();
                                $('#load_statistics_content_' + index).show();

                                //document.getElementById('chartx_' + index).style.width = "200px";

                                createLine_leiji({
                                    renderTo: 'chartx_' + index,
                                    titleText: 'x方向',
                                    subtitleText: '累计',
                                    yAxisTitleText: '深度(m)',
                                    seriesList: [
                                        {
                                            dataCollect: data_depth_time_x
                                        }
                                    ]
                                });
                                //document.getElementById('chart_y' + index).style.left = "100px";
                                //document.getElementById('charty_' + index).style.width = "100px";
                                createLine_leiji({
                                    renderTo: 'charty_' + index,
                                    titleText: 'y方向',
                                    subtitleText: '累计',
                                    yAxisTitleText: '深度(m)',
                                    seriesList: [
                                        {
                                            dataCollect: data_depth_time_y
                                        }
                                    ]
                                });


                                index++;
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            if (XMLHttpRequest.status == 403) {
                                //alert("登录已超时，请重新登录");
                                logOut();
                            } else if (XMLHttpRequest.status == 400) {
                                //alert("参数错误");
                            } else if (XMLHttpRequest.status == 500) {
                                //alert("内部异常");
                            } else {
                                //alert('url错误检测项个数');
                            }
                            index++;
                        }
                    });


                } else {

                    var url = apiurl + '/sensor/' + sensorId + '/data/' + date2string(startime) + '/' + date2string(new Date()) + '?token=' + getCookie("token");

                    var chart = chartTemplet;

                    $.ajax({
                        url: url,
                        type: 'get',
                        dataType: 'json',
                        //async: false,
                        success: function(data) {
                            if (data === null) {
                                alert('查询编号' + sensorId + '传感器数据失败。');
                                index++;
                                return;
                            } else if (data.length === 0 || data[0].data.length === 0) {
                                $('#load_statistics_loading_' + index).hide();
                                $('#load_statistics_content_' + index).hide();
                                $('#error_' + index).show();
                                index++;
                                return;
                            }

                            try {
                                chart.series = [];

                                //一个值的情况

                                var isSameUnit = true;

                                var unit = data[0].unit[0];

                                for (var i = 0; i < data[0].unit.length; i++) {
                                    if (unit != data[0].unit[i]) {
                                        isSameUnit = false;
                                    }

                                }

                                //if (isSameUnit) {

                                chart.tooltip.formatter = function() {
                                    var tooltipString = '<b>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '</b>';
                                    for (var i = 0; i < this.points.length; i++) {

                                        tooltipString = tooltipString + '<br/>' + this.points[i].series.name + ':' + this.points[i].y + '<b>' + data[0].unit[i] + '</b>';
                                    }
                                    return tooltipString;
                                };

                                for (var i = 0; i < data[0].unit.length; i++) {

                                    chart.yAxis.title = { text: factorList[index].factorName + '(' + unit + ')' };

                                    var array = new Array();
                                    for (var j = 0; j < data[0].data.length; j++) {
                                        var time = data[0].data[j].acquisitiontime.substring(6, 19);
                                        if (data[0].data[j].value[i] != null) {
                                            array.push([parseInt(time), data[0].data[j].value[i]]);
                                        }
                                    }

                                    chart.series.push({ name: data[0].columns[i], data: array });

                                }


                                if (factorList[index].factorId === 6) {
                                    chart.chart = {
                                        type: 'column',
                                        renderTo: 'chart_' + index,
                                        zoomType: 'x',
                                        resetZoomButton: {
                                            position: {
                                                x: -40,
                                                y: 10
                                            },
                                            relativeTo: 'chart'
                                        }
                                    }
                                } else {
                                    chart.chart = {
                                        type: 'spline',
                                        renderTo: 'chart_' + index,
                                        zoomType: 'x',
                                        resetZoomButton: {
                                            position: {
                                                x: -40,
                                                y: 10
                                            },
                                            relativeTo: 'chart'
                                        }
                                    }
                                }
                                $('#error_' + index).hide();
                                $('#load_statistics_loading_' + index).hide();
                                $('#load_statistics_content_' + index).show();
                                //下面一段不用加！！！
                                if (factorList[index].factorId === 5) {
                                    var doubleAxis = twoAxis(data);
                                    var seriesData = series(data);
                                    var tableValus = seriesData.tableValues;
                                    var columns = data[0].columns;
                                    var unit = data[0].unit;
                                    chart = createHighchartComm1('chart_' + index, '趋势图', doubleAxis, seriesData.dataSeries, factorList[index].factorId);
                                    chart.tooltip.formatter = function () {
                                        var tooltipString = '<b>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '</b>';
                                        tooltipString = tooltipString + '<br/>' + this.series.name + ':' + this.y.toString() + '<b>' + unit[this.series.index] + '</b>';

                                        return tooltipString;
                                    }
                                }
                                var tempchart = new Highcharts.Chart(chart);
                                index++;


                            } catch (err) {
                                index++;
                                alert(err);
                            }

                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            if (XMLHttpRequest.status == 403) {
                                alert("登录已超时，请重新登录");
                                logOut();
                            } else if (XMLHttpRequest.status == 400) {
                                $('#load_statistics_loading_' + index).hide();
                                $('#error_' + index).show();
                                $('#error_' + index).html("<span class='label label-important label-mini'>查询数据失败</span>");
                                index++;
                                //alert("参数错误");
                            } else if (XMLHttpRequest.status == 500) {
                                $('#load_statistics_loading_' + index).hide();
                                $('#error_' + index).show();
                                $('#error_' + index).html("<span class='label label-important label-mini'>查询数据失败</span>");
                                index++;
                                //alert("内部异常");
                            } else {
                                $('#load_statistics_loading_' + index).hide();
                                $('#error_' + index).show();
                                $('#error_' + index).html("<span class='label label-important label-mini'>查询数据失败</span>");
                                index++;
                                //alert('url错误图形数据 ');
                            }
                        }
                    });
                }





            }


        }
    }

}


function internalDisplacement(index, startime) {
    var gm = $('#sensorList_' + index + ' :selected').attr('value').split(",");
    var groupId = gm[0];
    var maxDepth = gm[1];
    var url_date_time = apiurl + '/deep-displace/' + groupId + '/data-by-time/xy/' + date2string(startime) + '/' + date2string(new Date()) + '?token=' + getCookie('token');//累计
    $.ajax({
        url: url_date_time,
        type: 'get',
        dataType: 'json',
        //async: false,
        success: function(data) {
            if (data === null) {
                alert('查询编号' + sensorId + '传感器数据失败。');
                return;
            } else if (data.length === 0 || data[0].values.length === 0) {
                $('#load_statistics_loading_' + index).hide();
                $('#load_statistics_content_' + index).hide();
                $('#error_' + index).show();
                return;
            } else {
                data_depth_time_y = [];
                data_depth_time_x = [];
                var i = 0;
                i = data.length - 1;
                for (i; i < data.length; i++) {
                    data_values_y = [];
                    data_values_x = [];
                    for (var j = 0; j < data[i].values.length; j++) {
                        var time = new Date(parseInt(data[i].acquistiontime.substring(6, 19)));
                        time = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
                        
                        if (j == 0) {
                            var value = [parseFloat(maxDepth), 0];
                            //data_values_y.push(value);
                            //data_values_x.push(value);
                        }
                        
                        if (data[i].values[j].yvalue != null) {
                            var value_y = [data[i].values[j].depth, data[i].values[j].yvalue];
                            data_values_y.push(value_y);
                        }
                        if (data[i].values[j].xvalue != null) {
                            var value_x = [data[i].values[j].depth, data[i].values[j].xvalue];
                            data_values_x.push(value_x);
                        }
                    }
                    data_values_y = [time, data_values_y];
                    data_values_x = [time, data_values_x];
                    data_depth_time_y.push(data_values_y);
                    data_depth_time_x.push(data_values_x);
                }

                $('#error_' + index).hide();
                $('#load_statistics_loading_' + index).hide();
                $('#load_statistics_content_' + index).show();

                //document.getElementById('chartx_' + index).style.width = "200px";

                createLine_leiji({
                    renderTo: 'chartx_' + index,
                    titleText: 'x方向',
                    subtitleText: '累计',
                    yAxisTitleText: '深度(m)',
                    seriesList: [
                        {
                            dataCollect: data_depth_time_x
                        }
                    ]
                });
                //document.getElementById('chart_y' + index).style.left = "100px";
                //document.getElementById('charty_' + index).style.width = "100px";
                createLine_leiji({
                    renderTo: 'charty_' + index,
                    titleText: 'y方向',
                    subtitleText: '累计',
                    yAxisTitleText: '深度(m)',
                    seriesList: [
                        {
                            dataCollect: data_depth_time_y
                        }
                    ]
                });

            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 403) {
                //alert("登录已超时，请重新登录");
                logOut();
            } else if (XMLHttpRequest.status == 400) {
                //alert("参数错误");
            } else if (XMLHttpRequest.status == 500) {
                //alert("内部异常");
            } else {
                //alert('url错误检测项个数');
            }
        }
    });


}

function createLine_leiji(parameters) {

    var chartObj = {
        chart: {
            renderTo: parameters.renderTo,
            type: 'spline',
            inverted: true//可选，控制显示方式，默认上下正向显示  
        },
        credits: {
            enabled: false,
        //    href: 'http://www.free-sun.com.cn',
        //    text: '江西飞尚科技有限公司'
        },
        title: {
            text: parameters.titleText,
            style: {
                color: '#339900',
                fontWeight: 'bold'
            }
        },
        subtitle: {
            style: {
                color: '#339900',
                fontWeight: 'bold'
            }
        },
        yAxis: {
            gridLineWidth: 0,
            title: {
                text: '位移(mm)'
            }
        },
        xAxis: {
            reversed: false,
            gridLineWidth: 1,
            title: {
                text: '深度(m)'
            }
        },
        tooltip: {
            formatter: function () {
                var tooltipString = '<b>' + this.series.name + '</b>';
                tooltipString = tooltipString + '<br/><br/>位移:' + this.y + ' mm';
                tooltipString = tooltipString + '<br/>' + '深度:' + this.x + ' m';
                return tooltipString;
            }
        },
        legend: {
            layout: 'vertical',
            align: 'top',
            verticalAlign: 'middle',
            borderWidth: 0,
            floating: true,
            x: 50
        }
    };

    chartObj.series = [];
    var datalist = parameters.seriesList[0].dataCollect;
    for (var index = 0; index < datalist.length; index++) {
        chartObj.series.push({
            name: datalist[index][0],
            data: datalist[index][1],
            marker: {
                enabled: true
            }
        });
    }
    var highLine = new Highcharts.Chart(chartObj);
}