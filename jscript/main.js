require(["camera"],function(camera){
	$(function(){
		alert("OK");
		var myCamera=$("#viewCam").data("camera");
		myCamera.setModel({draw:function(gc,extants){}});
		myCamera.addHandler(['touchmove'],function(coords,touchEvt){
			alert(JSON.stringify(touchEvt));
			touchEvt.preventDefault();
		    });
	    });

    });
