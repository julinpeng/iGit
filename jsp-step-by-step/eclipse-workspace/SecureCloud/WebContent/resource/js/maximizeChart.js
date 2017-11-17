var MaximizeChart = function() {
    var origChartWidth = 400,
                origChartHeight = 300,
                chartWidth = 400,
                chartHeight = 300,
                resizeChart,
                yAxisFlattening = false,
                isDeepDisplacement = false;

    var init = function () {
        $('#maxChartModal').modal('hide');

        $('#btnLarger').click(function () {
            chartWidth *= 1.1;
            chartHeight *= 1.1;
            resizeChart.setSize(chartWidth, chartHeight);
        });

        $('#btnSmaller').click(function () {
            chartWidth *= 0.9;
            chartHeight *= 0.9;
            resizeChart.setSize(chartWidth, chartHeight);
        });

        $('#btnNormal').click(function () {
            chartWidth = isDeepDisplacement ? origChartHeight / 3 : origChartWidth;
            chartHeight = origChartHeight;
            resizeChart.setSize(chartWidth * 0.9, chartHeight * 0.9);
        });
    };

    // HighCharts exporting buttons 最大化按钮的点击事件处理函数
    var maximizeChart = function (highChart) {
        var parentWindow = window;

        if (window.parent.frames.length > 0) {
            parentWindow = window.parent;
            if (window.parent.document.getElementById('maxChartModal') == null) {
                parentWindow = window.parent.parent;
            }
        }

        if (arguments.length > 0) {
            parentWindow.document.getElementById('windContainer').innerHTML = '<table id="freq" border="0" cellspacing="0" cellpadding="0">' + arguments[1] + '</table>';
        }

        parentWindow.showMaximizeChart(highChart); 
    };

    var showChart = function (highChart) {
        origChartWidth = $(window).width() * 0.8;
        origChartHeight = $(window).height() * 0.8;

        if (highChart.title !== undefined && highChart.title.text.indexOf('累计位移') > 0) {
            isDeepDisplacement = true;
            chartWidth = origChartWidth / 3;
            chartHeight = origChartHeight;
        } else {
            isDeepDisplacement = false;
            chartWidth = origChartWidth;
            chartHeight = origChartHeight;
        }

        var myOptions = $.extend(true, {}, highChart.options);
        myOptions.chart.height = chartHeight * 0.9;
        myOptions.chart.width = chartWidth * 0.9;
        myOptions.chart.renderTo = 'maxChartContainer';
        myOptions.exporting.buttons = {};

        var max = myOptions.yAxis[0].max;
        var min = myOptions.yAxis[0].min;

        if (yAxisFlattening && max) {
            myOptions.chart.events = {
                selection: function(event) {
                    if (event.xAxis) {
                        resizeChart.yAxis[0].update({
                            max: null,
                            min: null
                        });
                    } else {
                        var diff = max - min;
                        var total = diff * 4;
                        var half = total / 2;
                        resizeChart.yAxis[0].update({
                            max: max + half,
                            min: min - half
                        });
                    }
                }
            };
        }

        resizeChart = new Highcharts.Chart(myOptions);

        $('#maxChartModal').modal('show').find('.modal-body').css({
            height: origChartHeight - 100
        });

        $('#maxChartModal').modal('show').css({
            width: origChartWidth,
            height: origChartHeight,
            'margin-left': function() {
                return -($(this).width() / 2);
            },
            'margin-top': function() {
                return -($(this).height() / 2) * 0.1;
            },
        });

    };

    var deepDisplacementShow = function () {
        origChartWidth = $(window).width() * 0.8;
        origChartHeight = $(window).height() * 0.8;
        chartWidth = origChartWidth;
        chartHeight = origChartWidth / 3;


    }

    return {
        init: init,
        show: showChart,
        maximize: maximizeChart,
        setYAxisFlattening:function(flattening) {
            yAxisFlattening = flattening;
        },
        getHighChartsExporting:function() {
            return {
                url: 'HighchartsExport.axd',
                width: 1200,
                buttons: {
                    contextButton: {
                        menuItems: [
                                {
                                    text: '最大化',
                                    onclick: function () {
                                        MaximizeChart.maximize(this);
                                    }
                                }, {
                                    separator: true
                                }
                        ]
                            .concat(Highcharts.getOptions().exporting.buttons.contextButton.menuItems)
                    } //contextButton 
                } //buttons
            }
        }
    }

}();




