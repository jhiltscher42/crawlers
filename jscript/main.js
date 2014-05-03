require(["camera"],function(camera){
	$(function(){
		var myCamera=$("#viewCam").data("camera");
		myCamera.setModel({draw:function(gc,extants){}});
	    });

    });
