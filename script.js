

// This is the basic game board. Each row houses 3 columns. Each of these columns can take 
//a single string or char: "x" or "o". The ability for the player to insert their string is
//written later in the code, as well as any win/tie checks.

function gameBoard(){
    const size=9;
    const board=Array();

    for(let x=0;x<size;x++){
        board.push(indexValue());
    }
    
    //Method to check if a slot is available. If it is not, prevent them from overwriting the occupied spot
    //if it is, execute the addChar function.
    const markIdx=(idx, char)=>{
        if(board[idx].getVal()!=='') return;
        board[idx].addChar(char);
    };
    
    //Make the actual board private and display as needed. This board will need to be converted to a 2d Array
    //for playing in the console. 
    const displayBoard=()=>{
        const boardVal=Array();
        while(board.length) boardVal.push(board.splice(0,3).map((cell)=>cell.getVal()));
        console.log(boardVal);
    };
    return {displayBoard, markIdx};
}

//This function adds a value of either an empty string or a player character when called.
function indexValue(){
    let value='';

    const addChar=(playerChar)=>{
        value=playerChar;
    };

    //make sure the value itself is private.
    const getVal=()=>value;

    return {addChar, getVal};
}

/*
**Handles the game itself and uses the previously defined functions to place Characters on the board.
**Checks for win conditions and tie breakers. Players are stored in objects and assigned a char upon
**creation of the game. This will also be the function that assigns either an AI or a second player 
**to the game. Players will also be able to input their name and will be assigned strings.
*/

function GameController(playerOne="Player One", playerTwo="Player Two"){

    //Creates an array of player objects containing both their name and their Character
    const contenders=[{name:playerOne, char: "X"}, {name:playerTwo, char: "O"}];
}