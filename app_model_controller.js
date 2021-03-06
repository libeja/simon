"use strict";
/**********************
  MODEL / CONTROLLER
**********************/

/* GAME STATE VARIABLES */
/*****************************/

var WIN_GOAL = 20;
var consoleIsOn = false;
var strictMode = false;

/** bool that interupts some functionality of buttons
    such as when there is a message to the player
  */
var holdButtonFunctons = false;

/*****************************/

function turnConsoleOn() {

  updateLED('ON');
  setTimeout(function() {
    updateLED('');
  }, 900);

  setTimeout(function() {
    updateLED('--');
    consoleIsOn = true;
  }, 1200);
}

function turnConsoleOff() {
  var strictButton = document.getElementById('strict-button');
  consoleIsOn = false;
  game.isPlayersTurn = false;
  strictMode = false;
  removeClass(strictButton, 'strict-button-on');
  game = new Game();
  playerChoice = outerFunctionPlayerChoice();
  updateLED('--');
  // blinkLED(1);
  setTimeout(function() {
    updateLED('');
  }, 1500);


}

function turnStrictModeOn() {
  strictMode = true;
}

function turnStrictModeOff() {
  strictMode = false;
}

// start button functionality
function startGame() {
  // var restart = false;
  if (consoleIsOn) {
    // if game is in progress, the will create a small delay before game restarts
    if (game.getCurrentCount() > 1) {
      game = new Game();
      playerChoice = outerFunctionPlayerChoice();
      updateLED('--');
      blinkLED(1);
      setTimeout(function() {
        computerTurn();
      }, 2000);
    } else {
      setTimeout(function() {
        computerTurn();
      }, 500);
    }

  }
}

function computerRandomChoice() {
  return Math.floor(Math.random() * 4);
}

/** will reset the game, either through player action or getting a wrong
    answer in strict mode.
  */
function resetGame() {
  game = new Game();
}

// when player reaches the WIN_GOAL number
function playerWin() {
  game.isPlayersTurn = false;
  holdButtonFunctons = true;
  updateLED('WIN!');
  blinkLED(3);
  setTimeout(function() {
    holdButtonFunctons = false;
    startGame();
  }, 4000);
}

// when a player guesses incorrectly
function wrongGuess() {
  game.isPlayersTurn = false;

  illuminateOn(0);
  illuminateOn(1);
  illuminateOn(2);
  illuminateOn(3);

  setTimeout(function() {
    illuminateOff(0);
    illuminateOff(1);
    illuminateOff(2);
    illuminateOff(3);
  }, 500);

  updateLED('--');
  blinkLED(2);

  setTimeout(function() {
    if (strictMode === true) {
      startGame();
    } else {
      setTimeout(function() {
        updateLED(game.getCurrentCount())
        displayComputerSelections();
      }, 1000);
    }
  }, 2000);


}

// function produces a closure to keep track of current round number
function outerFunctionPlayerChoice() {
  var guessNumber = 0;

  var inner = function(choice) {
    // correct guess
    if (choice === game.computerSelections[guessNumber]) {
      guessNumber++;

      if (guessNumber === WIN_GOAL) {
        guessNumber = 0;
        playerWin();
      } else if (guessNumber === game.computerSelections.length) {
        game.isPlayersTurn = false;

        guessNumber = 0;
        game.incrementCount();
        // --> go to computer's turn after slight pause
        setTimeout(function() {
          computerTurn();
        }, 1500);
      }

    // incorrect guess
    } else {
      guessNumber = 0;
      wrongGuess();
    }
  };
  return inner;
}
var playerChoice = outerFunctionPlayerChoice();



// constructor function creates new instance of game
function Game() {
  var currentCount = 1;
  this.strictMode = false;
  this.computerSelections = [];

  // this bool will allow/disallow interaction with app
  this.isPlayersTurn = false;

  this.incrementCount = function() {
    currentCount++;
  };
  this.getCurrentCount = function() {
    return currentCount;
  };
}
var game = new Game();

function computerTurn() {
  updateLED(game.getCurrentCount());
  var computerChoice = computerRandomChoice();

  game.computerSelections.push(computerChoice);

  displayComputerSelections();
}

function displayComputerSelections() {
  // this function will display the computer choices
  var displaySelection = function(selection, lastInSeries) {
    illuminateOn(selection);

    // create closure with IIFE to capture value of selection
    (function(selection) {
      setTimeout(function() {
        illuminateOff(selection);
        // if last in series, will change isPlayersTurn to true
        if (lastInSeries === true) {
          game.isPlayersTurn = true;
        }
        // the number below determines how long the ON/OFF state is
      }, 800);
    })(selection);
  };

  /** lastInSeries: bool, will be set to true once computer finishes displaying
      the last selection
    */

  var lastInSeries = false;


  for (var i = 0; i < game.computerSelections.length; i++) {
    // sets timeout function for increasingly longer periods of time

    // create closure with IIFE to capture value of i upon loop execution

    (function(y, lastInSeries) {
      if (y === game.computerSelections.length - 1) {
        lastInSeries = true;
      }
      setTimeout(function() {
        displaySelection(game.computerSelections[y], lastInSeries);
        // i * number determines the delay between computerSelections
      }, i * 1000);
    })(i, lastInSeries);

  } // END for-loop

} // END displayComputerSelection
