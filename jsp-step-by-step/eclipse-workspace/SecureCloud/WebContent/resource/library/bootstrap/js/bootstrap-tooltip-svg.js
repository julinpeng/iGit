/* ===========================================================
 * bootstrap-tooltip.js v2.3.2
 * http://getbootstrap.com/2.3.2/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * 2013-09-27 修改tooltip在bottom位置显示时，SVG矢量图节点位置定位发生偏移 
 * 2013-10-18 修改tooptip根据热点大概位置placement自动分配
 * http://www.apache.org/licenses/LICENSE-2.0
 * ========================================================== */

function ChangeDateFormat(jsondate) {
    jsondate = jsondate.replace("/Date(", "").replace(")/", "");
    if (jsondate.indexOf("+") > 0) {
        jsondate = jsondate.substring(0, jsondate.indexOf("+"));
    }
    else if (jsondate.indexOf("-") > 0) {
        jsondate = jsondate.substring(0, jsondate.indexOf("-"));
    }

    var date = new Date(parseInt(jsondate, 10));
    //转换成标准的“月：MM”和“日：dd”
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

    return date.getFullYear() + "-" + month + "-" + currentDate + " " + checkTime(date.getHours()) + ":" + checkTime(date.getMinutes()) + ":" + checkTime(date.getSeconds());
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

!function ($) {

    "use strict"; // jshint ;_;

    var temTitle;
    /* TOOLTIP PUBLIC CLASS DEFINITION
     * =============================== */

    var Tooltip = function (element, options) {
        this.init('tooltip', element, options)
    }

    Tooltip.prototype = {

        constructor: Tooltip

    , init: function (type, element, options) {
        var eventIn
          , eventOut
          , triggers
          , trigger
          , i

        this.type = type
        this.$element = $(element)
        this.options = this.getOptions(options)
        this.enabled = true

        triggers = this.options.trigger.split(' ')

        for (i = triggers.length; i--;) {
            trigger = triggers[i]
            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
                eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }

        this.options.selector ?
          (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
          this.fixTitle()
    }

    , getOptions: function (options) {
        options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options)

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay
            , hide: options.delay
            }
        }

        return options
    }

    , enter: function (e) {
        var defaults = $.fn[this.type].defaults
          , options = {}
          , self

        this.setTitle();

        this._options && $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value
        }, this)

        self = $(e.currentTarget)[this.type](options).data(this.type)

        if (!self.options.delay || !self.options.delay.show) return self.show()

        clearTimeout(this.timeout)
        self.hoverState = 'in'
        this.timeout = setTimeout(function () {


            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }

    , leave: function (e) {
        var self = $(e.currentTarget)[this.type](this._options).data(this.type)

        if (this.timeout) clearTimeout(this.timeout)
        if (!self.options.delay || !self.options.delay.hide) return self.hide()

        self.hoverState = 'out'
        this.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }

    , show: function () {
        var $tip
          , pos
          , actualWidth
          , actualHeight
          , placement
          , tp
          , e = $.Event('show')

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)
            if (e.isDefaultPrevented()) return
            $tip = this.tip()
            this.setContent()

            if (this.options.animation) {
                $tip.addClass('fade')
            }

            placement = typeof this.options.placement == 'function' ?
              this.options.placement.call(this, $tip[0], this.$element[0]) :
              this.options.placement

            $tip
              .detach()
              .css({ top: 0, left: 0, display: 'block' })

            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

            pos = this.getPosition()



            actualWidth = $tip[0].offsetWidth
            actualHeight = $tip[0].offsetHeight

            //修复SVG矢量图元素获取失败
            var svgOffSet = $('#svgEle').offset();

            //对tooptip弹出位置进行修复

            if (pos.left < 260) {
                placement = 'right';
            }
            else if (pos.top > 300) {
                placement = 'top';
            }

            switch (placement) {
                case 'bottom':
                    tp = { top: pos.top + svgOffSet.top + pos.height, left: pos.left + svgOffSet.left + pos.width / 2 - actualWidth / 2 }
                    break
                case 'top':
                    tp = { top: pos.top + svgOffSet.top - actualHeight, left: pos.left + svgOffSet.left + pos.width / 2 - actualWidth / 2 }
                    break
                case 'left':
                    tp = { top: pos.top + svgOffSet.top + pos.height / 2 - actualHeight / 2, left: pos.left + svgOffSet.left - actualWidth }
                    break
                case 'right':
                    tp = { top: pos.top + svgOffSet.top + pos.height / 2 - actualHeight / 2, left: pos.left + svgOffSet.left + pos.width }
                    break
            }

            this.applyPlacement(tp, placement)
            this.$element.trigger('shown')
        }
    }

    , applyPlacement: function (offset, placement) {
        var $tip = this.tip()
          , width = $tip[0].offsetWidth
          , height = $tip[0].offsetHeight
          , actualWidth
          , actualHeight
          , delta
          , replace

        $tip
          .offset(offset)
          .addClass(placement)
          .addClass('in')

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight
            replace = true
        }

        if (placement == 'bottom' || placement == 'top') {
            delta = 0

            if (offset.left < 0) {
                delta = offset.left * -2
                offset.left = 0
                $tip.offset(offset)
                actualWidth = $tip[0].offsetWidth
                actualHeight = $tip[0].offsetHeight
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top')
        }

        if (replace) $tip.offset(offset)
    }

    , replaceArrow: function (delta, dimension, position) {
        this
          .arrow()
          .css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
    }

    , setContent: function () {
        var $tip = this.tip()
          , title = this.getTitle()

        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }

    , hide: function () {
        var that = this
          , $tip = this.tip()
          , e = $.Event('hide')

        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return

        $tip.removeClass('in')

        function removeWithAnimation() {
            var timeout = setTimeout(function () {
                $tip.off($.support.transition.end).detach()
            }, 500)

            $tip.one($.support.transition.end, function () {
                clearTimeout(timeout)
                $tip.detach()
            })
        }

        $.support.transition && this.$tip.hasClass('fade') ?
          removeWithAnimation() :
          $tip.detach()

        this.$element.trigger('hidden')

        return this
    }

    , fixTitle: function () {
        var $e = this.$element

        if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }

    , hasContent: function () {
        return this.getTitle()
    }

    , getPosition: function () {


        var el = this.$element[0]
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth
        , height: el.offsetHeight
        }, this.$element.offset())

    }
    , setTitle: function () {
        //alert("123");
        var newdata = SensorNewData();
        //alert(newdataList);

        var title
          , $e = this.$element
          , o = this.options
        temTitle = '';

        var sensorId = $e.attr('id');

        if (sensorId == null) {
            title = $e.attr('data-original-title')
              || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)
            temTitle = title;
        }
        else {
            for (var i = 0; i < newdata.length; i++) {
                if (sensorId == newdata[i].sensorId) {
                    title = '<p align="left">项目名称：' + newdata[i].structName;
                    title += '<br/>设备名称：' + newdata[i].productName;
                    title += '<br/>设备位置：' + newdata[i].location;
                    if (newdata[i].data == null) {
                        title += '<br/>无最新数据';
                    }
                    else {                       
                        title += '<br/>' + newdata[i].data;
                        title += '<br/>采集时间：' + newdata[i].time;
                    }
                    if (newdata[i].warningLevel == 0) {
                        title += '<br/>告警：无';
                    }
                    else {
                        title += '<br/>告警：' + newdata[i].warningLevel + '级';
                    }
                    temTitle = title+'</p>';
                }
            }
        }
    }

    , getTitle: function () {

        return temTitle;
    }

    , tip: function () {
        return this.$tip = this.$tip || $(this.options.template)
    }

    , arrow: function () {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }

    , validate: function () {
        if (!this.$element[0].parentNode) {
            this.hide()
            this.$element = null
            this.options = null
        }
    }

    , enable: function () {
        this.enabled = true
    }

    , disable: function () {
        this.enabled = false
    }

    , toggleEnabled: function () {
        this.enabled = !this.enabled
    }

    , toggle: function (e) {
        var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this
        self.tip().hasClass('in') ? self.hide() : self.show()
    }

    , destroy: function () {
        this.hide().$element.off('.' + this.type).removeData(this.type)
    }

    }


    /* TOOLTIP PLUGIN DEFINITION
     * ========================= */

    var old = $.fn.tooltip

    $.fn.tooltip = function (option) {
        return this.each(function () {
            var $this = $(this)
              , data = $this.data('tooltip')
              , options = typeof option == 'object' && option
            if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.tooltip.Constructor = Tooltip

    $.fn.tooltip.defaults = {
        animation: true
    , placement: 'top'
    , selector: false
    , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    , trigger: 'hover focus'
    , title: ''
    , delay: 0
    , html: false
    , container: false
    }


    /* TOOLTIP NO CONFLICT
     * =================== */

    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old
        return this
    }

}(window.jQuery);