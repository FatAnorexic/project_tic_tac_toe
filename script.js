

// This is the basic game board. Each row houses 3 columns. Each of these columns can take 
//a single string or char: "x" or "o". The ability for the player to insert their string is
//written later in the code, as well as any win/tie checks.

function board(){
    const rows=3, columns=3;
    const gameBoard=[];

    for(let y=0;y<rows;y++){
        gameBoard[y]=[];

        for(let x=0;x<columns;x++){
            gameBoard[y].push("");
        }
    }
    console.log(gameBoard)
}
