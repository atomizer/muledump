var EXPORTS = 'txt csv json png'.split(' ');

$(function() {
	var $ex = $('#export');
	for (var i = 0; i < EXPORTS.length; i++) {
		$ex.append($('<div>').text(EXPORTS[i].toUpperCase()));
	}
	$ex.on('click', 'div', export_totals);
});

function export_totals() {
	function txtaggr(type) {
		var e = {txt: [], csv: [], json: {}};
		for (var i = 0; i < ids.length; i++) {
			var id = ids[i];
			if (!totals[id]) continue;
			var name = items[id][0], amt = totals[id];
			e.txt.push(amt + '\t' + name);
			e.csv.push('"' + name + '",' + amt);
			e.json[name] = amt;
		}
		e.txt = e.txt.join('\n');
		e.csv = e.csv.join('\n');
		e.json = JSON.stringify(e.json);
		return 'data:text/plain;base64,' + btoa(e[type]);
	}
	var $this = $(this);
	var type = $this.text().toLowerCase();
	if (!~EXPORTS.indexOf(type)) return;
	
	if (type != 'png') {
		window.open(txtaggr(type), '_blank');
		return;
	}
	
	try {
		var r = render_totals();
		if (!$.support.cors) {
			window.open(r, '_blank');
			return;
		}
	} catch (e) {
		$this.remove();
		alert('Sorry, your browser doesn\'t support this feature.');
	}
	
	$this.text('...');
	var req = imgur(r.split(',')[1]);
	req.complete(function() {
		$this.text('PNG');
	}).success(function(data) {
		if (!data.upload) return;
		prompt('Your image:', data.upload.links.original);
	}).error(function(xhr, err, errDesc) {
		alert('imgur upload failed: ' + xhr.status + (errDesc ? ' ' + errDesc : ''));
	});
}

function render_totals() {
	var img = $('#renders')[0];
	var $c = $('<canvas>'), c = $c[0];
	var w = $totals.innerWidth(), h = $totals.innerHeight();
	c.width = w; c.height = h;
	var ct = c.getContext('2d');
	ct.font = 'bold 15px Arial,sans-serif';
	ct.textBaseline = 'bottom';
	ct.textAlign = 'right';
	ct.shadowColor = 'black';
	ct.fillStyle = '#363636';
	ct.fillRect(0, 0, c.width, c.height);
	ct.fillStyle = '#545454';
	ct.strokeStyle = '#fefe8e';
	ct.lineWidth = 2;
	var m = (h - Math.floor(h / 44) * 44 + 4) / 2;
	var x = m, y = m;
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i], it = items[id];
		if (!totals[id]) continue;
		ct.save();
		ct.translate(x, y);
		if (id in filter) ct.fillStyle = '#ffcd57';
		ct.fillRect(0, 0, 40, 40);
		if (id in filter) ct.strokeRect(0, 0, 40, 40);
		ct.drawImage(img, it[3], it[4], 40, 40, 0, 0, 40, 40);
		if (totals[id] > 1) {
			ct.save();
			ct.fillStyle = 'white';
			ct.shadowBlur = 3;
			for (var k = 0; k < 4; k++) {
				ct.shadowOffsetX = k % 2 ? k - 2 : 0;
				ct.shadowOffsetY = k % 2 ? 0 : k - 1;
				ct.fillText(totals[id], 36, 38);
			}
			ct.restore();
		}
		ct.restore();
		x += 44;
		if (w - x < 40) { x = m; y += 44; }
	}
	var r = c.toDataURL();
	$c.remove();
	return r;
}

function imgur(data) {
	return $.ajax({
		type: 'POST',
		url: 'http://api.imgur.com/2/upload.json',
		data: {
			key: 'f40bf748ca9513f4ada2c3bf15e4f008',
			image: data,
			type: 'base64',
		},
		dataType: 'json',
	});
}


