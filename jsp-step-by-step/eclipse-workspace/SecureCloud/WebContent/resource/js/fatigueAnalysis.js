//highcharts变量
var line_chart = "";
var globalChart;
var fatigueBatchData = {};
var oldWidth = "";
var orgString = "无可疲劳分析的组织";
var structString = "无可疲劳分析的结构物";
var sensorString = "无可疲劳分析的传感器";
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
            exportButtonTitle: "导出图片"
        }
    });
    //默认最新时间
    $("#dpform").val(showDateText(0)); //时间控件
    $("#dpform1").datetimepicker({
        format: "yyyy-MM-dd",
        language: "pt-BR"
    });
    var id = "analyLine_error";
    errorTip(id);
    //当浏览器窗口大小改变时，设置显示内容的高度  
    window.onresize = function () {
        //if (oldWidth != $("#analyColumn").width()) {
        //    var w = 0;
        //    if (maxVal != 0) {
        //        w = ($("#analyColumn").width() - 100) / maxVal * min;
        //    }
        //    if (w == 0 || w >= 50) {
        //        w = 50;
        //    }
        //    chartsColumn.plotOptions.column.pointWidth = w;
        //    var charts = new Highcharts.Chart(chartsColumn);
        //    oldWidth = $("#analyColumn").width();
        //}
    }
});
function showDateText(n) {
    var uom = new Date();
    uom.setDate(uom.getDate() + n);
    uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate();
    return uom.replace(/\b(\w)\b/g, "0$1"); //时间的格式
}
function errorTip(stringId) {
    var graphId = stringId.split(',');
    var errorTipstring = '<div id=\'error\' class=\'row-fluid dataerror-tip\'>' +
        '<div class="span12">' +
        '<span style=\'margin-left: 5px;margin-top: 10px;\'>抱歉，没有查询到任何有效的数据</span>' +
        '</div>' +
        '</div>';
    for (var i = 0; i < graphId.length; i++) {
        $('#' + graphId[i]).append(errorTipstring);
    }
}
function display(isShow) {
    if (isShow === "block") {
        $("#analyLine_error").show();
        $("#analyLine").hide();
        $("#DState").hide();
        $("#analyColumn").hide();
        $("#analyTable").hide();
    }
    else {
        $("#analyLine_error").hide();
        $("#analyLine").show();
        $("#DState").show();
        $("#analyColumn").show();
        $("#analyTable").show();
    }
}

function selectListFilter(id,options) {
    $('#'+id).removeClass('chzn-done');
    $('#' + id + '_chzn').remove();
    $('#' + id).html(options);
    $('#' + id).trigger("liszt:updated");
    // 筛选框,必须！
    $('#' + id).chosen({
        no_results_text: "没有找到",
        allow_single_de: true
    });
}
$("#btnQuery").unbind("click").click(function () {
    var sensor = $('#sensorList').find('option:selected')[0].id;
    if (sensor === "") {
        alert("无可疲劳分析的传感器");
        return;
    }
    var sensorId = parseInt(sensor.split('sensor-')[1]);
    var dpformTime = $('#dpform').val();
    showChartTable(sensorId, dpformTime);
});

function showChartTable(sensorId, dpformTime) {
    if (dpformTime === "") {
        $('#dpform').focus();
        return;
    } 
    var url = apiurl + '/sensor/' + sensorId + '/' + dpformTime + '/fatigue-damage?token=' + getCookie('token');
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            if (data == null || data.length === 0) {
                display("block");
                return;
            }
            display("none");
            line_chart = createHighchartLine('analyLine',data[0].location + '疲劳趋势图');
            var arrayDamage = new Array();
            var arrayLife = new Array();
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].info.length; j++) {
                    var time = data[i].info[j].acqTime.substring(6, 19);
                    var batch = data[i].info[j].batch;
                    arrayDamage.push({ x: parseInt(time), y: data[i].info[j].fatigueDamage, id: batch });
                    arrayLife.push({ x: parseInt(time), y: data[i].info[j].fatigueLife, id: batch });
                    fatigueBatchData["batch-" + batch] = data[i].info[j].data;
                }
            }
            line_chart.series.push({
                name: '疲劳寿命Y(年)',
                color: '#4572A7',
                type: 'spline',
                yAxis: 1,
                data: arrayLife
            });
            line_chart.series.push({
                name: '疲劳损伤指数D',
                color: '#89A54E',
                type: 'spline',
                yAxis: 0,
                data: arrayDamage
            });
            globalChart = new Highcharts.Chart(line_chart);
            var len = data[0].info.length - 1;
            var acqtime = data[0].info[len].acqTime.substring(6, 19);
            var dtime = new Date();
            dtime.setTime(acqtime);
            var normalizedMonth = dtime.getMonth() + 1 < 10 ? "0" + (dtime.getMonth() + 1) : dtime.getMonth() + 1;
            var day = dtime.getDate();
            if (day < 10) {
                day = "0" + day;
            }
            acqtime = dtime.getFullYear() + '-' + normalizedMonth + '-' + day;
            createHighcharColumnTable(data[0].info[len].batch, acqtime);
        },
        error: function (xmlHttpRequest) {
            if (xmlHttpRequest.status === 403) {
                alert("登录超时,请重新登录");
                logOut();
            } else if (xmlHttpRequest.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                alert("获取疲劳数据时发生异常.\r\n" + xmlHttpRequest.status + " : " + xmlHttpRequest.statusText);
            }
        }
    });
}
function createHighchartLine(renderTo, title) {
    var template = {
        chart: {
            renderTo: renderTo,
            zoomType: 'xy'
        },
        title: {
            text: title
        },
        credits: { enabled: false },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%Y-%m-%d',
                month: '%Y-%m-%d',
                year: '%Y-%m-%d'
            }
        },
        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function () {
                            createHighcharColumnTable(this.id, Highcharts.dateFormat('%Y-%m-%d', this.x));
                        }
                    }
                }
            }
        },
        yAxis: [
            {
// Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: '#89A54E'
                    }
                },
                title: {
                    text: '疲劳损伤指数D',
                    style: {
                        color: '#89A54E'
                    }
                }
            }, {
// Secondary yAxis
                title: {
                    text: '疲劳寿命Y',
                    style: {
                        color: '#4572A7'
                    }
                },
                labels: {
                    format: '{value} 年',
                    style: {
                        color: '#4572A7'
                    }
                },
                opposite: true
            }
        ],
        tooltip: {
            xDateFormat: '%Y-%m-%d',
            shared: true,
            useHTML: true, //是否使用HTML编辑提示信息
            borderRadius: 3,
            //backgroundColor: 'none',
            headerFormat: '<b>采集时间:{point.key}</b><table>',
            pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                '<td style="text-align: left"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shadow: false,
            crosshairs: {
                width: 2,
                color: 'gray',
                dashStyle: 'shortdot'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            x:-50,
            verticalAlign: 'top',
            y: 100,
            floating: true,
            backgroundColor: '#FFFFFF'
        },
        series: [
        
        ]
    }
    return template;
}
var maxVal = 0;
var min = 0;
var chartsColumn = "";
function createHighcharColumnTable(batch, t) {
    var data = fatigueBatchData["batch-" + batch];
    var frequencyArray = new Array();
    var averageStressArray = [];
    var array = [];
    var data_table_values = []; //清空列表
    for (var i = 0; i < data.length; i++) {
        var fVal = data[i].frequency;
        var sVal = data[i].averageStress;
        var pVal = data[i].probability;
        var fdVal = data[i].fatigueDamage;
        var flVal = data[i].fatigueLife;
        frequencyArray.push(fVal);
        averageStressArray.push(sVal);
        array.push([sVal, fVal]);

        var valueTable = [i + 1, sVal, fVal, pVal, flVal, fdVal];
        data_table_values.push(valueTable);
    }
    maxVal = Math.max.apply(null, averageStressArray);
    var avgSort = averageStressArray.sort(function (a, b) { return a > b ? 1 : -1 });;
    
    for (var k = 1; k < avgSort.length ; k++) {
        var tmp = Math.abs(avgSort[k - 1]- avgSort[k]);
        if (k == 1) {
            min = tmp;
            continue;
        }
        if (!tmp) {
            min = 0;
            break;
        }
        if (tmp < min) min = tmp;
    }
    oldWidth = $("#analyColumn").width();
    var w = 0;
    if (maxVal != 0) {
        w = ($("#analyColumn").width() - 100) / maxVal * min;
    }
    if (w == 0 || w >= 50) {
        w = 50;
    }
    chartsColumn = analy_HighcharColumn(t, array, w);
    var charts = new Highcharts.Chart(chartsColumn);
    var header = [];
    header.push("序号");
    header.push("平均应力幅");
    header.push("频次");
    header.push("实际概率(%)");
    header.push("S-N对应寿命");
    header.push("实际统计损伤度");
    $("#analyTable").html("");
    analy_Datatable('analyTable', data_table_values, header);
}
function analy_HighcharColumn(t, array, w) {
    var chartsColumn= {
        chart: {
            renderTo: "analyColumn",
            type: 'column'
        },
        title: {
            text: t + ' 雨流法计数结果'
        },
        credits: { enabled: false },
        xAxis: {
            min: 0,
            //max: 100,
            //tickInterval: 1,
            //tickPixelInterval:5,
            //categories: averageStressArray,
            title: {
                text: '平均应力幅(MPa)'
            }
        },
        yAxis: {
            type: 'logarithmic',
            title: {
                text: '频次(取对数)'
            }
        },
        tooltip: {
            formatter: function () {
                return '频次:<b>' + this.y + '</b><br/>平均应力幅(MPa):<b>' + this.x + '</b>';
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0,
                borderWidth: 0,
                //pointWidth: w
            }
        },
        series: [
            {
                name: '平均应力幅-频次',
                data: array
            }
        ]
    }
    return chartsColumn;
}
function analy_Datatable(domId, data, columns) {
    $('#' + domId).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' + domId + '_table" style="padding: 10px;"></table>');

    var c = new Array();
    for (var i = 0; i < columns.length; i++) {
        c.push({ "title": columns[i] });
    }
    $('#' + domId + '_table').dataTable({
        "data": data,
        "columns": c,
        "sDom": 'T<"clear">lfrtip',
        "iDisplayLength": 50, //每页显示个数 
        "bScrollCollapse": true,
        "bLengthChange": true, //每页显示的记录数 
        "bPaginate": true, //是否显示分页
        "bFilter": true, //搜索栏
        "bSort": true, //是否支持排序功能
        "bInfo": true, //显示表格信息
        "bAutoWidth": false, //自适应宽度
        "bStateSave": false, //保存状态到cookie *************** 很重要，当搜索的时候页面一刷新会导致搜索的消失。使用这个属性就可避免了

        "sPaginationType": "full_numbers",
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aaSorting": [[0, "asc"]],
        "bDestroy": true,
        "oTableTools": {
            "sSwfPath": "/resource/library/tableTools/swf/copy_csv_xls_pdf.swf",
            "aButtons": [
                {
                    "sExtends": "xls",
                    "sButtonText": "导出到Excel",
                    "sFileName": "*.xls"
                }
            ]
        }
    });
    var stag = $('.data-table-content');
    if (!stag.is(':visible')) {
        stag.show();
    }
}



