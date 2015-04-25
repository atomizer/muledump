(function($, window) {

var VERSION = '0.6.2';

// version check

function cmpver(v1, v2) {
	v1 = v1.split('.'); v2 = v2.split('.');
	for (var i = 0; i < v1.length && i < v2.length; i++) {
		var r = v1[i] - v2[i];
		if (r) return r;
	}
	return v1.length - v2.length;
}

function checkversion() {
	function checkupd(data) {
		if (data.meta.status != 200) return;
		var d = data.data, topver = VERSION, url;
		for (var i = 0; i < d.length; i++) {
			if (cmpver(d[i].name, topver) > 0) {
				topver = d[i].name;
				url = d[i].zipball_url;
			}
		}
		var $u = $('#update');
		if (!url) {
			$u.text('latest version').delay(1000).hide(0);
			return;
		}
		var link = $('<a>').attr('href', url).text('download ' + topver);
		$u.replaceWith(link);
	}
	$.ajax({
		dataType: 'jsonp',
		url: 'https://api.github.com/repos/atomizer/muledump/tags',
		complete: function(xhr) {
			xhr.done(checkupd);
		}
	});
}


var mules = window.mules = {}

// document load

var accounts = window.accounts
var Mule = window.Mule

$(function() {
	$.ajaxSetup({
		cache: false,
		timeout: 5000
	});

	$('body').delegate('.item', 'click', window.toggle_filter);
	$('body').delegate('.guid', 'click', function(){ this.select(); });

	$('#reloader').click(function() {
		for (var i in mules) mules[i].reload();
	});

	$('#options').prev().click(function() {
		var $o = $('#options');
		if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
	});

	$('#update').one('click', function() {
		$(this).text('loading...').css('cursor', 'default');
		checkversion();
	});

	window.init_totals();

	for (var i in accounts) {
		mules[i] = new Mule(i);
	}
	for (i in mules) mules[i].query();

	if (!window.nomasonry) {
		$('#stage').masonry({
			itemSelector : '.mule',
			columnWidth : 198,
			transitionDuration: 0
		});
	}

	relayout();
});

var mtimer;

function relayout() {
	if (mtimer) return;
	mtimer = setTimeout(function() {
		window.update_totals();
		window.update_filter();
		if (!window.nomasonry) $('#stage').masonry('layout');
		mtimer = 0;
	}, 0);
}

window.relayout = relayout


})($, window)
