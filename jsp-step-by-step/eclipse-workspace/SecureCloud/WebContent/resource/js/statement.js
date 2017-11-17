
//$('#struct-menu').click(function () {
//    $('.has-sub').removeClass('active');
//    $('#struct-menu').addClass('active');
//})
//$('#systemConfig').click(function () {
//    $('.has-sub').removeClass('active');
//    $('#systemConfig').addClass('active');
//})
//$('#manage').click(function () {
//    $('.has-sub').removeClass('active');
//    $('#manage').addClass('active');
//})

$(function () {
    
    $('#statement-menu').addClass('active');
    var flag = location.href.split('=')[1].split('&')[0];

    $('.page-title span').append(getCookie('organization'));
    var name = getCookie('nowStructName');
    $('.page-title small a').html('<i class="icon-angle-down"></i>' + name);
    $('.breadcrumb li:last').html(name);


    if (flag == "0") {//无异常报表
        document.getElementById("titleH").innerText = "异常报表";
        var sb = new StringBuffer();
        var str = "";
        str += "无";
        sb.append(str);
        $('#statement').html('');
        $('#statement').append(sb.toString());
    }
    else if (flag == "1") {//日报表
        document.getElementById("titleH").innerText = "日报表";
        var sb = new StringBuffer();
        var str = "<ul class='feeds'>";
        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月08日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/04/09</div></div></li>";//最新日报
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月3日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新日报
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月2日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新日报
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月1日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新日报
        str += "</ul>";
        sb.append(str);
        $('#statement').html('');
        $('#statement').append(sb.toString());
    }
    else if (flag == "2") {//周报表
        document.getElementById("titleH").innerText = "周报表";
        var sb = new StringBuffer();
      

        //var str = "<div class='page-sidebar nav-collapse collapse'><ul><li class='has-sub'><a href='javascript:;'><span class='title'>2014年4月第一周</span><span class='arrow'></span></a>";
        //str += "<ul class='sub feeds'>";

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月4日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新周报表
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月3日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新周报表
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月2日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新周报表
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += " <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月1日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新周报表
        //str += "</ul>";

        //str += "</ul></div>";


        var str = "";
        str += "<ul class='feeds'> ";


        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月06日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/07</div></div></li>";//最新周报表

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月05日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/06</div></div></li>";//最新周报表

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月04日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/05</div></div></li>";//最新周报表

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月03日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/04</div></div></li>";//最新周报表

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月02日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/03</div></div></li>";//最新周报表

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += " <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月01日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/02</div></div></li>";//最新周报表

        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年3月31日" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2014/04/01</div></div></li></ul>";//最新周报表



     

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年4月第一周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/04/07</div></div></li>";//最新周报表

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年3月第四周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/04/01</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年3月第三周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/03/24</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年3月第二周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/03/17</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年3月第一周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/03/10</div></div></li>";



        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年2月第四周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/03/01</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年2月第三周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/02/24</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年2月第二周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/02/17</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年2月第一周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/02/10</div></div></li>";



        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年1月第四周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/02/01</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年1月第三周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/01/27</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年1月第二周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/01/20</div></div></li>";

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "<div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年1月第一周" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/01/13</div></div></li></ul>";

    

        sb.append(str);
        $('#statement').html('');
        $('#statement').append(sb.toString());
    }
    else if (flag == "3") {//月报表
        document.getElementById("titleH").innerText = "月报表";
        var sb = new StringBuffer();
        var str = "<ul class='feeds'>";
        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年3月" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/04/01</div></div></li>";//最新月报

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年2月" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/03/01</div></div></li>";//最新月报

        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年1月" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/02/01</div></div></li></ul>";//最新月报
        sb.append(str);

        $('#statement').html('');
        $('#statement').append(sb.toString());
    }
    else if (flag == "4") {//季报表
        document.getElementById("titleH").innerText = "季报表";
        var sb = new StringBuffer();
        var str = "<ul class='feeds'> ";
        str += "<li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += "  <div class='cont-col2'><div class='desc'><a href='javascript:;'>2014年第一季度" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/04/01</div></div></li></ul>";//最新月报

        sb.append(str);

        $('#statement').html('');
        $('#statement').append(sb.toString());
    }
    else {//年报表
        document.getElementById("titleH").innerText = "年报表";
        var sb = new StringBuffer();
        var str = "<ul class='feeds'>";
        str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        str += " <div class='cont-col2'><div class='desc'><a href='javascript:;'>2013年" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        str += "</div></div><div class='col2'><div class='date'> 2014/03/01</div></div></li>";//最新年报
        
        //str += " <li><div class='col1'><div class='cont'><div class='cont-col1'><div class='label label-success'><i class='icon-list-alt'></i></div></div> ";
        //str += " <div class='cont-col2'><div class='desc'><a href='javascript:;'>2012年" + name + "健康状况报告&nbsp;&nbsp;&nbsp;&nbsp;<span class='label label-important label-mini'>查看<i class='icon-share-alt'></i></span></a></div></div>";
        //str += "</div></div><div class='col2'><div class='date'> 2013/03/01</div></div></li></ul>";//最新年报

        sb.append(str);

        $('#statement').html('');
        $('#statement').append(sb.toString());
    }
})
