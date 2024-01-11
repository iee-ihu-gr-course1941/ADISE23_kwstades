
const debug = true;


const alphabet = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];


const fleet = [
    "Patrol Boat",
    "Cruiser",
    "Destroyer",
    "Battleship",
    "Carrier"
];

const fleetStyles = [
    "pb",
    "cvt",
    "dst",
    "bshp",
    "crr"
];


const shipAttribute = "data-s";


function rowToNum(letter) 
{
    return alphabet.indexOf(letter);
}


function getXfromId(id) 
{
    return parseInt(id[4]);
}


function getYfromId(id) 
{
    return rowToNum(id[3]);
}


function keydowncb(e) 
{
    e.currentTarget.obj._placementTurnHandler(e);
}


function submitclick(e) 
{
    e.currentTarget.obj._firstTurnHandler(e);
}


function targetingCB(e) 
{
    e.currentTarget.obj._targetingHandler(e);
}


function targetingTurnEndCB(e) 
{
    e.currentTarget.obj._targetingEnd(e);
}


function openModal( text )
{
    let container = document.getElementById("modalContainer");
    let content = document.getElementById("modalContent");
    let close = document.getElementById("modalClose");
    let mtext = document.getElementById("modalText");
    
    mtext.innerHTML = text;

    // Stop the modal from closing when the main content container is clicked
    content.addEventListener("click", holdModal, true);

    // But close it if the background or close button is clicked, or any key is pressed
    container.addEventListener("click", closeModal, true);
    close.addEventListener("click", closeModal, true);
    window.addEventListener("keydown", closeModal, true);

    container.classList.remove("hidden");
}

function holdModal( e )
{
    e.stopPropagation();
    e.preventDefault();
}


function handleModalClosure() {
    // Perform actions when the modal is closed
  
    // Create a custom event named 'modalClosedEvent'
    const event = new CustomEvent('modalClosedEvent');
  
    document.dispatchEvent(event);
  }

function closeModal( e )
{
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    let container = document.getElementById("modalContainer");
    let content = document.getElementById("modalContent");
    let close = document.getElementById("modalClose");
    let text = document.getElementById("modalText");

    // Remove all event listeners
    content.removeEventListener("click", holdModal, true);
    container.removeEventListener("click", closeModal, true);
    close.removeEventListener("click", closeModal, true);
    window.removeEventListener("keydown", closeModal, true);

    // Hide the modal and reset its content.
    container.classList.add("hidden");
    text.innerHTML = "&nbsp;";

    handleModalClosure();

}


class Ship {

  
    constructor(board, length) {
        
        
        this._board = board;
        
        
        this._length = length;

        
        this._name = fleet[length - 1];

        
        this._invalid = false;
        
        
        this._locked = false;
        
        
        this._cells = Array(length);

        
        this._health = length;

        
        this._timesHit = 0;

        
        this._uiHealth = document.getElementById("p" + board[1] + "s" + length );

        
        this._uiHealthInd = document.getElementById("p" + board[1] + "s" + length + "h");

        
        for (let i = 0; i < length; i++) {
            let node = document.getElementById(board + alphabet[i] + 0);
            if (node.classList.contains("s")) {
                node.classList.add("so"); // overlapping
                this._invalid = true;
            } else {
                node.classList.add("s");
            }
            this._cells[i] = board + alphabet[i] + 0;
        }
        if (debug) console.log("Created " + board + " " + this._name);
    }

    _translateBoundsCheck(offsetX = 0, offsetY = 0) {
        for (let i = 0; i < this._length; i++) {
            let cell = this._cells[i];
            let new_x = offsetX + getXfromId(cell);
            let new_y = offsetY + getYfromId(cell);
            if (new_x < 0 || new_x > 9 || new_y < 0 || new_y > 9)
                return false;
        }
        if (debug) console.log("Move is in-bounds.")
        return true;
    }

    _prepMove( cell )
    {
        if (cell.classList.contains("so"))
            cell.classList.remove("so");
        else if (!cell.classList.contains("l"))
            cell.classList.remove("s")
    }

    translate(offsetX = 0, offsetY = 0) {
        if (this._locked || !this._translateBoundsCheck(offsetX, offsetY))
            return;

        // reset to false; if new position is not overlapping, will stay false,
        // otherwise will be set to true
        this._invalid = false;

        for (let i = 0; i < this._length; i++)
        {
            this._prepMove(document.getElementById(this._cells[i]));
        }

        for (let i = 0; i < this._length; i++) {
            let x = getXfromId(this._cells[i]);
            let y = getYfromId(this._cells[i]);

            x = offsetX + parseInt(x);
            y = offsetY + y;
            this._cells[i] = this._board + alphabet[y] + x;

            if (debug) console.log(this._cells[i]);

            let newCell = document.getElementById(this._cells[i]);
            if (newCell.classList.contains("s")) {
                this._invalid = true;
                newCell.classList.add("so", true);
            } else {
                newCell.classList.toggle("s", true);
            }
        }
        return;
    }

    rotate(ccw = true) 
    {
        if (this._locked)
            return;

        let was_invalid = this._invalid;

        // reset to false; if new position is not overlapping, will stay false,
        // otherwise will be set to true
        this._invalid = false;

        let origin = this._cells[0];
        let ox = getXfromId(origin);
        let oy = getYfromId(origin);

        let new_cells = Array(this._length);
            new_cells[0] = origin;

        let vertical = ( getXfromId( this._cells[this._length-1] ) == ox );

        let originHigh = false;
        if (vertical) // If vertical, the origin is high if origin Y > last cell Y
            originHigh = ( oy > getYfromId( this._cells[this._length-1] ) );
        else          // If horizontal, the origin is high if origin X > last cell X
            originHigh = ( ox > getXfromId( this._cells[this._length-1] ) );


        for (let i = 1; i < this._length; i++) 
        {
            let x = getXfromId(this._cells[i]);
            let y = getYfromId(this._cells[i]);
            let new_x = -1;
            let new_y = -1;

            if ( ccw ){
                if ( originHigh ){
                    // C1
                    if ( vertical ){
                        new_x = ox - (oy-y);
                        new_y = oy;
                    // C2
                    } else {
                        new_x = ox;
                        new_y = oy + (ox-x);
                    }
                } else { 
                    // C3
                    if ( vertical ){
                        new_x = ox + (y-oy);
                        new_y = oy;
                    // C4
                    } else {
                        new_x = ox;
                        new_y = oy - (x-ox);
                    }
                }
            } else {
                if ( originHigh )
                {
                    // C5
                    if ( vertical )
                    {
                        new_x = ox + (oy-y);
                        new_y = oy;
                    // C6
                    } else {
                        new_x = ox;
                        new_y = oy - (ox-x);
                    }
                } else { 
                    // C7
                    if ( vertical )
                    {
                        new_x = ox - (y-oy);
                        new_y = oy;
                    // C8
                    } else {
                        new_x = ox;
                        new_y = oy + (x-ox);
                    }

                }
            }

            // If the rotation moves any cell out-of-bounds, do not apply it
            if ( new_x < 0 || new_x > 9 || new_y < 0 || new_y > 9 ) 
            {
                if (debug) console.log("Skipping rotation resulting in x=" + new_x + ", y=" + new_y + ", for cell " + i);
                this._invalid = was_invalid;
                return;
            }

            // Store the new ID string in "new_cells" so the rotation can be applied in L2
            new_cells[i] = this._board + alphabet[new_y] + new_x;
        }

        for (let i = 0; i < this._length; i++) {
            let cell = document.getElementById(this._cells[i]);
            this._prepMove(cell);
            this._cells[i] = new_cells[i];
            cell = document.getElementById(this._cells[i]);

            if (cell.classList.contains("s")) {
                this._invalid = true;
                cell.classList.add("so", true);
            } else {
                cell.classList.toggle("s", true);
            }
        }
        return;
    }


    decrementHealth()
    {
        this._timesHit++;
        this._health--;
        this._uiHealthInd.innerHTML = this._health;
        if (this._health<=0){
            this._uiHealth.classList.add("dstry");
            return true;
        } else {
            this._uiHealth.classList.add("hit" + this._timesHit);
            return false;
        }
    }


    _confirm() {
        if (!this._invalid)
            this._lock();
        return !this._invalid;
    }


    _lock() {
        this._locked = true;
        for (let i = 0; i < this._length; i++) {
            let cell = document.getElementById(this._cells[i]);
            cell.classList.add("l"); // "l" indicates locked
            cell.setAttribute(shipAttribute, this._name);
        }
    }
}


class Player {

    constructor(game, container, player_number) {


        this._parent = game;

 
        this._container = container;


        this._num = player_number;
        

        this._form = document.getElementById("p" + this._num + "-ship-opt");


        this._formSubmit = document.getElementById("p" + this._num + "-ship-opt-submit");
            // Add event listener and reference to this object to handle form submission
            this._formSubmit.addEventListener("click", submitclick, true);
            this._formSubmit.obj = this;

        this._turnEndButton = document.getElementById("p" + this._num + "-end-turn");
            this._turnEndButton.addEventListener("click", targetingTurnEndCB, true);
            this._turnEndButton.obj = this;
            this._turnEndButton.classList.add("etHidden");


        this._b_placement = document.getElementById('p' + this._num + '-board-placement');

 
        this._b_target = document.getElementById('p' + this._num + '-board-target');

   
        this._fleetSize = -1;

    
        this._shipsPlaced = 0;

       
        this._ships = null;

        this._oppShips = -1;


        this._oppShipsDestroyed = 0;

    }


    giveTurn(type = "targeting") {

        this._container.classList.remove("hidden");

        switch (type) {
            case "targeting":
                this._doTargetingTurn();
                break;
            case "first":
                // no action needed;
                break;
            default:
                openModal("Invalid turn type specified: " + type);
                break;
        }
        return;
    }


    _doTargetingTurn() {
        openModal("Player " + this._num + ": Choose Target");
        this._b_target.addEventListener("click", targetingCB, false);
        this._b_target.obj = this;
    }


    _targetingHandler(e) {

        

        // ignore clicks on anything other than the grid rectangles
        if ( !e.target.nodeName == "rect" )
            return;

        // ignore clicks on elements that were already targeted
        if ( e.target.classList.contains("h") || e.target.classList.contains("m") )
            return;

        let id = e.target.getAttribute("id");
        let x = getXfromId(id);
        let y = getYfromId(id);

        fetch('sqlload.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `x=${x}&y=${y}`
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log(data); // Log the server response (optional)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

        // Get the opposing player's JavaScript object.
        // We'll use this to update their ship's health if the current player scored a hit.
        let opponent = (e.currentTarget.obj._num == 1) ? e.currentTarget.obj._parent._p2 : e.currentTarget.obj._parent._p1;
        if (e.currentTarget.obj._oppShips == -1)
        {
            e.currentTarget.obj._oppShips = opponent._fleetSize;
        }

        let ref = document.getElementById(
            "p" +                                   
            ((e.currentTarget.obj._num % 2) + 1) +  
            "p" +                                   
            alphabet[y] +                           
            x                                       
        );

        let msg = "Hit!";

        

        if (ref.classList.contains("s")) {
            
            if (debug) console.log(opponent);

            // Update the health of the opposing player's ship
            let shipHit = ref.getAttribute(shipAttribute);
                shipHit = fleet.indexOf(shipHit);
            if ( opponent._ships[shipHit].decrementHealth() ) {
                e.currentTarget.obj._oppShipsDestroyed++
                msg = msg + " You sank their " + ref.getAttribute(shipAttribute);
            }
            
            document.getElementById(id).classList.add("h");
            ref.classList.add("h");
        } else {
            msg = "Miss!";
            document.getElementById(id).classList.add("m");
            ref.classList.add("m");
        }

        // Tell the player of their accomplishments (or lack thereof)
        openModal( msg );

        e.currentTarget.obj._turnEndButton.classList.remove("etHidden");
        e.currentTarget.obj._b_target.removeEventListener("click", targetingCB, false);
        e.currentTarget.obj._turnEndButton.classList.add("suggest");

        // Trigger win if the last opponent ship was destroyed
        if (e.currentTarget.obj._oppShipsDestroyed == e.currentTarget.obj._oppShips)
        {
            e.currentTarget.obj._parent.triggerWin(e.currentTarget.obj._num);
            e.currentTarget.obj._turnEndButton.innerHTML = "New Game";
            this._turnEndButton.removeEventListener("click", targetingTurnEndCB, true);
            this._turnEndButton.addEventListener("click", function(e){
                e.preventDefault();
                location.reload();
            });
        }
    }

    _targetingEnd( e )
    {
        e.currentTarget.obj._turnEndButton.classList.remove("suggest");
        e.currentTarget.obj._turnEndButton.classList.add("etHidden");
        e.currentTarget.obj._parent.endTurn(e.currentTarget.obj._num);
    }


    _doPlacementTurn(obj, shipLength) {
        openModal("Player " + this._num +" place your " + fleet[shipLength-1] + ".");
        window.addEventListener("keydown", keydowncb, true);
        window.obj = obj;
        this._ships[this._shipsPlaced] = new Ship("p" + this._num + "p", shipLength);
    }


    _placementTurnHandler(e) {
        
        let ship = this._ships[this._shipsPlaced];

        if (debug) console.log(e.code);

        switch (e.code) {

            case "KeyA":
                e.preventDefault();
                ship.translate(-1, 0);
                break;
            case "KeyD":
                e.preventDefault();
                ship.translate(1, 0);
                break;
            case "KeyW":
                e.preventDefault();
                ship.translate(0, -1);
                break;
            case "KeyS":
                e.preventDefault();
                ship.translate(0, 1);
                break;

            case "KeyE":
                e.preventDefault();
                ship.rotate(true);
                break;                
            case "KeyQ":
                e.preventDefault();
                ship.rotate(false);
                break;

            case "Enter":
                e.preventDefault();
                let placedShip = ship._confirm();
                if (placedShip) {
                    this._shipsPlaced++;
                    window.removeEventListener("keydown", keydowncb, true);
                    this._endPlacementTurn(this._ships[this._shipsPlaced - 1]._length);
                } else {
                    if (debug) console.log("Ship refused to confirm.");
                }
                break;

            default:
                break;
        }
        return;
    }


    _endPlacementTurn(i) {

        if (this._shipsPlaced >= this._fleetSize) {
            openModal("That's everything. Time to batten down the hatches.");
            this._form.classList.toggle("hidden", true);
            this._parent.endTurn(this._num);
            return;
        } else {
            this._doPlacementTurn(this, i + 1);
        }
        return;
    }


    _firstTurnHandler(e) {
        e.preventDefault();

        let str = "p" + this._num + "so_";
        for (let i = 1; i <= 5; i++) {
            // alert(str+i);
            let button = document.getElementById(str + i);
            if (button.checked) {
                this._fleetSize = button.value;
                this._ships = Array(this._fleetSize);
                if (debug) console.log("Player " + this._num + " will place " + this._fleetSize + " ships.")
                break;
            }
        }
        this._form.classList.toggle("hidden", true);
        this._formSubmit.removeEventListener("click", submitclick, false);

        this._doPlacementTurn(this, this._shipsPlaced + 1);
    }


    _hide() {
        this._container.classList.toggle("hidden", true);
    }
}


class Game {

    constructor() {


        this._p1 = new Player(
            this,
            document.getElementById("p1-boards-container"),
            1
        );


        this._p2 = new Player(
            this,
            document.getElementById("p2-boards-container"),
            2
        );


        this._p1tc = 1;
    

        this._p2tc = 0;

 
        this._player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
        this._player2Score = parseInt(localStorage.getItem('player2Score')) || 0;

        this.updateScoreboard();

        this.maxTurns = 100; 
        this.currentTurn = 0; 
        this.turnsRemainingElement = document.getElementById('turns-remaining'); 

        this.timeLimit = 3600; 
        this.currentTime = this.timeLimit; 
        this.timerElement = document.getElementById('timer'); 
        this.timerInterval = null;

    }


    start() {

        this._p2._hide();
        this._p1.giveTurn("first");
        this.updateTurnsRemaining();
        this.startTimer();
        
    }

    endTurn(forPlayer) {
        if (forPlayer == 1) {
            this._p1._hide();
            this._p1tc++;
            if (this._p2tc == 0)
                this._p2.giveTurn("first");
            else
                this._p2.giveTurn("targeting");
        } else if (forPlayer == 2) {
            this._p2._hide();
            this._p2tc++;
            if (this._p1tc == 0)
                this._p1.giveTurn("first");
            else
                this._p1.giveTurn("targeting");
        }
        this.currentTurn++;

        this.updateTurnsRemaining();

        if (this.currentTurn >= this.maxTurns) {
            this.triggerMaxTurnsReached();
            
        }

        
    }
    

    updateScoreboard() {
        document.getElementById('player1-score').innerText = this._player1Score;
        document.getElementById('player2-score').innerText = this._player2Score;
    }

    updateTurnsRemaining() {
        const remainingTurns = this.maxTurns - this.currentTurn;
        this.turnsRemainingElement.textContent = remainingTurns;
    }
    
    triggerMaxTurnsReached() {
        openModal('Maximum turns reached. Game over.'); 
        this.updateTurnsRemaining();
        document.addEventListener('modalClosedEvent', function() {
            location.reload();
        });
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
          this.currentTime--;
          this.updateTimerDisplay();
    
          if (this.currentTime <= 0) {
            this.triggerTimeOut();
          }
        }, 1000); 
    }
    
    updateTimerDisplay() {
        this.timerElement.textContent = this.currentTime;
    }
    
    triggerTimeOut() {
        clearInterval(this.timerInterval); 
        openModal('Time is up! Game over.'); 
        document.addEventListener('modalClosedEvent', function() {
            location.reload();
        });
    }
    
    triggerWin( forPlayer )
    {
        if (forPlayer == 1) {
            this._player1Score++;
        } else if (forPlayer == 2) {
            this._player2Score++;
        }
        this.updateScoreboard();
        localStorage.setItem('player1Score', this._player1Score);
        localStorage.setItem('player2Score', this._player2Score);
        openModal("A grueling battle... But Player " + forPlayer + " has come out on top!");
    }

    

}
    
let game = new Game();
game.start();
