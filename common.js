var $s = (function(){
	'use strict';
	var version = '0.0.1',
		that = {};
	
	var $d = that.$d = document;
	
	//ID selector
	that.$ = function(id) {
		return $d.getElementById(id);
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
	 * @param callback 回调函数
	 * @param options
	 */
	that.jsonp = function(url, callback, options) {
		if (!url || !callback)
			return;

		options = options || {};
		var callbackName = options.callbackName || ('sogoup' + new Date().getTime()%10000 + Math.floor(Math.random()*10000)), isAbort = false, beginTime, endTime, script;

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
			url = url?[url+(url.indexOf('?') > 0?'':'?')]:[];
			for (k in data) {
				if (data.hasOwnProperty(k)) {
					url.push(k + '=' + encodeURIComponent(data[k]));
				}
			}
			return url.join('&');
		}
		return url;
	}
	
	that.date2str = function(date, format) {
		var d = {y:date.getFullYear(), M:date.getMonth()+1, d:date.getDate(), h:date.getHours(), m:date.getMinutes(), s:date.getSeconds()};
		return format.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
			return ((v.length>1?'0':'') + d[v.slice(-1)]).slice(-(v.length>2?v.length:2))
		});
	}
	
	return that;
})();
