/*
//-----------------common.js为通用函数js文件-----------------//
*/



//获取json时间的毫秒数
function GetMilliseconds(jsonDate){
    jsonDate = jsonDate.replace("/Date(", "").replace(")/", "");
    if (jsonDate.indexOf("+") > 0) {
        jsonDate = jsonDate.substring(0, jsonDate.indexOf("+"));
    }
    else if (jsonDate.indexOf("-") > 0) {
        jsonDate = jsonDate.substring(0, jsonDate.indexOf("-"));
    }
    var milliseconds = parseInt(jsonDate, 10);
    return milliseconds;
}

//将json时间的毫秒数转换为“yyyy-MM-dd hh:mm:ss”字符串格式
function MillisecondsToDateTime(milliseconds) {
    var date = new Date(milliseconds);
    //转换成标准的“月：MM”
    var normalizedMonth = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;

    var date_time = date.getFullYear() + "-" + normalizedMonth + "-" + normalizeTimeFormat(date.getDate())
                    + " " + normalizeTimeFormat(date.getHours()) + ":" + normalizeTimeFormat(date.getMinutes()) + ":" + normalizeTimeFormat(date.getSeconds());
    return date_time;
}

/**
 * 函数功能：将json时间的毫秒数转换为“yyyy-MM-dd hh:mm:ss.SSS”字符串格式
 */
function convertMillisecondsToDateTime_milliseconds(milliseconds) {
    var date = new Date(milliseconds);
    //转换成标准的“月：MM”
    var normalizedMonth = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;

    var date_time = date.getFullYear() + "-" + normalizedMonth + "-" + normalizeTimeFormat(date.getDate())
                    + " " + normalizeTimeFormat(date.getHours()) + ":" + normalizeTimeFormat(date.getMinutes())
                    + ":" + normalizeTimeFormat(date.getSeconds()) + "." + date.getMilliseconds();
    return date_time;
}

//将json时间转换为“yyyy-MM-dd hh:mm:ss”字符串格式
function JsonToDateTime(jsonDate) {
    jsonDate = jsonDate.replace("/Date(", "").replace(")/", "");
    if (jsonDate.indexOf("+") > 0) {
        jsonDate = jsonDate.substring(0, jsonDate.indexOf("+"));
    }
    else if (jsonDate.indexOf("-") > 0) {
        jsonDate = jsonDate.substring(0, jsonDate.indexOf("-"));
    }

    var date = new Date(parseInt(jsonDate, 10));
    //转换成标准的“月：MM”
    var normalizedMonth = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;

    var date_time = date.getFullYear() + "-" + normalizedMonth + "-" + normalizeTimeFormat(date.getDate())
                    + " " + normalizeTimeFormat(date.getHours()) + ":" + normalizeTimeFormat(date.getMinutes()) + ":" + normalizeTimeFormat(date.getSeconds());
    return date_time;
}

function nowDateInterval(milliseconds) {
    var nowtime = new Date();

    var diff = (nowtime.valueOf() - milliseconds) / (1000 * 3600);
    var hours = parseInt(diff, 10);
    if (hours < 24) {
        return '近一天';
    } else {
        var dateCount = hours / 24;
        if (dateCount < 7) {
            return '近一周';
        } else if(dateCount<30){
            return '近一月';
        } else if (dateCount < 90) {
            return '近三个月';
        } else {
            return '三个月前';
        }
    }
}

//标准化时间格式
function normalizeTimeFormat(time) {
    if (time < 10) {
        time = "0" + time;
    }
    return time;
}

function date2string(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}

//深拷贝
function clone(myObj) {
    //传入参数必须对对象才能实现clone出新对象  
    if (typeof (myObj) != 'object' || myObj == null) return myObj;
    var newObj = new Object();
    for (var i in myObj) {
        newObj[i] = clone(myObj[i]);//对于对象中含有对象情况使用递归调用。  
    }
    return newObj;
}