require(["camera","async_J"],function(camera,async_J){

	//A ResultSet is an array of 5 5-tuples [{HouseColor,Nationality,Smokes,Drinks,Pet}..]

	//An Iteratable gives {promise next();  which resolves with a result set or fails with exhausted Iterable}
	
	//An Iterator takes an Iterable and calls it's next() method until done
	
	//A Test takes a resultset and returns a promise.  the promise resolves with the result set on a pass, and rejects with a fail.


	var Nationalities={Swede:1,German:2,Norwegian:3,Brit:4,Dane:5};
	var Pets={Cats:6,Dogs:7,Horses:8,Birds:9,Fish:10};
	var Smokes={PallMall:11,Marlboro:12,Rothmans:13,Dunhill:14,Winfield:15};
	var Drinks={Water:16,Tea:17,Coffee:18,Beer:19,Milk:20};
	var HouseColor={Red:21,Green:22,Yellow:23,Blue:24,White:25};

	//Permutations is N!

function Permutator(ob){
	var current,first;
	if (Array.isArray(ob)) first=ob.slice();
	else first=Object.keys(ob);
	current=first.slice();
	//no matter what we are given, we end up with an array.
	var Child;
	var pivotIndex=0;
	if (current.length>2){
		Child=new Permutator(current.slice(1));
	}
	
	function swap(in1,in2){
		var sw=current[in1];
		current[in1]=current[in2];
		current[in2]=sw;
	}
	
	this.Current=function(){return current.slice();}
	this.Next=function()
	{
		//change current to the next permutation.  if that permutation is the same as the first one, return true;
		if (first.length==0) return true;  //can't permute no items
		if (first.length==1) return true;  //only one permutation for one item
		if (first.length==2) swap(0,1);
		if (first.length>2)
		{
			var childTicked=Child.Next();
			current=current.slice(0,1).concat(Child.Current());
			if (childTicked)
			{
				console.log("child ticked",Child.Current());
				pivotIndex++;
				if (pivotIndex>=first.length) pivotIndex=0;
				swap(0,pivotIndex);
				console.log("new current:",JSON.stringify(current));
				Child=new Permutator(current.slice(1));
			}
		}
		
		for (var n=0;n<first.length;n++) 
		{
			if (current[n]!==first[n])
			{
				console.log(JSON.stringify(first),"!=",JSON.stringify(current));
				return false;
			}
		}
		return true;
	}
}

window.Permutator=Permutator;
	
function _Iterable(){
		var lastGen=null;

		var pColors=new Permutator(HouseColor);
		var pNationalities=new Permutator(Nationalities);
		var pSmokes=new Permutator(Smokes);
		var pPets=new Permutator(Pets);
		var pDrinks=new Permutator(Drinks);
	
		this.dump=function()
		{
			console.log(colorIndex,nationalityIndex,drinkIndex,petIndex,smokeIndex);
		}
		
		this.lastGen=function(){return lastGen;}
	
		this.Next=function(){
			var ret=new async_J.promise();
			var vals=[{},{},{},{},{}];
			var colors=pColors.Current();
			var nationalities=pNationalities.Current();
			var smokes=pSmokes.Current();
			var pets=pPets.Current();
			var drinks=pDrinks.Current();
			
			vals.forEach(function(val){
					val.color=colors.pop();
					val.nationality=nationalities.pop();
					val.drink=drinks.pop();
					val.pet=pets.pop();
					val.smoke=smokes.pop();
				});

			
			if (pColors.Next()) 
			{
				if (pNationality.Next())
				{
					if (pDrinks.Next())
					{
						if (pPets.Next())
						{
							if (pSmoke.Next())
							{
								ret.reject(_Iterable.exhausted);
								return ret;
							}
						}
					}
				}				
			}

				lastGen=vals;
				ret.resolve(vals);
			return ret;
		};
		
	};
	
	
	_Iterable.exhausted="Iterable exhausted";


	function find(resultSet,name,val){
		//returns the index where tuple[name]==val;
		for (var n=0;n<resultSet.length;n++){
			if (resultSet[n][name]==val) return n;
			}
		return -1;
		}
	
	var testPassed=4;
	
	function makeMatch2(key1,val1,key2,val2,ruleText)
	{
		return function(val)
		{
			var ret=new async_J.promise();
			if (!val) {
				ret.reject("lost");
				console.log("lost?!");
				}
			else if (find(val,key1,val1)!==find(val,key2,val2)) {
				ret.reject(ruleText);
				}
			else ret.resolve(val);
			return ret;
		}
	}
		
	function isPosition(key1,val1,position,ruleText){
		return function(val){
			var ret=new async_J.promise();
			if (val[position][key1]!==val1) ret.reject(ruleText);
			else ret.resolve(val);
			return ret;
		}
	}
	
	function isNextTo(key1,val1,key2,val2,ruleText){
		return function(val){
			var ret=new async_J.promise();
			if (Math.abs(find(val,key1,val1)-find(val,key2,val2))!=1) ret.reject(ruleText);
			else ret.resolve(val);
			return ret;
		}
	}
		
	var BritIsRed=makeMatch2("nationality","Brit","color","Red","The Brit doesn't live in the Red House");
	var SwedeKeepsDogs=makeMatch2("nationality","Swede","pet","Dogs","The Swede doesn't keep Dogs");
	var DaneDrinksTea=makeMatch2("nationality","Dane","drink","Tea","The Dane doesn't drink Tea");
	function GreenHouseIsOnTheLeftOfWhite(val){
		var ret=new async_J.promise();
		if (find(val,"color","Green")>find(val,"color","White")) ret.reject("The Green House is on the wrong side of the White House");
		else ret.resolve(val);
		return ret;
	}
	var GreenOwnerDrinksCoffee=makeMatch2("color","Green","drink","Coffee","The Green owner doesn't drink Tea");
	var PallMallSmokerHasBirds=makeMatch2("smoke","PallMall","pet","Birds","The Pall Mall smoker doesn't have birds");
	var YellowOwnerSmokesDunhill=makeMatch2("color","Yellow","smoke","Dunhill","The Yellow owner doesn't smoke Dunhill");
	var CenterOwnerDrinksMilk=isPosition("drink","Milk",2,"The owner of the center house doesn't drink Milk");
	var NorwegianLivesLeftmost=isPosition("nationality","Norwegian",0,"The Norwegian doesn't live in the first house");
	var MarlboroSmokerNextToCatOwner=isNextTo("smoke","Marlboro","pet","Cats","The Marlboro smoker is not next to the cat owner");
	var HorseOwnerNextToDunhillSmoker=isNextTo("smoke","Dunhill","pet","Horses","The Dunhill smoker is not next to the horse owner");
	var WinfieldSmokerDrinksBeer=makeMatch2("smoke","Winfield","drink","beer","The Winfield smoker doesn't drink beer");
	var GermanSmokesRothmans=makeMatch2("nationality","German","smoke","Rothmans","The German doesn't smoke Rothmans");
	var NorwegienLivesNextToBlueHouse=isNextTo("nationality","Norwegian","color","Blue","The Norwegian is not next to the Blue House");
	var MarlboroSmokerNextToWaterDrinker=isNextTo("smoke","Marlboro","drink","water","The Marlboro smoker is not next to the water drinker");
	
	var Tests=[	BritIsRed,
				SwedeKeepsDogs,
				DaneDrinksTea,
				GreenHouseIsOnTheLeftOfWhite,
				GreenOwnerDrinksCoffee,
				PallMallSmokerHasBirds,
				YellowOwnerSmokesDunhill,
				CenterOwnerDrinksMilk,
				NorwegianLivesLeftmost,
				MarlboroSmokerNextToCatOwner,
				HorseOwnerNextToDunhillSmoker,
				WinfieldSmokerDrinksBeer,
				GermanSmokesRothmans,
				NorwegienLivesNextToBlueHouse,
				MarlboroSmokerNextToWaterDrinker];

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
		//console.log("making function");
		return function(val){
			//console.log("sequence "+fns.length);
			var seqRet=new async_J.promise();
			var step=new async_J.promise();
			step.resolve(val);
			//console.log("first step resolves to ",val);
			//fns[0]().then(fns[1]).then(fns[2])...
			fns.forEach(function(fn){
				//console.log(fn);
				//	console.log("step");
					step=step.then(fn,failed);
				});

			step.then(seqRet.resolve,seqRet.reject);
			return seqRet;
		}
	}
	
	function allTests(fns)
	{
		return function(val)
		{
			var IPassed=new async_J.promise();
			async_J.all(fns.map(function(f){return f(val);}))
				.then(function(v){console.log("all passed",v); return v},failed)
				.then(IPassed.resolve.bind(IPassed,val),IPassed.reject);
			return IPassed;
		}
	}
	
	function isExhaustedIter(val){
		//console.log("exhausted?");
		if (val===_Iterable.exhausted){
			//console.log("yes");
			return val;
			}
		else{
			//console.log("no");
			throw val;
			}
		}
	
	function sayTesting(val){
		console.log("testing ",val);
		return val;
		}
	
	window.Tests=Tests;
	window._sequence=_sequence;
	
	function runTests(iterable)
	{
		//console.log("calling Next");
		var testRet=iterable.Next();
		//console.log("Next called");
		testRet //.then(sayTesting)
				.then(allTests(Tests))
			   .then(outputPassedTest)
			   .then(undefined,isExhaustedIter)
			   .then(undefined,runTests.bind(this,iterable));
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
				else setTimeout(step,1);
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
		window.lists=lists;
		
		//runTests(lists).then(undefined,console.error.bind(console));
	    });

    });
