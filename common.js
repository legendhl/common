var $s = (function () {
  'use strict';
  var version = '0.0.9',
    that = {};
  
  var $d = that.$d = document;

  var toString = Object.prototype.toString;
  
  //ID selector
  that.$ = function(id) {
    return $d.getElementById(id);
  }
  
  //
  that.$$ = function(node, tag_name) {
    return (node || $d).getElementsByTagName(tag_name);
  }

  that.bind = function(node, evts, funcs) {
    if (node) {
      for (var i in evts) {
        if (window.attachEvent) {
          node.attachEvent('on' + evts[i], funcs[i]);
        } else {
          node.addEventListener(evts[i], funcs[i], false);
        }
      }
    }
  }
  
  //simple ua detect function
  that.ua = (function () {
    var ua_text = window.navigator.userAgent.toLowerCase();
    var ua = {};
    if (window.opera) {
      ua['opera'] = true;
    } else if (ua_text.indexOf('msie') != -1) {
      ua['ie'] = true;
      var ie_version = /msie\s+(.)/.exec(ua_text);
      if (ie_version){
        ua['ie'+ie_version[1]] = true;
      }
    } else if (ua_text.indexOf('webkit') != -1) {
      ua['webkit'] = true;
      if (ua_text.indexOf('chrome') != -1) {
        ua['chrome'] = true;
      } else if (ua_text.indexOf('ipad') != -1) {
        ua['ipad'] = true;
        ua['ios'] = true;
      } else if (ua_text.indexOf('safari') != -1) {
        ua['safari'] = true;
      }
    } else if (ua_text.indexOf('gecko') != -1) {
      ua['gecko'] = true;
      if (ua_text.indexOf('firefox') != -1) {
        ua['firefox'] = true;
      }
    }
    if (ua_text.indexOf('se 2.x') != -1){
      ua['se'] = true;
    }
    if (ua_text.indexOf('android') != -1){
      ua['and'] = true;
    }
    if (ua_text.indexOf('iphone') != -1){
      ua['ios'] = true;
    }
    return ua;
  })();
  
  /**
   * @param url
   * @param callback
   * @param options
   */
  that.jsonp = function(url, callback, options) {
    if (!url || !callback)
      return;

    options = options || {};
    var callbackName = options.callbackName || ('jsonp' + new Date().getTime()%10000 + Math.floor(Math.random()*10000)), isAbort = false, beginTime, endTime, script;

    window[callbackName] = function() {
      endTime = new Date();
      //uigsPBA({cost: endTime.getTime() - beginTime.getTime(), url:url}, 'interface_speed')
      if (!isAbort)
        callback.apply(this, arguments);
    }

    url = that.getParaFromJson(options.data, url);
    url = url+(url.indexOf('?') > 0?'&':'?')+(options.jsonp||'cb')+'='+callbackName;

    script = document.createElement('script');
    script.async = true;
    if (options.charset)
      script.charset = options.charset;
    script.src = url;
    document.body.appendChild(script);
    beginTime = new Date(); 
    if (options.timeout) {
      setTimeout(function () {isAbort = true;}, options.timeout);
    }
  }
  
  var getParaFromJson = that.getParaFromJson = function(data, url) {
    if (typeof data === 'object') {
      url = url ? url + (url.indexOf('?') > 0 ? '' : '?') : '';
      var params = [];
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          params.push(k + '=' + encodeURIComponent(data[k]));
        }
      }
      return url + params.join('&');
    }
    return url || '';
  }
  
  that.date2str = function(date, format) {
    var d = {y:date.getFullYear(), M:date.getMonth()+1, d:date.getDate(), h:date.getHours(), m:date.getMinutes(), s:date.getSeconds()};
    return format.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
      return ((v.length>1?'0':'') + d[v.slice(-1)]).slice(-(v.length>2?v.length:2))
    });
  }
  
  that.getByteLen = function(val) {
    val = val || '';
    var len = 0;
    for(var i=0; i<val.length; i++) {
      if(val.charAt(i).match(/[^\x00-\xff]/ig) != null)
        len += 2;
      else
        len += 1;
    }
    return len;
  }

  that.truncate = function(val, len) {
    val = val || '';
    var n = 0;
    for (var i=0; i<val.length; i++) {
      if (val.charAt(i).match(/[^\x00-\xff]/ig) != null)
        n += 2;
      else
        n += 1;
      if (n > len)
        return val.substring(0, i);
    }
    return val;
  }
  
  that.getCookie = function(name) {
    return ($d.cookie.match('(^|; )'+name+'=([^;]*)') || 0)[2];
  }
  
  that.setCookie = function(name, value, expireTime, domain) {
    var cookie_to_set = [name, '=', value], exp = new Date();
    if (expireTime != null) {
      exp.setTime(exp.getTime() + expireTime);
      cookie_to_set.push(';expires=' + exp.toGMTString());
    }
    cookie_to_set.push('; path=/');
    if (domain) {
      cookie_to_set.push('; domain=' + domain);
    }
    document.cookie = cookie_to_set.join('');
  }
  
  that.viewport = function() {
    //exclude the browser's scrollbar
    var e = $d.compatMode == 'BackCompat' ? 'body' : 'documentElement';
    return { width : $d[e].clientWidth, height : $d[e].clientHeight };
  }
  
  that.pagearea = function() {
    //include the browser's scrollbar
    var e = $d.compatMode == 'BackCompat' ? 'body' : 'documentElement';
    return { width : Math.max($d[e].clientWidth, $d[e].scrollWidth), height : Math.max($d[e].clientHeight, $d[e].scrollHeight) };
  }
  
  /*
  $s.ajax({
    type: 'GET|POST', default GET
    url: url of ajax,
    async: true|false, default true
    timeout: number
    dataType: 'xml|text', default text
    data: request,
    success: function(data){},
    error: function(req,text,error){}
  });
  */
  that.ajax = function(options) {
    var xhr, timer;
    if (window.XMLHttpRequest) {  // code for IE7+, Firefox, Chrome, Opera, Safari
      xhr = new XMLHttpRequest();
    } else {  // code for IE6, IE5
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (!xhr) return;
    options = options || {};
    var type = (!options.type || options.type == 'GET') ? 'GET' : 'POST',
      async = options.async === undefined ? true : !!options.async,
      dataType = (!options.dataType || options.dataType == 'text') ? 'text' : 'xml';
    if (async) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          clearTimeout(timer);
          if (xhr.status == 200) {
            typeof options.success === 'function' && options.success(dataType == 'text' ? xhr.responseText : xhr.responseXML);
          } else {//if (xhr.status == 404) {
            typeof options.error === 'function' && options.error(xhr.statusText);
          }
        }
      }
    }
    if (typeof options.timeout === 'number') {
      timer = setTimeout(function() {
        xhr.abort();
        typeof options.error === 'function' && options.error('timeout');
      }, options.timeout);
    }
    if (type == 'GET') {
      xhr.open('GET', getParaFromJson(options.data, options.url), async);
      xhr.send();
    } else {
      xhr.open('POST', options.url, async);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(getParaFromJson(options.data));
    }
  }

  var isType = function(type) {
    return function(obj) {
      return toString.call(obj) === '[object ' + type + ']';
    }
  }

  that.isArray = isType('Array');
  that.isFunction = isType('Function');

  var isElement = function(node) {
    return node && typeof node === 'object' && node.nodeType === 1;
  }

  that.addClass = function(node, cls) {
    if (!isElement(node) || !trim(cls)) {
      return;
    }
    var className = ' ' + node.className + ' ', classNames = cls.split(rSpace), i;
    for (i = 0; i < classNames.length; i++) {
      if (className.indexOf(' ' + classNames[i] + ' ') == -1) {
        className += ' ' + classNames[i] + ' ';
      }
    }
    node.className = trim(className);
  }

  that.removeClass = function(node, cls) {
    if (!isElement(node)) {
      return;
    }
    if (!trim(cls)) {
      node.className = '';
      return;
    }
    var className = ' ' + node.className + ' ', classNames = cls.split(rSpace), i;
    for (i = 0; i < classNames.length; i++) {
      if (className.indexOf(' ' + classNames[i] + ' ') >= 0) {
        className = className.replace(classNames[i] + ' ', '');
      }
    }
    node.className = trim(className);
  }

  that.hasClass = function(node, cls) {
    if (!isElement(node) || !trim(cls)) {
      return false;
    }
    var className = ' ' + node.className + ' ', classNames = cls.split(/\s+/), i;
    for (i = 0; i < classNames.length; i++) {
      if (className.indexOf(' ' + classNames[i] + ' ') == -1) {
        return false;
      }
    }
    return true;
  }

  var rLeftSpace = /^\s+/, rRightSpace = /\s+$/, rSpace = /\s+/;
  var trim = that.trim = function(str) {
    return str ? str.toString().replace(rLeftSpace, '').replace(rRightSpace, '') : '';
  }

  that.xml2json = function(xml) {
    var json, root;
    root = parseXML(xml);
    json = node2json(root);

    function parseXML(xml) {
      var xmlDoc;
      if (window.DOMParser) {
        xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
      } else {
        xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
        xmlDoc.async = 'false';
        xmlDoc.loadXML(xml);
      }
      return (xmlDoc.nodeType == 9) ? xmlDoc.documentElement : xmlDoc;
    }

    function jsVar(s) {
      return String(s || '').replace(/-/g, '_');
    }

    function node2json(node) {
      if (!node)
        return null;
      var txt = '', obj = null, att = null;
      var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName), nv = node.text || node.nodeValue || '';
      if (node.childNodes && node.childNodes.length > 0) {
        var i = 0, l = node.childNodes.length, cnode;
        for (; i < l; i++) {
          cnode = node.childNodes[i];
          var cnt = cnode.nodeType, cnn = jsVar(cnode.localName || cnode.nodeName), cnv = cnode.text || cnode.nodeValue || '';
          if (cnt === 8) {  //comment
            continue;
          } else if (cnt == 3 || cnt == 4 || !cnn) {
            if (cnv.match(/^\s+$/)) {
              continue;
            }
            txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
          } else {
            obj = obj || {};
            if (obj[cnn]) {
              if (!(obj[cnn] instanceof Array)) {
                obj[cnn] = [obj[cnn]];
              }
              obj[cnn].push(node2json(cnode));
            } else {
              obj[cnn] = node2json(cnode);
            }
          }
        }
      }
      if (node.attributes && node.attributes.length > 0) {
        att = {};
        obj = obj || {};
        for (var i = 0, l = node.attributes.length; i < l; i++) {
          var at = node.attributes[i], atn = jsVar(at.name), atv = at.value;
          att[atn] = atv;
          obj[atn] = atv;
        }
      }
      if (obj && txt) {
        obj._text = txt;
      }
      return obj || txt;
    }
    return json;
  }
  
  return that;
})();
