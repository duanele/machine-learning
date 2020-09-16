/*
  * What is it we're modeling?
  * The end goal is to model economic phenomena. And to 'combine' those models to model higher
  * level economic phenomena.
  * Modeling a single economic actor and how they make decisions.
  * Are people rational or is there something else going on? (Inductive reasoning).
  * Perfect information? What happens when you don't have it?
  *
  * Model a basic economic interaction (whether to purchase something) with perfect rationality.
  * Then model it with inductive reasoning.
  *
  *"Should you go to the bar tonight?"
  *
  * Bar is fun (+) if between (inclusive) 35 and 65 people show up.
  * Bar sucks (-) if less than 35 or more than 65 show up.

  * TODO Make it so we can tune initial conditions.
  * TODO Write more algorithms.
  * TODO Automate part of our analysis (bar attendance by algorithm)
  * TODO What if people's decisions changed based on algorithm performance (learning)?
*/

/*add button and visualization for iteration
  var puzzle = document.getElementById('puzzle')
  var button = document.getElementById('solution-button')
  button.addEventListener('click', function (event) {
    puzzle.src = '/images/Original-Think-Outside-the-Box-Solution.gif'
  }, false)
*/




// The algorithms, defined as functions below, that people can use as predictors.
var baseAlgos = [go, lastWeek, historicalMean,historicalMedian,historicalTrend]

// make 100 people
var people = []
for (var i = 0; i < 100; i += 1) {people.push(personMaker())};

// initialize history and Iterate 200 times
var barAttendanceHistory = [40, 30, 90]
for (var j = 0; j < 200; j += 1) {iterate(people, barAttendanceHistory)}

// Show the types of methods the people we made have
var peopleByType = []
people.forEach( function(person) {
  var type = person.method.algo.name + ", " +person.method.memSpan + ", " +person.method.contrarian
  peopleByType.push(type);
})
peopleByType.sort();
console.log(peopleByType);

people.sort( function (a,b) {
    if (a.method.algo.name < b.method.algo.name) {return -1}
    else if (a.method.algo.name > b.method.algo.name) {return 1}
    else {
      if (a.method.memSpan < b.method.memSpan) {return -1}
      else if (a.method.memSpan > b.method.memSpan) {return 1}
      else { 
        if (a.method.contrian < b.method.contrarian) {return -1}
        else if (a.method.contrarian > b.method.contrian) {return 1}
        else {return 0} 
      }
    }
  })
/*
 * PERSON MAKER
 * @param {string} model - the final html to send
 * @returns {boolean} true/false - go / no go
 *
 * Each person comes with three attributes and 2 methods
 *  Attribute 1 - decision-making method, determined by an algorithm, memory span, and contrarian-ness
 *  Attribute 2 - description of what the person does tonight based on current history
 *  Attribute 3 - record of past decisions, attendance, and successes
 *  Method 1 - apply the person's algorithm, possibly limited by memory span, to predict tonight's attendance
 *  Method 2 - decide whether to attend, based on a prediction, and the person's contrarian-ness
 */

function personMaker () {
  return {
    method: {
      algo: baseAlgos[Math.floor(Math.random() * baseAlgos.length)],
      memSpan: [Infinity,Math.floor(Math.random()*5)+5][Math.floor(Math.random()*2)],
      contrarian: !!(Math.floor(Math.random()*2))
    },
    tonight: {prediction: 0, going: new Boolean()},
    record: {predictions: [], attendance: [],successfulGuesses: 0},
    makePrediction:
      function (history) {
        var algo = this.method.algo;
        var memSpan = this.method.memSpan;
        var lengthHistory = history.length;
        if (memSpan >= lengthHistory) {this.tonight.prediction = algo(history)}
        else {
          var memorableHistory = history.slice(lengthHistory-memSpan,lengthHistory);
          this.tonight.prediction = algo(memorableHistory);
        }
        this.record.predictions.push(this.tonight.prediction);
      },
    decideIfGoing:
      function () {
        var inRange = isInRange(this.tonight.prediction);
        this.tonight.going = (this.method.contrarian ? !inRange : inRange);
        this.record.attendance.push(this.tonight.going);
}}}



/* One iteration.
* Based on the current history, each person predicts tonight's attendance and decides whether to go.
* The total attendance is added to the history.
* Each person records whether they made the right choice.
*/
function iterate (people, barAttendanceHistory) {
  var attendance = 0;
  people.forEach( function (person) {
      person.makePrediction(barAttendanceHistory);
      person.decideIfGoing();
      attendance += person.tonight.going
  })
  var isGoodNight = isInRange(attendance);
  people.forEach(person => person.record.successfulGuesses += (person.tonight.going === isGoodNight))
  barAttendanceHistory.push(attendance)
}
console.log(barAttendanceHistory)


/*
* ALGOS (Should I go to the bar?)
* The algorithms each accept a numerical array representing the history of weekly bar attendance.
* They return a number, representing the attendance expected by the algorithm this week.
*/


// just go
function go (history) {
  return true
}

// Same as last week
function lastWeek (history) {
  return history[history.length - 1]
}

// mean all history
function historicalMean (history) {
  var sum = history.reduce((total, current) => total + current)
  return sum / history.length;
}

//Median of all history
function historicalMedian (history) {
  history.sort((a,b)=>(a-b));
  var length = history.length;
  var isOdd = Boolean(history.length%2);
  return (isOdd ? history[(length-1)/2] : historicalMean(history.slice(history.length/2-1,history.length+1)))
}

// the trend for all of history (OLS simple linear regression)
function historicalTrend(history){
  var historyArray = history.map((value,index)=>[index,value])
  var linearFunction = linearRegression(historyArray)
  var x = history.length;
  return linearFunction(x)
}

/*
* Other possible algorithms:
* if less than 35 last week, definitly go this time
* if more than 65 last week, definitly go this time
* the first 3 weeks mean (traditionalist)
* do what your friends are doing (for later)
* do what people like you are doing (for later)
*/


function isInRange(prediction) {
return prediction >= 35 && prediction <= 65;
}


var chart = document.getElementById("chart")
var numberSpan = `<span class="number">{{number}}</span>`;
var htmlString = ""
barAttendanceHistory.forEach( function(entry,index) {
  var num = `<span class="number">${entry}</span>`
  var peopleString = ""
  people.forEach( function(player){
    if (player.record.attendance[index-3]) {
      var person = `<span class="person ${player.method.algo.name} ${player.method.contrarian ? 'contrarian' : ''}"></span>`
      peopleString += person
    }
  })
  var peeps = `<span class="people">${peopleString}</span>`
  var row = `<div class="row">${num} ${peeps}</div>`
  htmlString += row
})
chart.innerHTML = htmlString

