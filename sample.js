$(function(){
    var x = 0;
    var y = 0;
    imgB = null;

    var _x;
    var _y;
    
    document.getElementById('fileSelect').addEventListener('change', loadImg, false);
	
	function loadImg(e) {
		var file = e.target.files[0];
		var imgA = new FileReader();
		imgA.onload = function(e) {
			imgB = new Image();
			imgB.onload = function() {
				var ctx = document.getElementById('world').getContext('2d');
				$("#world").attr("width",imgB.width);   
				$("#world").attr("height",imgB.height);
				ctx.drawImage(imgB, 0, 0);
			}
			
			imgB.src = e.target.result;
		};
		imgA.readAsDataURL(file);
	}
    
    var canvas = document.getElementById("world");
    var ctx = canvas.getContext("2d");

    $('#world').mousedown(function(e){
	var railhead = e.target.getBoundingClientRect();
	x = e.clientX-railhead.left;
	y = e.clientY-railhead.top;
	
	$("#txt1").val(x);
	$("#txt2").val(y);
	
	    $('#world').bind('mousemove',function(e){
		var railhead = e.target.getBoundingClientRect();
		_x = e.clientX-railhead.left;
		_y = e.clientY-railhead.top;
		
		if (imgB == null) {
			ctx.clearRect(0,0,canvas.width,canvas.height);
		} else {
			ctx.drawImage(imgB, 0, 0);
		}
		ctx.lineWidth = 5
		ctx.strokeStyle = "rgb(180, 180, 0)";
		ctx.strokeRect(x,y,_x-x,_y-y);
		
		$("#txt3").val(_x);
		$("#txt4").val(_y);
		
	    });
    });
    
    
    $('#world').mouseup(function(){
		$('#world').unbind('mousemove');
	});

});