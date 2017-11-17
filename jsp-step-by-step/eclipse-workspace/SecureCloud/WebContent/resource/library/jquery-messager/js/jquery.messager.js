/*
Description: $.fn.dialog
Author: Kris Zhang
Dependence: N/A
*/
(function($) {

    $.fn.dialog = function(options) {

        var self = this,
            $this = $(self),
            $body = $(document.body),
            $msgbox = $this.closest('.dialog'),
            parentDataName = 'dialog-parent',
            arg1 = arguments[1],
            arg2 = arguments[2];

        var create = function() {

            var msghtml = ''
                + '<div class="dialog modal fade">'
                + '<div class="modal-dialog">'
                + '<div class="modal-content">'
                + '<div class="modal-header">'
                + '<button type="button" class="close">&times;</button>'
                + '<h4 class="modal-title"></h4>'
                + '</div>'
                + '<div class="modal-body"></div>'
                + '<div class="modal-footer"></div>'
                + '</div>'
                + '</div>'
                + '</div>';


            $msgbox = $(msghtml);
            $(document.body).append($msgbox);
            $msgbox.find(".modal-body").append($this);
        };

        var createButton = function(_options) {
            var buttons = (_options || options || {}).buttons || {}, $btnrow = $msgbox.find(".modal-footer");

            //clear old buttons
            $btnrow.empty();

            var isButtonArr = buttons.constructor == Array;

            for (var button in buttons) {
                var btnObj = buttons[button],
                    id = "",
                    text = "",
                    classed = "btn-default",
                    click = "";

                if (btnObj.constructor == Object) {
                    id = btnObj.id;
                    text = btnObj.text;
                    classed = btnObj['class'] || btnObj.classed || classed;
                    click = btnObj.click;
                }

                //Buttons should be an object, etc: { 'close': function { } }
                else if (!isButtonArr && btnObj.constructor == Function) {
                    text = button;
                    click = btnObj;
                } else {
                    continue;
                }

                //<button data-bb-handler="danger" type="button" class="btn btn-danger">Danger!</button>
                $button = $('<button type="button" class="btn">').addClass(classed).html(text);

                id && $button.attr("id", id);
                if (click) {
                    (function(click) {
                        $button.click(function() {
                            click.call(self);
                        });
                    })(click);
                }

                $btnrow.append($button);
            }

            $btnrow.data('buttons', buttons);
        };

        var show = function() {
            // call the bootstrap modal to handle the show events (fade effects, body class and backdrop div)
            $msgbox.modal('show');
        };

        var close = function(destroy) {
            // call the bootstrap modal to handle the hide events and remove msgbox after the modal is hidden
            $msgbox.modal('hide').one('hidden.bs.modal', function() {
                if (destroy) {
                    $this.data(parentDataName).append($this);
                    $msgbox.remove();
                }
            });
        };

        if (options.constructor == Object) {
            !$this.data(parentDataName) && $this.data(parentDataName, $this.parent());

            if ($msgbox.size() < 1) {
                create();
            }
            createButton();
            $(".modal-title", $msgbox).html(options.title || "");
            var $modalDialog = $(".modal-dialog", $msgbox).addClass(options.dialogClass || "");
            $(".modal-header .close", $msgbox).click(function() {
                var closeHandler = options.onClose || close;
                closeHandler.call(self);
            });
            (options['class'] || options.classed) && $msgbox.addClass(options['class'] || options.classed);
            /*
            Passing the options, etc: backdrop, keyboard
            */
            options.autoOpen === false && (options.show = false)
            options.width && $modalDialog.width(options.width)
            options.height && $modalDialog.height(options.height)
            $msgbox.modal(options)
        }

        if (options == "destroy") {
            close(true);
        }

        if (options == "close") {
            close();
        }

        if (options == "open") {
            show();
        }

        if (options == "option") {
            if (arg1 == 'buttons') {
                if (arg2) {
                    createButton({ buttons: arg2 });
                    show();
                } else {
                    return $msgbox.find(".modal-footer").data('buttons');
                }
            }
        }

        return self;
    };

})(jQuery);


/*
Description: $.messager
Author: Kris Zhang
Dependence: $.fn.dialog
*/
$.messager = (function() {

    var alert = function(title, message) {
        var model = $.messager.model;

        if (arguments.length < 2) {
            message = title || "";
            title = "&nbsp;";
        }

        $("<div>" + message + "</div>").dialog({
            title: title
            // override destroy methods;
            ,
            onClose: function() {
                $(this).dialog("destroy");
            },
            buttons: [
                {
                    text: model.ok.text,
                    classed: model.ok.classed || "btn-success",
                    click: function() {
                        $(this).dialog("destroy");
                    }
                }
            ]
        });
    };

    var confirm = function(title, message, callback) {
        var model = $.messager.model;

        $("<div>" + message + "</div>").dialog({
            title: title
            // override destroy methods;
            ,
            onClose: function() {
                $(this).dialog("destroy");
            },
            buttons: [
                {
                    text: model.ok.text,
                    classed: model.ok.classed || "btn-success",
                    click: function() {
                        $(this).dialog("destroy");
                        callback && callback();
                    }
                },
                {
                    text: model.cancel.text,
                    classed: model.cancel.classed || "btn-danger",
                    click: function() {
                        $(this).dialog("destroy");
                    }
                }
            ]
        });
    };

    /*
    * popup message
    */
    var msghtml = ''
        + '<div class="dialog modal fade msg-popup">'
        +   '<div class="modal-dialog modal-sm">'
        +       '<div class="modal-content">'
        +           '<div class="modal-body text-center"></div>'
        +       '</div>'
        +   '</div>'
        + '</div>';

    var $msgbox = $('.dialog.msg-popup');

    var popup = function (message, durationInMillisecond) {
        if (!$msgbox.size()) {
            $msgbox = $(msghtml);
            $('body').append($msgbox);
        }

        $msgbox.find(".modal-body").html(message);
        $msgbox.modal({ show: true, backdrop: false });

        setTimeout(function() {
            $msgbox.modal('hide');
        }, durationInMillisecond == null ? 2000 : durationInMillisecond); // default 2s
    };

    return {
        alert: alert,
        popup: popup,
        confirm: confirm
    };

})();


$.messager.model = {
    ok: { text: "OK", classed: 'btn-success' },
    cancel: { text: "Cancel", classed: 'btn-danger' }
};