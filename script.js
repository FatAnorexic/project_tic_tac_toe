

// This is the basic game board. Each row houses 3 columns. Each of these columns can take 
//a single string or char: "x" or "o". The ability for the player to insert their string is
//written later in the code, as well as any win/tie checks.

function gameBoard(){
    const board=new Array(9)
    for (let x=0;x<board.length;x++){
        board[x]=" ";
    }
    const display=console.log(board);

    return {display};
}
