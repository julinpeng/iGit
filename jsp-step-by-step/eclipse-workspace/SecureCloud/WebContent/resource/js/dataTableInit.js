

function createTable(parameters) {
    $('#data_tables_wrapper').remove();
    //var a = parameters.tableName.split('#')[1];
    $(parameters.tableName).html('<table id=\'data_tables'+parameters.tableName.split('#')[1]+'\' class=\'table table-striped table-bordered\'></table>');

    var tables = $('#data_tables' + parameters.tableName.split('#')[1]);

    tables.append('<thead>');
    tables.find('thead').append('<tr>');
    for (var index = 0; index < parameters.theadList.length; index++) {
        tables.find('thead').find('tr').append('<th>' + parameters.theadList[index] + '</th>');
    }

    tables.append('<tbody>');

    for (index = 0; index < parameters.dataSource.length; index++) {
        var pdata = parameters.dataSource[index];
        var trinnert = '';
        for (var tdindex = 0; tdindex < pdata.length; tdindex++) {
            var cudata = pdata[tdindex];
            if (tdindex == parameters.dateIndex) {
                var dtime = new Date();
                dtime.setTime(cudata);
                var dec = '';
                if (cudata.toString().split('.').length > 1) {
                    dec = cudata.toString().split('.')[1].toString();
                    for (var k = dec.length; k < 4; k++) {
                        dec += '0';
                    }
                }
                var normalizedMonth = dtime.getMonth() + 1 < 10 ? "0" + (dtime.getMonth() + 1) : dtime.getMonth() + 1;
                cudata = dtime.getFullYear() + '-' + normalizedMonth + '-' + normalizeTimeFormat(dtime.getDate()) + ' ' + normalizeTimeFormat(dtime.getHours()) + ':' + normalizeTimeFormat(dtime.getMinutes()) + ':' + normalizeTimeFormat(dtime.getSeconds()) + '.' + dtime.getMilliseconds() + dec;
            }
            trinnert += '<td>' + (cudata == null ? ' ' : cudata.toString()) + '</td>';
        }
        tables.find('tbody').append('<tr>' + trinnert + '</tr>');
    }

}

function tableManager(renderTo, data, thlist, dateIndex) {
    dateIndex = dateIndex || thlist.length - 1;
    createTable({
        tableName: '#' + renderTo,
        theadList: thlist,
        dataSource: data,
        dateIndex: dateIndex
    });
    var stag = $('.data-table-content');
    var isok = false;
    if (!stag.is(':visible')) {
        stag.show();
        isok = true;
    }
    //stag.show();
    //var a = $('table.table').rows.item(0).cells.length;
    //alert(a);
    $('#data_tables'+renderTo).dataTable({
        "sDom": 'T<"clear">lfrtip',

        "iDisplayLength": 50, //每页显示个数 
        "bScrollCollapse": true,
        "bLengthChange": true,  //每页显示的记录数 
        "bPaginate": true,  //是否显示分页
        "bFilter": true, //搜索栏
        "bSort": true, //是否支持排序功能
        "bInfo": true, //显示表格信息
        "bAutoWidth": false,  //自适应宽度
        "bStateSave": false, //保存状态到cookie *************** 很重要，当搜索的时候页面一刷新会导致搜索的消失。使用这个属性就可避免了
            
        "sPaginationType": "full_numbers",
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aaSorting": [[thlist.length-1,"desc"]],
        "bDestroy": true,
        "bRetrieve": true,
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
    //setTimeout(function () {
    //    if (isok)
    //        stag.hide();
    //}, 800)

}

function tableManager(renderTo, data, thlist, dateIndex,fileName) {
    dateIndex = dateIndex || thlist.length - 1;
    createTable({
        tableName: '#' + renderTo,
        theadList: thlist,
        dataSource: data,
        dateIndex: dateIndex
    });
    var stag = $('.data-table-content');
    var isok = false;
    if (!stag.is(':visible')) {
        stag.show();
        isok = true;
    }
    //stag.show();
    //var a = $('table.table').rows.item(0).cells.length;
    //alert(a);
    $('#data_tables' + renderTo).dataTable({
        "sDom": 'T<"clear">lfrtip',

        "iDisplayLength": 50, //每页显示个数 
        "bScrollCollapse": true,
        "bLengthChange": true,  //每页显示的记录数 
        "bPaginate": true,  //是否显示分页
        "bFilter": true, //搜索栏
        "bSort": true, //是否支持排序功能
        "bInfo": true, //显示表格信息
        "bAutoWidth": false,  //自适应宽度
        "bStateSave": false, //保存状态到cookie *************** 很重要，当搜索的时候页面一刷新会导致搜索的消失。使用这个属性就可避免了

        "sPaginationType": "full_numbers",
        "oLanguage": {
            "sUrl": "/resource/language/zn_CN.txt"
        },
        "aaSorting": [[thlist.length - 1, "desc"]],
        "bDestroy": true,
        "bRetrieve": true,
        "oTableTools": {
            "sSwfPath": "/resource/library/tableTools/swf/copy_csv_xls_pdf.swf",
            "aButtons": [
                {
                    "sExtends": "xls",
                    "sButtonText": "导出到Excel",
                    "sFileName": fileName+".xls"
                }
            ]
        }
    });
    //setTimeout(function () {
    //    if (isok)
    //        stag.hide();
    //}, 800)

}

    //标准化时间格式
function normalizeTimeFormat(time) {
      if (time < 10) {
          time = "0" + time;
      }
      return time;
}