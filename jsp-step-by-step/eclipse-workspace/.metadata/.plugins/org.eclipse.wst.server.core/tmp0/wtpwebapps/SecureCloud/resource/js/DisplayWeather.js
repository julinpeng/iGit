
//获取天气--找到对应的经纬度
function getNowWeather(station) {
    if (station == null || station.length == 0) {
        $('#displayWeather').hide();
        return;
    }
    var location = station;
    var url = "http://api.map.baidu.com/telematics/v3/weather?location=" + location + "&output=json&ak=wEiighBCdHAkOrXRHDsqlgW5";
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'jsonp',//解决跨域问题
        success: function (data) {
            displayWeather(data);
        },

    });
}

function displayWeather(data) {
    if (data.status != "success") {
        $('#displayWeather').hide();
        return;
    }
    $('#displayWeather').show();
    var weather = data.results[0].weather_data[0];
    var time = new Date();
    var scr = time.getHours() >= 18 ? weather.nightPictureUrl : weather.dayPictureUrl;
    var sb = '<div><table><tr><td>' + data.results[0].currentCity + '</td></tr><tr>' +
        '<td><img src = "' + scr + '"></td></tr>' +
        '<tr><td>' + weather.weather + '</td></tr>' +
        '<tr><td>' + weather.wind + '</td></tr>' +
        '<tr><td>' + weather.temperature + '</td></tr></table></div>';
    $('#displayWeather').html("");
    $('#displayWeather').html(sb);
}