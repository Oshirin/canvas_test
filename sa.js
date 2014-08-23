$(function(){
    var x = 0;
    var y = 0;
    imgBb = null;

    var _x;
    var _y;
    
    document.getElementById('gousei').addEventListener('change', loadImg, false);
	
	function loadImg(e) {
		var file = e.target.files[0];
		var imgA = new FileReader();
		imgA.onload = function(e) {
			imgBb = new Image();
			imgBb.onload = function() {
				var ctx = document.getElementById('world2').getContext('2d');
				$("#world2").attr("width",imgBb.width);   
				$("#world2").attr("height",imgBb.height);
				ctx.drawImage(imgBb, 0, 0);
			}
			
			imgBb.src = e.target.result;
		};
		imgA.readAsDataURL(file);
	}
    
    var canvas = document.getElementById("world2");
    var ctx = canvas.getContext("2d");

    $('#world2').mousedown(function(e){
	var railhead = e.target.getBoundingClientRect();
	x = e.clientX-railhead.left;
	y = e.clientY-railhead.top;
	
	$("#txt11").val(x);
	$("#txt22").val(y);
	
	    $('#world2').bind('mousemove',function(e){
		var railhead = e.target.getBoundingClientRect();
		_x = e.clientX-railhead.left;
		_y = e.clientY-railhead.top;
		
		if (imgBb == null) {
			ctx.clearRect(0,0,canvas.width,canvas.height);
		} else {
			ctx.drawImage(imgBb, 0, 0);
		}
		ctx.lineWidth = 5
		ctx.strokeStyle = "rgb(180, 180, 0)";
		ctx.strokeRect(x,y,_x-x,_y-y);
		
		$("#txt33").val(_x);
		$("#txt44").val(_y);
		
	    });
    });
    
    
    $('#world2').mouseup(function(){
		$('#world2').unbind('mousemove');
	});

});