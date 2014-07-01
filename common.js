var $s = (function(){
	var version = '0.0.1',
		that = {};
	
	var $d = that.$d = document;
	
	that.$ = function(id) {
		return $d.getElementById(id);
	}
	
	/**
	 * @param url
	 * @param callback »Øµ÷º¯Êý
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
	
	return that;
})();