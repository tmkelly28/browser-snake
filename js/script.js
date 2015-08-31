//// Globals ////

var snakeMovementInterval;
var score = 0;

//// Constructors ////

// DomPiece constructor
function DomPiece(elem, snake, id, left, top) {
  // makes it easier for Snake.prototype.grow to create new objects for the DOM-implementation of Snake
  this.elem = elem;
  this.clss = snake;
  this.id = id;
  this.left = left;
  this.top = top;
}

// Snake constructor
function Snake() {
  /* implementation-agnostic x,y coordinates representating the snake
   array of arrays, each inner array contains an integer representing x and y
  */
  this.coords = [[300, 300]];
  /* DOM-implementation of snake
     array of objects, each object contains 5 keys
      elem: the HTML element to represent a piece of the snake in the DOM, always "div"
      clss: the class of the HTML element representing a piece of the snake in the DOM, always "snake"
      id: unique id selector for each div element
      left: the left position of the snake element, used to convert the actual css styling
      top: the top position of the snake element, used to convert the actual css styling
  */
  this.elements = [{elem:"div", 
                    clss:"snake", 
                    id: 1, 
                    left: this.coords[0][0], 
                    top: this.coords[0][1]}];
}
Snake.prototype.moveSnake = function(x, y) {
  // moves the implementation-agnostic x,y coordinates for each piece of the snake
  for (var i = 0; i < this.coords.length; i++) {
    this.coords[i][0] += x;
    this.coords[i][1] += y;
  }
};
Snake.prototype.grow = function(x, y) {
  // adds new x, y array of coordinates to the implementation-agnostic representation of the snake
  var newTail = [(this.coords[this.coords.length - 1][0] + x), 
                 (this.coords[this.coords.length - 1][1] + y)];
  this.coords.push(newTail);
  // adds a new SnakePiece to the DOM implementation of the snake, and casts it in the DOM
  this.elements.push(new DomPiece("div", "snake",
                      this.elements[this.elements.length - 1]["id"] + 1, 
                      this.coords[this.coords.length - 1][0], 
                      this.coords[this.coords.length - 1][1]));
  castElementInDOM(this.elements[this.elements.length - 1]);
};

// Apple constructor
function Apple(x, y) {
  // implementation-agnostic x,y coordinates representating the apple
  this.coords = [x, y];
  /* DOM-implementation of the apple
     an object with 4 keys
      elem: the HTML element to represent the apple in the DOM, always "div"
      clss: the class of the HTML element representing the apple in the DOM, always "apple"
      left: the left position of the apple element, used to convert the actual css styling
      top: the top position of the apple element, used to convert the actual css styling
  */
  this.element = {
    elem: "div",
    clss: "apple",
    id: 1,
    left: this.coords[0],
    top: this.coords[1]
  };
}


//// Functions ////

// creates an element with a class
function castElementInDOM(domPiece) {
  var element = document.createElement(domPiece["elem"]);
  element.className = domPiece["clss"];
  element.id = domPiece["id"].toString();
  element.style.left = posAsPx(domPiece["left"]);
  element.style.top = posAsPx(domPiece["top"]);
  $('#snake-container').append(element);
}

// modifies the position of each snake element in the DOM using the values in the DOM-implementation snake object
function modifyElementInDOM(domPiece) {
  var id = "#" + domPiece["id"].toString();
  $(id).css("left", posAsPx(domPiece["left"]));
  $(id).css("top" , posAsPx(domPiece["top"]));
}

// converts a string representation of position in pixels to a number
function posAsNumber(string) {
  return Number((string).match(/\d/g).join(""));
}

// converts a number to a string representation of position in pixels
function posAsPx(number) {
  return number.toString() + "px";
}

function checkForCollision() {
    // check if snake collides with apple
  if (Math.abs(snake.coords[0][0] - apple.coords[0]) <= 5 && 
      Math.abs(snake.coords[0][1] - apple.coords[1]) <= 5) {
    snake.grow(-1, -1);
    var newAppleX = Math.floor((Math.random() * 1000) + 1);
    var newAppleY = Math.floor((Math.random() * 725) + 1);
    apple.coords[0] = newAppleX;
    apple.coords[1] = newAppleY;
    apple.element["left"] = newAppleX;
    apple.element["top"] = newAppleY;
    $('.apple').css("left", posAsPx(newAppleX));
    $('.apple').css("top" , posAsPx(newAppleY));
    score += 1;
    $('#score h1').html(score.toString());
    
    console.log("snake eats the apple");
  } else if (snake.coords[0][0] < 0 || snake.coords[0][1] < 0 || snake.coords[0][0] > 1000 || snake.coords[0][1] > 725) {
    // check if snake collides with the wall
    $('#snake-container').html("");
    $('#game-over').css('display', 'inline-block');
    console.log("snake goes offscreen");
  } else {
    // check if snake collides with itself
    for (var i = 1; i < snake.coords.length; i++) {
      if (snake.coords[0][0] === snake.coords[i][0] && 
          snake.coords[0][1] === snake.coords[i][1]) {
        $('#snake-container').html("");
        $('#game-over').css('display', 'inline-block');
        console.log("snake hits itself");
      }
    }
  }
}

//// DOM Manipulators ////
function moveSnakeInDOM(x, y) {
  // clear the previous movement interval
  window.clearInterval(snakeMovementInterval);
  // intiate a new movement interval
  snakeMovementInterval = window.setInterval(function() {
    // check for a collision
    checkForCollision();
    // sets aside the initial position of the first piece of the snake
    var prevX = snake.coords[0][0];
    var prevY = snake.coords[0][1];
    // increments the position of the first piece of the snake (agnostic and DOM)
    snake.elements[0]["left"] = snake.coords[0][0] + x
    snake.elements[0]["top"] = snake.coords[0][1] + y;
    snake.coords[0][0] += x;
    snake.coords[0][1] += y;
    // modifies the actual css coordinates of the DOM implementation of the first piece of the snake
    modifyElementInDOM(snake.elements[0]);
    // loops over all subsequent pieces of the snake
    for (var i = 1; i < snake.coords.length; i++) {
      // store the implemetation-agnostic x,y coordinates of the previous snake piece to be the new x,y coordinates of the next
      var newX = prevX;
      var newY = prevY;
      // set the DOM-implemetation of the next snake piece to be the x,y coordinates of the previous snake piece
      snake.elements[i]["left"] = prevX;
      snake.elements[i]["top"] = prevY;
      // sets aside the previous coordinates of the next snake piece to be used as the next x,y coordinates for the following snake piece
      prevX = snake.coords[i][0];
      prevY = snake.coords[i][1];
      //set the implemetation-agnostic coordinates the next snake piece to be the x,y coordinates of the previous snake piece
      snake.coords[i][0] = newX;
      snake.coords[i][1] = newY;
      // modifies the actual css coordinates of the DOM implementation of the next piece of the snake 
      modifyElementInDOM(snake.elements[i]);
    }
  }, 50);
}

//// Event Handlers ////
window.addEventListener("keydown", function(event) {
  if (event.keyCode === 37) {         //left
    moveSnakeInDOM(-5, 0);
  } else if (event.keyCode === 38) {  //up
    moveSnakeInDOM(0, -5);
  } else if (event.keyCode === 39) {  //right
    moveSnakeInDOM(5, 0)
  } else if (event.keyCode === 40) {  //down
    moveSnakeInDOM(0, 5);
  } else if (event.keyCode === 32) {  //test!!!
    snake.grow(-1, -1);
  }
});



//// Main Function ////
//test initialization
var snake = new Snake();
var apple = new Apple(400, 400);
castElementInDOM(snake.elements[0]);
castElementInDOM(apple.element);
//test collision



//reminder: when the snake grows, conditional behavior should determine which x,y values to pass to it