		// Mean and Expected Value	
		function getMean(arr){
			var sum = arr.reduce((a,b)=>(a+b));
			return (sum/arr.length);
			}

		// Spread: Investigating the shape of an array of numbers.
		function meanAdjust(arr){
			var mean = getMean(arr);
			return arr.map(value => (value-mean));
		}

		function getSimplifiedDeviation(arr){
			var deviations = meanAdjust(arr).map(value => Math.abs(value));
			return getMean(deviations)
		}

		function getVariance(arr){
			var squaredDeviations = meanAdjust(arr).map(value => value*value); 
			return getMean(squaredDeviations)
		}

		function getStandardDev(arr){
			return (Math.sqrt(getVariance(arr)))
		}


		// Relationship: Investigating whether changes in one attribute reflect changes in another attribute.
		 
	
		function getVarByIndex(bivariateArray,index) {
			return bivariateArray.map(pair => pair[index])
		} 

		function getCentered(bivariateArray) {
			var xArray = getVarByIndex(bivariateArray,0);
			var yArray = getVarByIndex(bivariateArray,1);	
			var xCentered = meanAdjust(xArray);
			var yCentered = meanAdjust(yArray);
			return xCentered.map((value,index) => [value,yCentered[index]])
		}
		 
		function getCovariance(bivariateArray) {
			var pairwiseProducts = getCentered(bivariateArray).map(pair => pair[0] * pair[1]);
			return getMean(pairwiseProducts);
		}

		function getScaled(array,scale) {
			return array.map(value => value*scale)
		}

		function getNormalized(array) {
			var sorted = array.sort((a,b)=>a-b);
			var norm = sorted[sorted.length-1] - sorted[0];
			return getScaled(array,1/norm);
		}

		function getStandardized(array) {
			var centered = getCentered(array);
			var standardDev = getStandardDev(array);
			return getScaled(array,1/standardDev);
		}

		function getCorrelation(bivariateArray){
			var covariance = getCovariance(bivariateArray);
			
			var xDeviation = getStandardDev(bivariateArray.map(value => value[0]));
			var yDeviation = getStandardDev(bivariateArray.map(value => value[1]));
			
			return (covariance/(xDeviation*yDeviation));
		}



		// Approximation: Comparing an observed relationship to a mathematical function.

		function meanSquaredError(bivariateArray,getApproximation){
			
			var pairwiseErrors = bivariateArray.map(function (pair,index) {
				var x = pair[0];
				var y = pair[1];
				var approx = getApproximation(x);
				return (y - approx)
				})
				
			var squaredErrors = pairwiseErrors.map((value)=>Math.pow(value,2));	
			return getMean(squaredErrors);
		}


		function getBestLineByLeastSquares(bivariateArray){
			var xArray = bivariateArray.map(value => value[0]);
			var yArray = bivariateArray.map(value => value[1]);
			
			var xVariance = getVariance(xArray)
			var covariance = getCovariance(bivariateArray)
			var slope = covariance/xVariance
			
			var xMean = getMean(xArray);
			var yMean = getMean(yArray);
			var yIntercept = yMean - slope*xMean
			
			return function(x) {return yIntercept + slope*x}
		}
		
		linearRegression = getBestLineByLeastSquares;

