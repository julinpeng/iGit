
$(function() {
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
        }
    });
});


function createHighchartCommHistor(renderTo, title, seriesData, factorIdSend) {
    var template = {
        chart: {
            type: 'spline',
            renderTo: renderTo,
            zoomType: 'x'
        },
        title: {
            text: title,
            x: -20 //center
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                minute: '%H:%M:%S',
                day: '%Y-%m-%d',
                month: '%b %y',
            },
            labels: { rotation: -25, align: 'right', style: { font: 'normal 13px Verdana, sans-serif' } }
        },
        yAxis: {
            title: {},
            plotLines: [{
                value: 0,
                width: 2,
                dashStyle: 'Dash',
                zIndex: 5,
                color: '#808080'
            }]
        },
        exporting: MaximizeChart.getHighChartsExporting(),
        credits: {
            enabled: false
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

            }
        },
        spline: {
            lineWidth: 1.5,
            states: {
                hover: {
                    lineWidth: 2.5
                }
            },
            marker: {
                enabled: false
            }
        },
        tooltip: {
            crosshairs: true
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0

        },
        series: seriesData
    };

    return template;
}

//多时段
function createHighchartComm1(renderTo, title, seriesData, factorIdSend) {
    var template = {
        chart: {
            type: 'spline',
            renderTo: renderTo,
            zoomType: 'x',
            resetZoomButton: {
                position: {
                    x: -40,
                    y: 10
                },
                relativeTo: 'chart'
            }
        },
        title: {
            text: title,
            x: -20 //center
        },
        xAxis: {
            labels: { rotation: -25, align: 'right', style: { font: 'normal 13px Verdana, sans-serif' } }
        },
        yAxis: {
            title: {},
            plotLines: [{
                value: 0,
                width: 2,
                dashStyle: 'Dash',
                zIndex: 5,
                color: '#808080'
            }]
        },
        exporting: MaximizeChart.getHighChartsExporting(),
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

            }
        },
        spline: {
            lineWidth: 1.5,
            states: {
                hover: {
                    lineWidth: 2.5
                }
            },
            marker: {
                enabled: false
            }
            //pointInterval: 3600000, // one hour
            //pointStart: Date.UTC(2013, 9, 27, 0, 0, 0)
        },
        tooltip: {
            //shared: true,
            crosshairs: true
            //enabled: false
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
            
        },
        series: seriesData
    };

    return template;
}
//单时段　
function createHighchartComm2(renderTo, title, seriesData, factorIdSend) {
    var template = {
        
        chart: {
            type: 'spline',
            renderTo: renderTo,
            zoomType: 'x',
            resetZoomButton: {
                position: {
                    x: -40,
                    y: 10
                },
                relativeTo: 'chart'
            }
        },
        title: {
            text: title,
            x: -20 //center
        },
        //subtitle: {
        //    text: '来源：江西飞尚科技有限公司',
        //    x: -20
        //},
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
            title: {},
            plotLines: [{
                value: 0,
                width: 2,
                dashStyle: 'Dash',
                zIndex: 5
            }]
        },
        exporting: MaximizeChart.getHighChartsExporting(),
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

            }
        },
        spline: {
            lineWidth: 1.5,
            states: {
                hover: {
                    lineWidth: 2.5
                }
            },
            marker: {
                enabled: false
            }
            //pointInterval: 3600000, // one hour
            //pointStart: Date.UTC(2013, 9, 27, 0, 0, 0)
        },
        tooltip: {
            //shared: true,
            crosshairs: true
            //enabled: false
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            //itemStyle: {
            //    fontSize:'15px'
            //}

        },
        series: seriesData
    };

    return template;
}



