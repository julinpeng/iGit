/* ===========================================================
 * bootstrap-tooltip.js v2.3.2
 * http://getbootstrap.com/2.3.2/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


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
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
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

        switch (placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        this.applyPlacement(tp, placement)
        this.$element.trigger('shown')
      }
    }

  , applyPlacement: function(offset, placement){
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

        if (offset.left < 0){
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

  , replaceArrow: function(delta, dimension, position){
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
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
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
      var title,
              $e = this.$element,
              o = this.options
      temTitle = '';
      if (structType == structTypeRShell) {
          var dataHotSpot = HotSpotData_tooltip();
          var sensorId = $e.attr('id');
          if (sensorId == null) {

              title = $e.attr('data-original-title')
                  || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)
              temTitle.append(title);

          } else {
              for (var j = 0; j < dataHotSpot.length; j++) {
                  if (sensorId == dataHotSpot[j].sensorId) {
                      title = "项目：" + dataHotSpot[j].structName;
                      title += "<br />设备：" + dataHotSpot[j].productName;
                      title += "<br />位置：" + dataHotSpot[j].location;
                      if (dataHotSpot[j].warningLevel == 5) {
                          title += "<br />无告警";
                      } else {
                          title += "<br />告警等级：" + dataHotSpot[j].warningLevel;
                      }
                      if (dataHotSpot[j].DataTypeParam != null) {
                          var dP = dataHotSpot[j].DataTypeParam;
                          if (dP == 1 || dP == 2 || dP == 3 || dP == 4 || dP == 5 || dP == 6 || dP == 7 || dP == 9 || dP == 10) {
                              title += "<br/><div style='text-align:center;'><img src='/resource/img/strain_" + dP + ".PNG'></img></div>";
                          }
                      }
                      var url = apiurl + '/structRShellHotspot/' + dataHotSpot[j].sensorId + '/' + dataHotSpot[j].factorId + '/data?token=' + getCookie('token');
                      $.ajax({
                          url: url,
                          type: 'get',
                          beforeSend: function(xhr) {
                              title += '<br />数据加载中<img src="./resource/img/loading.gif" align="absmiddle">';
                              temTitle = title;
                              return;
                          },
                          success: function(data) {
                              title = title.split("<br />数据加载中")[0];
                              if (data == null || data.length == 0) {
                                  title += '<br />无最新数据';
                                  temTitle = title;
                                  return;
                              }
                              var time = "";
                              if (dataHotSpot[j].factorId != 54 && dataHotSpot[j].factorId != 53) {
                                  time = new Date(parseInt(data.AcquisitionTime.substring(6, 19)));
                                  time = MillisecondsToDateTime(time);
                              }
                              if (dataHotSpot[j].factorId == 26) {
                                  if (data.Value == null) {
                                      title += "<br />温度： 无";
                                  } else {
                                      title += '<br />温度：' + data.Value.toFixed(2) + " " + data.Unit;
                                  }
                                  title += '<br/><div style="word-break: keep-all;white-space:nowrap;">采集时间：' + time + '</div>';
                              } else if (dataHotSpot[j].factorId == 30) {
                                  if (data.ValuesSpeed == null) {
                                      title += '<br />风速：无';
                                  } else {
                                      title += '<br />风速：' + data.ValuesSpeed.toFixed(2) + " " + data.UnitSpeed;
                                  }
                                  if (data.ValuesDir == null) {
                                      title += '<br />风向角：无';
                                  } else {
                                      title += '<br />风向角：' + data.ValuesDir.toFixed(2) + " " + data.UnitDir;
                                  }
                                  if (data.ValuesElev == null) {
                                      title += '<br />风仰角：无';
                                  } else {
                                      title += '<br />风仰角：' + data.ValuesElev.toFixed(2) + " " + data.UnitElecv;
                                  }
                                  title += '<br/><div style="word-break: keep-all;white-space:nowrap;">采集时间：' + time + '</div>';
                              } else if (dataHotSpot[j].factorId == 9) {
                                  if (data.ValuesX == null) {
                                      title += '<br />X方向位移：无';
                                  } else {
                                      title += '<br />X方向位移：' + data.ValuesX + " " + data.Unit;
                                  }
                                  if (data.ValuesY == null) {
                                      title += '<br />Y方向位移：无';
                                  } else {
                                      title += '<br />Y方向位移：' + data.ValuesY + " " + data.Unit;
                                  }
                                  if (data.ValuesZ == null) {
                                      title += '<br />Z方向位移：无';
                                  } else {
                                      title += '<br />Z方向位移：' + data.ValuesZ + " " + data.Unit;
                                  }
                                  title += '<br/><div style="word-break: keep-all;white-space:nowrap;">采集时间：' + time + '</div>';
                              } else if (dataHotSpot[j].factorId == 11) {
                                  if (data.Value == null) {
                                      title += '<br />沉降：无';
                                  } else {
                                      title += '<br />沉降：' + data.Value + " " + data.Unit;
                                  }
                                  title += '<br/><div style="word-break: keep-all;white-space:nowrap;">采集时间：' + time + '</div>';
                              } else if (dataHotSpot[j].factorId == 50) {
                                  if (data.Value == null) {
                                      title += '<br />支座位移：无';
                                  } else {
                                      title += '<br />支座位移：' + data.Value.toFixed(2) + " " + data.Unit;
                                  }
                                  title += '<br/><div style="word-break: keep-all;white-space:nowrap;">采集时间：' + time + '</div>';
                              } else if (dataHotSpot[j].factorId == 54) { //振动
                                  for (var ii = 0; ii < data.length; ii++) {
                                      time = MillisecondsToDateTime(data[ii].DateTime);
                                      if (data[ii].Data.length == 0) {
                                          title += '<br />' + data[ii].Name + "加速度：无";
                                      } else {
                                          title += '<br />' + data[ii].Name + "加速度：" + data[ii].Data[0].toFixed(2) + " " + data[ii].Unit;
                                      }
                                  }
                                  title += '<br/><div style="word-break: keep-all;white-space:nowrap;">采集时间：' + time + '</div>';
                              } else if (dataHotSpot[j].factorId == 53) { //焊缝应变
                                  if (data[0].AcquisitionTime == null) {
                                      title += '<br />无最新数据';
                                  } else {
                                      title += "<br/><div style='text-align:center;'>";
                                      title += "<br/>杆件截面传感器分布<br/><table border='1'><tr><th>编号</th>";
                                      var temp1 = "";
                                      var temp2 = "";
                                      for (var ii = 0; ii < data.length; ii++) {
                                          temp1 += "<td style='word-break: keep-all;white-space:nowrap;'>" + data[ii].Param3 + "</td>";
                                          if (data[ii].Value == null) {
                                              temp2 += "<td style='word-break: keep-all;white-space:nowrap;'>无</td>";
                                          } else {
                                              temp2 += "<td style='word-break: keep-all;white-space:nowrap;'>" + data[ii].Value.toFixed(2) + "</td>";
                                          }
                                      }
                                      time = new Date(parseInt(data[0].AcquisitionTime.substring(6, 19)));
                                      time = MillisecondsToDateTime(time);
                                      title += temp1 + "</tr><tr><th style='word-break: keep-all;white-space:nowrap;'>应变(" + data[0].Unit + ")</th>" + temp2;
                                      title += "</tr><tr><th style='word-break: keep-all;white-space:nowrap;'>时间</th><td style='word-break: keep-all;white-space:nowrap;' colspan='" + data.length + "'>" + time + "</td></tr></table></div>";
                                  }

                              } else if (dataHotSpot[j].factorId == 52) { //杆件应力
                                  title += "<br/><div style='text-align:center;'>";
                                  title += "<br/>杆件截面传感器分布<br/><table border='1'><tr><th>编号</th>";
                                  var temp1 = "";
                                  var temp2 = "";
                                  for (var ii = 0; ii < data.data.length; ii++) {
                                      temp1 += "<td style='word-break: keep-all;white-space:nowrap;'>" + data.data[ii].Param3 + "</td>";
                                      if (data.data[ii].Value == null) {
                                          temp2 += "<td style='word-break: keep-all;white-space:nowrap;'>无</td>";
                                      } else {
                                          temp2 += "<td style='word-break: keep-all;white-space:nowrap;'>" + data.data[ii].Value.toFixed(2) + "</td>";
                                      }
                                  }
                                  title += temp1 + "</tr><tr><th>应变(" + data.data[0].Unit + ")</th>" + temp2;
                                  title += "</tr><tr><th style='word-break: keep-all;white-space:nowrap;'>主应力(" + data.Unit + ")</th><td colspan='" +
                                   data.data.length + "'>" + data.Value.toFixed(2) + "</td><tr><th style='word-break: keep-all;white-space:nowrap;'>时间</th><td style='word-break: keep-all;white-space:nowrap;' colspan='" +
                                   data.data.length + "'>" + time + "</td></tr></table></div>";
                              }
                              temTitle = title;
                          },
                          error: function(xhr) {
                              if (xhr.status == 403) {
                                  alert("权限验证出错");
                                  logOut();
                              } else if (xhr.status !== 0) { // aborted requests should be just ignored and no error message be displayed
                                  //alert("获取结构物热点时发生异常.\r\n" + xhr.status + " : " + xhr.statusText);
                                  title = title.split("<br />数据加载中")[0];
                              }
                              title += '<br />最新数据获取有误';
                              temTitle = title;
                          }
                      });

                  }
              }
          }
      }
  }

  , getTitle: function () {
      if (structType == structTypeRShell) {
          return temTitle.toString();
      } else {
          var title
            , $e = this.$element
            , o = this.options

          title = $e.attr('data-original-title')
            || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)

          var sensorId = $e.prop('id');
          if (sensorId != null) {
              var url = apiurl + '/hotspot/' + sensorId + '/data?token=' + getCookie('token');
              $.ajax({
                  url: url,
                  type: 'get',
                  async: false,
                  success: function (data) {
                      var t = '';
                      if (data != null && data.length > 0) {
                          for (var i = 0; i < data.length; i++) {
                              t += data[i].data;
                              t += '<br/>采集时间：' + data[i].time;
                              if (i != data.length - 1) t += "<br/>";
                          }
                          title = title.replace('无最新数据', t);
                      }
                  },
                  error: function (xhr) {
                      if (xhr.status == 403) {
                          alert("权限验证出错");
                          logOut();
                      } else if (xhr.status !== 0) {
                          title = title.replace("<br />无最新数据", '<br />最新数据获取有误');
                      }
                      title = title;
                  }
              });
          }

          return title;
      }
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , arrow: function(){
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

  $.fn.tooltip = function ( option ) {
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
