

// This is the basic game board. Each row houses 3 columns. Each of these columns can take 
//a single string or char: "x" or "o". The ability for the player to insert their string is
//written later in the code, as well as any win/tie checks.

function gameBoard(){
    const rowCol=3
    const board=Array(rowCol).fill().map(()=>Array(rowCol).fill(""));
    //

    //Make the actual board private and display as needed
    const display=console.log(board);
    return {display};
}
