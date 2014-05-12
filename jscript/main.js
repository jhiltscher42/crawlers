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
	
	var Tests=[function(val){
		//The brit lives in the red house
		if (find(val,"nationality","Brit")!==find(val,"color","Red")) throw "The Brit doesn't live in the Red House";
		console.log(val);
		return val;
	}];

	function putToArray(ob,offset){
		var ret=[];
		for (var v in ob){
				ret.push(v);
			}
		return ret.splice(offset).concat(ret);
	}
	
	
	
	
	function _sequence(fns){
		//returns a function which takes a value and returns a promise which resolves with the last function in fns
		return function(val){
			console.log("sequence "+fns.length);
			var seqRet=new async_J.promise();
			var step=new async_J.promise();
			step.resolve(val);
			//fns[0]().then(fns[1]).then(fns[2])...
			fns.forEach(function(fn){
				step=step.then(fn);
				});

			step.then(seqRet.resolve,seqRet.reject);
			return seqRet;
		}
	}
	
	function isExhaustedIter(val){
		if (val===_Iterable.exhausted) return val;
		else throw val;
		}
	
	function runTests(iterable){
		var testRet=iterable.Next();
		testRet.then(_sequence(Tests))
			   .then(null,isExhaustedIter)
			   .then(null,runTests)
			   .then(outputPassedTest);
		return testRet;
		}
	
	function outputPassedTest(val){
		console.log(val);
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
		
		runTests(lists).then(console.log.bind(console,"OK"),console.error.bind(console));
	    });

    });
