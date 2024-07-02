

// This is the basic game board. Each row houses 3 columns. Each of these columns can take 
//a single string or char: "x" or "o". The ability for the player to insert their string is
//written later in the code, as well as any win/tie checks.

function gameBoard(){
    const size=9;
    const board=Array()

    for(let x=0;x<size;x++){
        board.push("");
    }
    
    //Method to check if a slot is available. If it is not, prevent them from overwriting the occupied spot
    //if it is, execute the addMarker function.

    
    //Make the actual board private and display as needed
    const displayBoard=()=>{
        console.log(board);
    }
    return {displayBoard};
}

