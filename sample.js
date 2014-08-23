$(function(){
	var x = 0;
	var y = 0;
	var imgB = null;

	var _x;
	var _y;
	
	var drawFlag = false;
	var oldX = 0;
	var oldY = 0;
	var change = 1;
    
	document.getElementById('fileSelect').addEventListener('change', loadImg, false);

	
	function loadImg(e) {
		var file = e.target.files[0];
		var imgA = new FileReader();
		imgA.onload = function(e) {
			imgB = new Image();
			imgB.onload = function() {
				var ctx = document.getElementById('world').getContext('2d');
				var ctx2 = document.getElementById('world3').getContext('2d');
				$("#world").attr("width",imgB.width);   
				$("#world").attr("height",imgB.height);
				$("#world3").attr("width",imgB.width);   
				$("#world3").attr("height",imgB.height);
				ctx.drawImage(imgB, 0, 0);
				ctx2.fillStyle = 'rgb(0, 0, 0)'
				ctx2.fillRect(0,0,canvas.width,canvas.height);
			}
			
			imgB.src = e.target.result;
		};
		imgA.readAsDataURL(file);
	}
	
	var canvas = document.getElementById("world");
	var ctx = canvas.getContext("2d");
	var canvas2 = document.getElementById("world3");
	var ctx2 = canvas2.getContext("2d");
	
	$('#rect').click(function() {
		change = 1;
	});
	
	$('#mask').click(function() {
		change = 2;
	});

	$('#world').mousedown(function(e){
	var railhead = e.target.getBoundingClientRect();
	x = e.clientX-railhead.left;
	y = e.clientY-railhead.top;
	oldX = e.clientX-railhead.left;
	oldY = e.clientY-railhead.top;
	drawFlag = true;
	ctx2.fillRect(0,0,canvas.width,canvas.height);
	
	if (change == 1) {
		$("#txt1").val(x);
		$("#txt2").val(y);
	}
	
	    $('#world').bind('mousemove',function(e){
		var railhead = e.target.getBoundingClientRect();
		_x = e.clientX-railhead.left;
		_y = e.clientY-railhead.top;
		
		if (change == 1) {
			if (imgB == null) {
				ctx.clearRect(0,0,canvas.width,canvas.height);
			} else {
				ctx.drawImage(imgB, 0, 0);
			}
			ctx.lineWidth = 5
			ctx.strokeStyle = "rgb(180, 180, 0)";
			ctx.strokeRect(x,y,_x-x,_y-y);
		}
		
		if (change == 2) {
			if (imgB == null) {
				ctx.clearRect(0,0,canvas.width,canvas.height);
			}
			var xx = e.clientX-railhead.left;
			var yy = e.clientY-railhead.top;
			ctx.strokeStyle = "rgba(255,0,0,1)";
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.lineWidth = 20;
			ctx.beginPath();
			ctx.moveTo(oldX, oldY);
			ctx.lineTo(xx, yy);
			ctx.stroke();
			ctx.closePath();
			
			ctx2.strokeStyle = "rgba(255,255,255,1)";
			ctx2.lineJoin = "round";
			ctx2.lineCap = "round";
			ctx2.lineWidth = 20;
			ctx2.beginPath();
			ctx2.moveTo(oldX, oldY);
			ctx2.lineTo(xx, yy);
			ctx2.stroke();
			ctx2.closePath();
			
			oldX = xx;
			oldY = yy;
			
			
			img_src = canvas2.toDataURL("image/jpeg");
			document.getElementById("image_png").src = img_src;
			document.getElementById("can").value = img_src;
			console.log(document.getElementById("can"));
		}
		
		if(change == 1) {
			$("#txt3").val(_x);
			$("#txt4").val(_y);
		}
		
	    });
    });

    $('#world').mouseup(function(){
		$('#world').unbind('mousemove');
		drawFlag = false;
		if (change == 2) {
			ctx.drawImage(imgB, 0, 0);
			
			var cc = ctx;
			cc.lineWidth = 5
			cc.strokeStyle = "rgb(180, 180, 0)"
			cc.strokeRect($("#txt1").val(),$("#txt2").val(),$("#txt3").val()-$("#txt1").val(),$("#txt4").val()-$("#txt2").val());
		}
	});

});