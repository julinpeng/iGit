
//确定时间
function showdate(n) {
    var uom = new Date();
    uom.setDate(uom.getDate() + n);


    uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate()+" "+ uom.getHours() + ":" + uom.getMinutes() + ":" + uom.getSeconds() ;


    //uom = uom.getFullYear() + "-" + (uom.getMonth() + 1) + "-" + uom.getDate();
    return uom.replace(/\b(\w)\b/g, '0$1');
}


//init datepicker
 $('#dpform1').datetimepicker({
    format: 'yyyy-MM-dd hh:mm:ss',
    language: 'pt-BR',
});
$('#dpdend1').datetimepicker({
    format: 'yyyy-MM-dd hh:mm:ss',
    language: 'pt-BR',
});

//点击之后日期框隐藏
//var dt1 = $('#dpform1').datetimepicker({
//    format: 'yyyy-mm-dd'
//}).on('changeDate', function(e) {
    
//    $("bootstrap-datetimepicker-widget :before").css("display", "none");
//    $("bootstrap-datetimepicker-widget :after").css("display", "none");
//});

//var dt2 = $('#dpdend1').datetimepicker({
//    format: 'yyyy-mm-dd'
//}).on('changeDate', function (e) {

//    $("bootstrap-datetimepicker-widget :before").css("display", "none");
//    $("bootstrap-datetimepicker-widget :after").css("display", "none");
//});


$("#dpform").val(showdate(-1));
$("#dpdend").val(showdate(0));


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
            // dataNew();
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
            //$("#dpform").val(showdate(-1, 'other'));
            //$("#dpdend").val(showdate(0, 'other'));
            //$('#dpform').removeAttr("disabled");
            //$('#dpdend').removeAttr("disabled");

            $("#dpform").val(getStartdate());
            $("#dpdend").val(getEnddate());
            $('#dpform').removeAttr("disabled");
            $('#dpdend').removeAttr("disabled");
            break;
    }

}



//需要修改获得时间值
function getStartdate() {
    return $('#date').val() == 'other' ? getTime('#dpform')  : $('#dpform').val() ;

}

function getEnddate() {
    return $('#date').val() == 'other' ? getTime('#dpdend') : $('#dpdend').val();


}

$(function () {
    dateValue($('#date').val());//重新判断时间选择,其他选项不起作用需重新选择
})



//获取时间
function getTime(d1) {
    var c = $(d1)[0].value;
    return c;

}

