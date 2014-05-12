require(["camera","async_J"],function(camera,async_J){

function _Iterable(){
		var colorIndex=0,nationalityIndex=0,drinkIndex=0,petIndex=0,smokeIndex=0;
	
		this.Next=function(){
			var ret=new async_J.promise();
			var vals=[{},{},{},{},{}];
			
			var colors=putToArray(HouseColor,colorIndex);
			var nationalities=putToArray(Nationalities,nationalityIndex);
			var smokes=putToArray(Smokes,smokeIndex);
			var pets=putToArray(Pets,petIndex);
			var drinks=putToArray(Drinks,drinkIndex);
			
			vals.forEach(function(val){
					val.color=colors.pop();
					val.nationality=nationalities.pop();
					val.drink=drinks.pop();
					val.pet=pets.pop();
					val.smoke=smokes.pop();
				});

			colorIndex++;
			if (colorIndex>4) 
			{
				colorIndex=0; nationalityIndex++;
				if (nationalityIndex>4)
				{
					nationalityIndex=0; drinkIndex++;
					if (drinkIndex>4)
					{
						drinkIndex=0; petIndex++;
						if (petIndex>4)
						{
							petIndex=0; smokeIndex++;
							if (smokeIndex>4)
							{
								ret.reject(_Iterable.exhausted);
								return ret;
							}
						}
					}
				}				
			}


				ret.resolve(vals);
			return ret;
		};
		
	};
	
_Iterable.exhausted="Iterable exhausted";


	var Nationalities={Swede:1,German:2,Norwegian:3,Brit:4,Dane:5};
	var Pets={Cats:6,Dogs:7,Horses:8,Birds:9,Fish:10};
	var Smokes={PallMall:11,Marlboro:12,Rothmans:13,Dunhill:14,Winfield:15};
	var Drinks={Water:16,Tea:17,Coffee:18,Beer:19,Milk:20};
	var HouseColor={Red:21,Green:22,Yellow:23,Blue:24,White:25};

	//A ResultSet is an array of 5 5-tuples [{HouseColor,Nationality,Smokes,Drinks,Pet}..]

	//An Iteratable gives {promise next();  which resolves with a result set or fails with exhausted Iterable}
	
	//An Iterator takes an Iterable and calls it's next() method until done
	
	//A Test takes a resultset and returns a promise.  the promise resolves with the result set on a pass, and rejects with a fail.

	function find(resultSet,name,val){
		//returns the tuple where tuple[name]==val;
		for (var n=0;n<resultSet.length;n++){
			if (resultSet[n][name]==val) return resultSet[n];
			}
		return null;
		}
	
	var testPassed=4;
	
	var Tests=[function(val){
		var ret=new async_J.promise();
		//The brit lives in the red house
		//if (find(val,"nationality","Brit")!==find(val,"color","Red")) throw "The Brit doesn't live in the Red House";
		if (testPassed-->0) ret.reject("test failed");
		else ret.resolve(val); 
		return ret;
	}];

	function putToArray(ob,offset){
		var ret=[];
		for (var v in ob){
				ret.push(v);
			}
		return ret.splice(offset).concat(ret);
	}
	
	
	function failed(val){
		var ret=new async_J.promise();
		console.log("failed",val);
		ret.reject(val);
		return ret;
		}
	
	function _sequence(fns){
		//returns a function which takes a value and returns a promise which resolves with the last function in fns
		console.log("making function");
		return function(val){
			console.log("sequence "+fns.length);
			var seqRet=new async_J.promise();
			var step=new async_J.promise();
			step.resolve(val);
			console.log("first step resolves to ",val);
			//fns[0]().then(fns[1]).then(fns[2])...
			fns.forEach(function(fn){
				//console.log(fn);
					console.log("step");
					step=step.then(fn,failed);
				});

			step.then(seqRet.resolve,seqRet.reject);
			return seqRet;
		}
	}
	
	function isExhaustedIter(val){
		console.log("exhausted?");
		if (val===_Iterable.exhausted){
			console.log("yes");
			return val;
			}
		else{
			console.log("no");
			throw val;
			}
		}
	
	function sayTesting(val){
		console.log("testing ",val);
		return val;
		}
	
	function runTests(iterable)
	{
		console.log("calling Next");
		var testRet=iterable.Next();
		console.log("Next called");
		testRet //.then(sayTesting)
				.then(_sequence(Tests))
			   .then(undefined,isExhaustedIter)
			   .then(undefined,function()
				{
					setTimeout(runTests.call(this,iterable),0);
					throw "not yet.";
					})
			   .then(outputPassedTest);
		return testRet;
	}
	
	function outputPassedTest(val){
		try{
			console.log(val);
			}
		catch(e)
			{
			console.log("error?");
			}
	}
	
	function take(iter,num)
	{
		var ret=new async_J.promise();
		var vals=[];
		function step()
		{
			iter.Next().then(function(val)
			{
				vals.push(val);
				num--;
				if (num<=0) ret.resolve(vals);
				else setTimeout(step,0);
			});
		}
		step();
		return ret;
	}
	
	$(function(){
		var myCamera=$("#viewCam").data("camera");
		myCamera.setModel({draw:function(gc,extants){}});
		myCamera.addHandler(['touchmove'],function(coords,touchEvt){
			alert(JSON.stringify(touchEvt));
			touchEvt.preventDefault();
		    });
		var lists=new _Iterable();
		
		runTests(lists);
	    });

    });
