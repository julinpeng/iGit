//初始化
var g_data;
var g_dom;
var g_selectIndex;//可以为空
var g_width;
var g_left;
var g_windowWidth;

function initSelect(data, dom, selectIndex, width,left) {
    g_data = data;
    g_dom = $(dom);
    //代码里面做一些异常保护：
    if (data == null) {
        if (selectIndex instanceof Array) {
            if (selectIndex.length != 4) {
                alert("传入的参数不符合要求！");
                return;
            }
            g_width = selectIndex[2];
            g_left = selectIndex[3];
            g_selectIndex = -1;
            OptimizedJrxSelect(selectIndex,width);
        } else {
            HasNonSensor(selectIndex, width);
        }
    } else if (selectIndex instanceof Array) {
        if (selectIndex.length != 4) {
            alert("传入的参数不符合要求！");
            return;
        }
        g_width = selectIndex[0];
        g_left = selectIndex[1];
        g_selectIndex = -1;
        GetCorrent0rContrastSelect(data, selectIndex[2], selectIndex[3],width);

    } else {
        g_selectIndex = selectIndex;
        g_width = width;
        g_left = left;
        GetSelectOption(data);

    }
}




function GetCorrent0rContrastSelect(data, factorId,valuenumber, indenty) {
    
    if (indenty == 0) {
        GetDataContrastAndCorrentSensor(data, valuenumber, factorId);
    } else {
        GetCorrentOptions(data, valuenumber, factorId);
    }
}



//判断data结构
function GetSelectOption(data) {
    if (data[0] instanceof Array) {
        ResourseIsArray(data);
    } else {
        ResourseIsObject(data);
    }
}


//data[0]是数组，数据源符合设计方案6.4.3 3）
function ResourseIsArray(data) {
    var option = '';
    var tmpSensorId;
    var isInArray = 0;
    var allSize = [];
    var count = data.length;
    var firstSensorId = data[0][0];
    for (var i = 0; i < count; i++) {
        tmpSensorId = data[i][0];
        var location = data[i][1];
        option += '<option value=\'' + tmpSensorId + '\'>' + location + '</option>';
        allSize.push(location.length);
        if (tmpSensorId == g_selectIndex) isInArray = 1;
    }
    var maxSize = Math.max.apply(null, allSize);
    g_dom.html(option);
    var a = isInArray ? g_selectIndex : firstSensorId;
    var widths = CalcWidth(maxSize, count);
    OptimizedSelect( a, widths);
}


//data[0]是对象
function ResourseIsObject(data) {
    var group = data[0].groupId == 0 ? 1 : data[0].groupId;
    var groupId = !(group);
    var sensors = !(data[0].sensors);
    var sensorId = !(data[0].sensorId);
    if (!groupId) {
        SelectByGroup(data);
    }
    if (!sensors) {
        SelectBySensors(data);
    }

    if (!sensorId) {
        SelectBySensor(data);
    }
}



//按组展示，数据源符合设计方案6.4.3 1）
function SelectByGroup(data) {
    var option = '';
    var allSize = [];
    var count = 0;
    var firstItem = true;
    for (var i = 0; i < data.length; i++) {
        var groupId = data[i].groupId;
        var groupName = data[i].groupName;//利用组名字
        var index;
        var products = data[i].products;
        var location;
        var sensorList;
        if (groupId!=0) {
            option += '<optgroup label="'+ groupName + '" value="' + groupId + '">';
            for (index = 0; index < products.length; index++) {
                sensorList = products[index].sensors;
                count += sensorList.length;
                for (var n = 0; n < sensorList.length; n++) {
                    g_sensorProductType[sensorList[n].sensorId] = products[index].sensorType;
                    location = sensorList[n].location;
                    if (firstItem) {
                        option += '<option value="' + groupId + '-' + sensorList[n].sensorId + '"' + 'selected="selected" >' + location + '</option>';
                    } else {
                        option += '<option value="' + groupId + '-' + sensorList[n].sensorId + '">' + location + '</option>';
                    }
                    allSize.push(location.length);
                }
            }
            firstItem = false;
            option += '</optgroup>';
        } else {
            for (index = 0; index < products.length; index++) {
                sensorList = products[index].sensors;
                count += sensorList.length;
                var sensorType = products[index].sensorType;
                option += '<optgroup label="' + sensorType + '" value="' + sensorType + '">';
                for (var j = 0; j < sensorList.length; j++) {
                    g_sensorProductType[sensorList[j].sensorId] = products[index].sensorType;
                    location = sensorList[j].location;
                    if (firstItem) {
                        option += '<option value="' + sensorType + '-' + sensorList[j].sensorId + '"' + 'selected="selected" >' + location + '</option>';
                        firstItem = false;
                    } else {
                        option += '<option value="' + sensorType + '-' + sensorList[j].sensorId + '">' + location + '</option>';
                    }
                    
                    allSize.push(location.length);
                }
                option += '</optgroup>';
                
            }
        }
    }
   g_dom.html(option);
    var maxSize = Math.max.apply(null, allSize);
    var widths = CalcWidth(maxSize, count,1);
    ByGroupSelectTemplates(widths);
    

}


//数据源符合设计方案6.4.3 2）
function SelectBySensors(data) {
    var option = '';
    var tmpSensorId;
    var isInArray = 0;
    var allSize = [];
    var count = 0;
    var firstSensorId = data[0].sensors[0].sensorId;
    for (var i = 0; i < data.length; i++) {
        var sensorList = data[i].sensors;
        var length = data[i].sensors.length;
        count += length;
        for (var index = 0; index < length; index++) {
            tmpSensorId = sensorList[index].sensorId;
            var location = sensorList[index].location;
            option += '<option value=\'' + tmpSensorId + '\'>' + location + '</option>';
            allSize.push(location.length);
            if (tmpSensorId == g_selectIndex) isInArray = 1;
        }
    }
    var maxSize = Math.max.apply(null, allSize);
    g_dom.html(option);
    var a= isInArray ? g_selectIndex : firstSensorId;
    var widths = CalcWidth(maxSize, count);
    OptimizedSelect(a, widths);
}


//数据源符合设计方案6.4.3 4）
function SelectBySensor(sensors) {
    var option = '';
    var tmpSensorId;
    var isInArray = 0;
    var allSize = [];
    var count = sensors.length;
    var firstSensorId = sensors[0].sensorId;
    for (var i = 0; i < count; i++) {
         tmpSensorId = sensors[i].sensorId;
        var location = sensors[i].location;
        option += '<option value=\'' + tmpSensorId + '\'>' + location + '</option>';
        allSize.push(location.length);
        if (tmpSensorId == g_selectIndex) isInArray = 1;
    }
    var maxSize = Math.max.apply(null, allSize);
    g_dom.html(option);
    var a = isInArray ? g_selectIndex : firstSensorId;
    var widths = CalcWidth(maxSize, count);
    OptimizedSelect(a, widths);
}



function OptimizedSelect(a, widths) {
    g_dom.multiselect('destroy');//清除上次的样式
    var minWidth = g_width + 10;
    var a1 = parseInt(widths[1]) < minWidth ? minWidth : parseInt(widths[1]);
    var b = parseInt(widths[0]);
    var width = [b, a1, widths[2]];
    var data = Settemplates(width);
    g_dom.multiselect({
        templates: data,
        enableFiltering: true,
        includeSelectAllOption: true,
        buttonWidth: g_width+'px',
        nonSelectedText: '请选择',
        selectAllText: '全选',
        allSelectedText: '已选择全部',
        nSelectedText: '已选择',
        info:'处',
        maxHeight: 350,
    });
    g_dom.multiselect('select', a, true);
    g_dom.multiselect('rebuild');
}


function ByGroupSelectTemplates(widths) {
    g_dom.multiselect('destroy');
    var minWidth = g_width + 10;
    var a = parseInt(widths[1]) < minWidth ? minWidth : parseInt(widths[1]);
    var b = parseInt(widths[0]);
    var width = [b, a, widths[2]];
    var data = Settemplates(width);
    g_dom.multiselect({
        templates: data,
        enableFiltering: true,
       // enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        includeSelectAllOption: true,
        buttonWidth: g_width+'px',
        nonSelectedText: '请选择',
        selectAllText: '全选',
        allSelectedText: '已选择全部',
        nSelectedText: '已选择',
        info: '处',
        maxHeight: 250
    });
}


//计算select的展示width

function CalcWidth(size, count,index) {
    var minWidth = size * 16;
    var windowWidth = top.document.body.clientWidth * 0.45;//获取上一个的body宽度
    
    if (index == 1) {
        windowWidth = windowWidth * 0.6;
    }

    if (windowWidth != 0) {
        g_windowWidth = windowWidth;
    }
    if (windowWidth <= 0) {
        windowWidth = g_windowWidth;
    }
    var maxlength = windowWidth;
    var countnow = count + 1;
    var widths = [];
    var n = 8;
    var m = Math.ceil(countnow / n);
    var c;
    var maxWidth = minWidth * m + g_left;
    if (maxWidth <= maxlength) {
        c = m;
    } else {
        var b = (maxlength - g_left) / minWidth;
        c = Math.floor(b);
    }
    
    minWidth = minWidth + g_left;
    var ulWidth = minWidth * c + g_left;
    if (c == 0) {
        ulWidth = windowWidth;
    }
    widths.push(minWidth);
    widths.push(ulWidth);
    widths.push(c);
    return widths;

}


//数据对比
function GetDataContrastAndCorrentSensor(data,valuenumber, factorId) {
    var option = '';
    var allSize = [];
    var factorList;
    var allLength = 0;
    var count = 0;

    for (var i = 0; i < data.length; i++) {
        var sensorList = data[i].sensors;
        count += sensorList.length;
        for (var index = 0; index < sensorList.length; index++) {
            factorList = sensorList[index].factorName.split(',');
            var length = factorList.length;
            var location = sensorList[index].location;
            allSize.push(location.length);
            if (factorId == 55) {
                option += '<option value="' + sensorList[index].sensorId + '">' + location + '-' + factorList[0] + '</option>';

            } else {
                if (length == 1 || factorList == []) {
                    option += '<option value="' + sensorList[index].sensorId + '">' + location + '</option>';
                } else {
                    if (valuenumber == 4) {
                        length = 2;
                    }
                    for (var j = 0; j < length; j++) {
                        if (j == 0) {
                            option += '<option value="' + sensorList[index].sensorId + '">' + location + '-' + factorList[j] + '</option>';

                        } else {
                            option += '<option value="' + sensorList[index].sensorId + '/' + j + '">' + location + '-' + factorList[j] + '</option>';
                        }
                    }
                }
            }
            allLength = length;
        }
    }
    var a = data[0].sensors[0].sensorId;
    var allfactorSize = [];
    for (var k = 0; k < factorList.length; k++) {
        allfactorSize.push(factorList[k].length);
    }
    var maxFactorSize = factorList.length == 1 ? 0 : Math.max.apply(null, allfactorSize) + 1;
    var maxSize = Math.max.apply(null, allSize) + maxFactorSize;
    g_dom.html(option);
    count = count * allLength;
    var widths = CalcWidth(maxSize, count);
    OptimizedSelect(a, widths);
}


function Settemplates(widths) {
    var data;
    if (widths[2] >1) {
        data = {
            filterClearBtn: '',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon">' +
                '<i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"  ></div></li>',
            li: '<li style="float: left; width:' + widths[0] + 'px;"><a href="javascript:void(0);" ><label style="padding-left:' + g_left + 'px !important;'
                +'"></label></a></li>',
            ul: '<ul class="multiselect-container dropdown-menu" style="width:' + widths[1] + 'px;" ></ul>',
        };
    } else {
        data = {
            filterClearBtn: '',
            filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon">' +
                '<i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text" placeholder=""></div></li>',
            li: '<li><a href="javascript:void(0);" ><label style="padding-left:' +g_left + 'px !important;"></label></a></li>',
            ul: '<ul class="multiselect-container dropdown-menu" style="width:' + widths[1] + 'px;" ></ul>',
        };
    }

    return data;
}


//数据关联
function GetCorrentOptions(data,valuenumber ,factorId) {
    var option = '';
    var allSize = [];
    var count = 0;

    for (var i = 0; i < data.length; i++) {
        var sensorList = data[i].sensors;
        count += sensorList.length;
        for (var index = 0; index < sensorList.length; index++) {
            var location = sensorList[index].location;
            allSize.push(location.length);
            option += '<option value="' + factorId + '/' + sensorList[index].sensorId + '">' + sensorList[index].location + '</option>';
        }
    }
    var maxSize = Math.max.apply(null, allSize);
    g_dom.html(option);
    var a = factorId + '/' + data[0].sensors[0].sensorId;
    var widths = CalcWidth(maxSize, count,1);
    OptimizedSelect(a, widths);
}



function HasNonSensor(width) {
    SetSelectCss(width);
}


function SetSelectCss(width) {
    g_dom.multiselect('destroy'); //不能定义select的data-placeholder
    g_dom.multiselect({
        buttonWidth: width + 'px',

        nonSelectedText: '请选择',
    });
    g_dom.multiselect('rebuild');
}



function OptimizedJrxSelect(count,identify) {
    var a1;
    var width;
    var b;
    var data;
    if (!identify) {
        var widths = CalcWidth(count[0], count[1]);
        g_dom.multiselect('destroy'); //不能定义select的data-placeholder
        a1 = parseInt(widths[1]) < g_width ? g_width : parseInt(widths[1]);
        b = parseInt(widths[0]);
        width = [b, a1, widths[2]];
        data = Settemplates(width);
    } else {
        
        g_dom.multiselect('destroy');//不能定义select的data-placeholder
        a1 = parseInt(count[0]);
        b = parseInt(count[0]);
        width = [b, a1, 1];
        data = Settemplates(width);
    }
    g_dom.multiselect({
        templates: data,
        enableFiltering: true,
        includeSelectAllOption: true,
        buttonWidth: g_width + 'px',
        nonSelectedText: '请选择',
        selectAllText: '全选',
        allSelectedText: '已选择全部',
        nSelectedText: '已选择',
        info: '处',
        maxHeight: 350,
    });
    g_dom.multiselect('rebuild');
}



function ReziseSelect(size,count,selectIndex,index,minWidth,left,selectName,page) {
    g_width = minWidth;
    g_left = left;
    var widths = CalcWidth(size, count,index);
    $(selectName).multiselect('destroy');
    var a1 = parseInt(widths[1]) < minWidth ? minWidth : parseInt(widths[1]);
    var b = parseInt(widths[0]);
    var width = [b, a1, widths[2]];
    var data = Settemplates(width);

    if (page == 1) {
        $(selectName).multiselect({
            templates: data,
            enableFiltering: true,
            enableCollapsibleOptGroups: true,
            includeSelectAllOption: true,
            buttonWidth: g_width + 'px',
            nonSelectedText: '请选择',
            selectAllText: '全选',
            allSelectedText: '已选择全部',
            nSelectedText: '已选择',
            info: '处',
            maxHeight: 250
        });
    } else {
        $(selectName).multiselect({
            templates: data,
            enableFiltering: true,
            includeSelectAllOption: true,
            buttonWidth: g_width + 'px',
            nonSelectedText: '请选择',
            selectAllText: '全选',
            allSelectedText: '已选择全部',
            nSelectedText: '已选择',
            info: '处',
            maxHeight: 350,
        });
    }
    $(selectName).multiselect('rebuild');
}


//获取多选列表
function getAllSensors(selectName) {
    var opts = document.getElementById(selectName).options;
    var allSize = [];
    var allCount = opts.length;
    for (var j = 0; j < allCount; j++) {
        var as = opts[j].text.length;
        allSize.push(as);
    }
    var maxSize = Math.max.apply(null, allSize);
    
    var len = $("#"+selectName + " option:selected").length;
    var sensorIds = [];
    for (var i = 0; i < len; i++) {
        var a = $("#" + selectName + " option:selected")[i].value;
        var b = a.split("-")[1];
        sensorIds.push(b);
    }
    var data = {
        "size": maxSize,
        "count": allCount,
        "selected": sensorIds
    };

    return data;
}