
function showdate(n) {
    var uom = new Date();
    uom.setDate(uom.getDate() + n);


    uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate() + " " + uom.getHours() + ":00" + ":00";


    //uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate();
    return uom.replace(/\b(\w)\b/g, '0$1');
}

//$('#dpform').val(showdate(0));
//$('#dpdend').val(showdate(0));
//$('#time').val(showdate(0));

//init datepicker
$('#dpform1').datetimepicker({
    format: 'yyyy-MM-dd hh:00:00',
    language: 'pt-BR'
});
$('#dpdend1').datetimepicker({
    format: 'yyyy-MM-dd hh:00:00',
    language: 'pt-BR'
});
//$('#time').datepicker({
//    language: "zh-CN",
//    format: 'yyyy-mm-dd'
//});

$("#dpform").val(showdate(-365));
$("#dpdend").val(showdate(0));
//$('#hiddenStartDate').val($("#dpform").val());
//$('#hiddenEndDate').val($("#dpdend").val());

//选择日期，重新加载图表
$('#date').change(function (e) {
    var text = $('#date :selected').text();
    e.preventDefault();
    var $target = $(this).parent().next('.other-search');
    if ($target.is(':visible')) {
        if (text != "其他") {
            $('i', $(this)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
            $target.slideToggle();
        }
    } else {
        if (text == "其他") {
            $('i', $(this)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
            $target.slideToggle();
        }
    }
    dateValue(this.value);
});
function dateValue(dateSelectValue) {

    switch (dateSelectValue) {
        case 'day':
            $("#dpform").val(showdate(-1));
            $("#dpdend").val(showdate(0));
            $('#dpform').attr("disabled", "disabled");
            $('#dpdend').attr("disabled", "disabled");
            break;
        case 'week':
            $("#dpform").val(showdate(-7));
            $("#dpdend").val(showdate(0));
            $('#dpform').attr("disabled", "disabled");
            $('#dpdend').attr("disabled", "disabled");
            break;
        case 'month':
            $("#dpform").val(showdate(-30));
            $("#dpdend").val(showdate(0));
            $('#dpform').attr("disabled", "disabled");
            $('#dpdend').attr("disabled", "disabled");
            break;
        case 'quarter':
            $("#dpform").val(showdate(-90));
            $("#dpdend").val(showdate(0));
            $('#dpform').attr("disabled", "disabled");
            $('#dpdend').attr("disabled", "disabled");
            break;
        case 'year':
            $("#dpform").val(showdate(-365));
            $("#dpdend").val(showdate(0));
            $('#dpform').attr("disabled", "disabled");
            $('#dpdend').attr("disabled", "disabled");
            break;
        case 'other':
            $("#dpform").val(showdate(0, 'other'));
            $("#dpdend").val(showdate(0, 'other'));
            $('#dpform').removeAttr("disabled");
            $('#dpdend').removeAttr("disabled");
            break;
    }

}
//选择日期后的加载事件
//var checkin = $('#dpform').datepicker({
//    format: 'yyyy-mm-dd'
//}).on('changeDate', function (ev) {
//    if (ev.date.valueOf() > checkout.date.valueOf()) {
//        var newDate = new Date(ev.date);
//        newDate.setDate(newDate.getDate() + 1);

//        checkout.setValue(newDate);
//    }
//    checkin.hide();
//    $('#dpdend')[0].focus();

//}).data('datepicker');

//var checkout = $('#dpdend').datepicker({
//    onRender: function (date) {
//        return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
//    },
//    format: 'yyyy-mm-dd'
//}).on('changeDate', function () {
//    checkout.hide();
//}).data('datepicker');

//需要修改获得时间值
function getStartdate() {
    return $('#date').val() == 'other' ? getTime('#dpform') : $('#dpform').val();

}

function getEnddate() {
    return $('#date').val() == 'other' ? getTime('#dpdend') : $('#dpdend').val();


}



//获取时间
function getTime(d1) {
    //var b = 1;

    //var a = new Array();
    //var i = 0;
    //while (i < b.length) {
    var c = $(d1)[0].value;
    //alert(c);
    //a.push(c);
    // i++
    // }
    return c;

}