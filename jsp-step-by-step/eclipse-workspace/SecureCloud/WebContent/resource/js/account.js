
$(function () {
    GetAccountInfo();
    var username = getCookie('loginname');
    $('#lblUser').html(username);
});

var oldpassword = '';
function GetAccountInfo() {
    var url = apiurl + '/user/' + getCookie("userId") + '/info?token=' + getCookie("token");
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data == null || data.length == 0) {
                return;
            }
            $('#orgnization').empty();
            $('#struct').empty();
            $('#userName').val(data.userName);
            
            oldpassword = data.password;
            $('#role').val(data.roleCode); // "data.roleCode"为角色表中"ROLE_DESCRIPTION"
            data.email == null ? $('#mail').val('无') : $('#mail').val(data.email);
            data.phone == null ? $('#tel').val('无') : $('#tel').val(data.phone);

            // 用户归属组织
            $('#orgnization').html($("<option>").text(data.beOrgName == null ? "无" : data.beOrgName));

            // 用户关注结构物
            if (data.structs != null) {
                for (var k = 0; k < data.structs.length; k++) {
                    var option = $("<option>").text(data.structs[k].name).val(data.userName)
                    $('#struct').append(option);
                }
            }
        },
        error: function () {
            alert("获取用户信息出错！");
        }
    });
}

$('#btnReset_edit').click(function () {

    $('#Old_password').val('');
    $('#New_password').val('');
    $('#Confirm_New_password').val('');
});

$('#btnSave_edit').click(function () {
    var oldPwd = $('#Old_password').val();
    var newPwd = $('#New_password').val();
    var confirm_password = $('#Confirm_New_password').val();
        if (!/^[a-zA-Z0-9]{1,15}$/.test(confirm_password) || confirm_password == "" ) {
            $('#Confirm_New_password').focus();
        } else if ((!testLetter(confirm_password)) || (!testDigital(confirm_password))) {
            alert("密码设置过简单");
            $('#New_password').focus();
        }
        else if (newPwd != confirm_password) {
            alert("两次密码输入不一致");
            $('#Confirm_New_password').focus();
        }
        else {
            var url = apiurl + '/user/modify-info' + '?token=' + getCookie("token");
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: {
                    userId: getCookie("userId"),
                    oldPwd: oldPwd,
                    newPwd: newPwd,
                },
                success: function (data) {
                    alert(data.Message);
                    if (data.Message == "密码修改成功") {
                        if (this.parent == this)
                            window.location.href = '/login.html';
                        else
                            window.parent.location.href = "/login.html";
                    }
                },
                error: function () {
                    alert("网络访问失败");
                }
            });
        }
});

$('#btnUserEditClose').click(function(event) {
    event.preventDefault();
    if (this.parent == this)
        window.location.href = '/Support/MainPage.aspx';
    else
        window.parent.location.href = '/Support/MainPage.aspx';
});