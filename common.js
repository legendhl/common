﻿var $s = (function(){
	'use strict';
	var version = '0.0.5',
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
	
	//simple ua detect function
	that.ua = (function(){
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
			setTimeout(function(){isAbort = true;}, options.timeout);
		}
	}
	
	that.getParaFromJson = function(data, url) {
		if (typeof data === 'object') {
			url = url ? [url + (url.indexOf('?') > 0 ? '' : '?')] : [];
			for (k in data) {
				if (data.hasOwnProperty(k)) {
					url.push(k + '=' + encodeURIComponent(data[k]));
				}
			}
			return url.join('&');
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

	var isType = function(type) {
		return function(obj) {
			return toString.call(obj) === '[object ' + type + ']';
		}
	}

	that.isArray = isType('Array');
	that.isFunction = isType('Function');
	
	return that;
})();
