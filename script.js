

// This is the basic game board. Each row houses 3 columns. Each of these columns can take 
//a single string or char: "x" or "o". The ability for the player to insert their string is
//written later in the code, as well as any win/tie checks.

function gameBoard(){
    const size=9;
    const board=[];

    for(let x=0;x<size;x++){
        board.push(indexValue());
    }
    
    //Factory function to get the status of a board, passes to checkWinTie later
    const getBoard=()=>board;
    const getInd=(num)=>board[num];

    //Method to check if a slot is available. If it is not, prevent them from overwriting the occupied spot
    //if it is, execute the addChar function.
    const markIdx=(idx, char)=>{
        
        if(board[idx].getVal()!=='') return;
        board[idx].addChar(char);
    };
    
    //Make the actual board private and display as needed. This board will need to be converted to a 2d Array
    //for playing in the console. 
    const displayBoard=()=>{
        let copy=board.map((cell)=>cell.getVal()); //another way is to say copy=[].concat(board) then map the value when running through the while loop. 
        
        const boardVal=[];
         while(copy.length) boardVal.push(copy.splice(0,3));
        
        console.log(boardVal);
    };

    //sets the logic for the AI
    const setCellsForAILogic=(number, player)=>{
        
        board[number].addChar(player)
    }

    //Runs through the array and checks if the cell is empty or filled
    const getEmptyCells=()=>{
        let cells=[];
        for(let x=0;x<getBoard().length;x++){
            const cell=board[x].getVal();
            if(cell=='') cells.push(x);
        }
        return cells;
    }
    return {getBoard, displayBoard, markIdx, getEmptyCells, setCellsForAILogic, getInd};
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
**AI IIFE to run the AI. It uses the minimax algorithm recursively to find the best possible moves on the
**board. This current rendition of the code comes from Peter Abordan GH: @Pety99. This is a rough outline
**for the functioning AI and will no doubt need to be changed and altered to better suit the code flow
**of my program. Further reading on this Algorithm: 
**https://www.geeksforgeeks.org/finding-optimal-move-in-tic-tac-toe-using-minimax-algorithm-in-game-theory/
*/

const AI=(()=>{

    //evaluate the board for win conditions
    const evaluate=(board, player)=>{
        let win=false;

        winStates=[
                    [0,1,2],[3,4,5],[6,7,8],
                    [0,3,6],[1,4,7],[2,5,8],
                    [0,4,8],[2,4,6]
                  ];

        let status=board.getBoard().map(({addChar, getVal})=>getVal());
        //Checks if win has been met
        for(let i=0;i<winStates.length;i++){
            [x,y,z]=winStates[i];
            if(status[x]===player && status[y]===player && status[z]===player){
                win=true;
            }
        }
        
        if(win){
            if(player==game.getPlayers()[0].char){
                return +10;
            }else if(player==game.getPlayers()[1].char){
                return -10;
            }
        }
        return 0;
    };

    //Return the index and score of the next best move. it takes the player char and game board as arguments
    const minimax=(board, player)=>{
        //This will create a list of empty cells for minmax to simulate possible win/loss combinations
        let empty=board.getEmptyCells();
        
        

        let moves=[];

        for(let x=0;x<empty.length;x++){
            //empty object, which will store the best move index along with its score at the end of the first level of the loop
            let move={};
            move.index=empty[x];
            
            board.setCellsForAILogic(empty[x],player);

            //This emulates the various outcomes of the loop by recursively looping through the function over various levels
            //until the a win or tie state is achieved. 
            if(player==game.getPlayers()[1]){
                let result=minimax(board,game.getPlayers()[0].char);
                move.score=result.score;
            }else{
                let result=minimax(board,game.getPlayers()[1].char);
                move.score=result.score;
            }

            //At the end of the loop reset all empty cells
            board.setCellsForAILogic(empty[x], '');
            
            moves.push(move);
        }
        return findBestMove(moves,player);
    };
    
    
    //finds the best move to make on the board
    const findBestMove=(moves, player)=>{
        let bestMove;
        //This player is the maximizer. Their goal is to maximize the "score"
        if(player===game.getPlayers()[1]){
            let bestScore=-1000;
            for(let x=0;x<moves.length;x++){
                if(moves[x].score>bestScore){
                    bestScore=moves[x].score;
                    bestMove=x;
                }
            }
        }else{
            let bestScore=1000;
            //This is for the minimizer->the goal is to get as far below 0 as possible
            for(let x=0;x<moves.length;x++){
                if(moves[x].score<bestScore){
                    bestScore=moves[x].score;
                    bestMove=x;
                }
            }
        }
        return moves[bestMove];
    };



    return{minimax};
})();




/*
**Handles the game itself and uses the previously defined functions to place Characters on the board.
**Checks for win conditions and tie breakers. Players are stored in objects and assigned a char upon
**creation of the game. This will also be the function that assigns either an AI or a second player 
**to the game. Players will also be able to input their name and will be assigned strings.
*/

function GameController(playerOne="Player One", playerTwo="Player Two"){

    //Creates an array of player objects containing both their name and their Character
    const contenders=[{name:playerOne, char: "X", score: 0}, {name:playerTwo, char: "O", score: 0}];
    

    //Creates an instance of the game board
    const board=gameBoard();

    //initialize the contenders and make the variable private by wrapping it into a function
    let currentPlayer=contenders[0];

    const getPlayers=()=>contenders;
    console.log(getPlayers()[0])
    
    const getCurrent=()=>currentPlayer;


    //Add factory function to get both scores
    const getScore=()=>{console.log(contenders[0].score, contenders[1].score);};

    //Function to switch players each turn
    const turn=()=>{
        currentPlayer=currentPlayer===contenders[0]?contenders[1]:contenders[0];
    };

    //Updates the board to the most current round
    const updateBoard=()=>{
        board.displayBoard();
        console.log(`${getCurrent().name}'s turn.`);
    };

    // Factory function that checks to see if the win state is achieved or if there is a tie
    const check=()=>{
        let win=false, tie=false;
        let count=0;

        winStates=[
                   [0,1,2],[3,4,5],[6,7,8],
                   [0,3,6],[1,4,7],[2,5,8],
                   [0,4,8],[2,4,6]
                  ];
        
        //Map the board.getVal() function onto a 1D array for use in the for loops below
        let status=board.getBoard().map(({addChar, getVal})=>getVal());

        //Checks if win has been met
        for(let i=0;i<winStates.length;i++){
            [x,y,z]=winStates[i];
            if(status[x]===getCurrent().char && status[y]===getCurrent().char && status[z]===getCurrent().char){
                win=true;
            }
        }

        for(let x=0;x<status.length;x++){
            if(status[x]==='') count++;
        }

        if(count<1 && !win){
            tie=true;
        }

        const getWin=()=>win;
        const getTie=()=>tie;


        return {getWin, getTie};
    };

    /*
    **place function that takes a numerical value from the player and pushes it to the markIdx function 
    **after the character is placed, call the win/tie functions to see if either are met. If not,
    **call the switch and update board functions
    */

    const place=(idx)=>{
        
        if (getCurrent().name==playerOne){
            board.markIdx(idx, getCurrent().char);
        }

        if(getCurrent().name==playerTwo){
            let choice = AI.minimax(board, getCurrent().char)
            console.log(choice)
            board.markIdx(choice.index, getCurrent().char);
        }
        
        //Returns the win message and resets the board

        const win=()=>{
            let message;
            
            if(check().getWin()){
                message=`${getCurrent().name} has won the round!`;
                getCurrent().score++;
            }else if(check().getTie()){
                message=`Nobody won this round, as there are no moves left on the board`;
            }


            const getMessage=()=>{console.log(message);};

            return {getMessage};
        }

        if(!check().getWin() && !check().getTie()){
            turn();
            updateBoard();
        }else{
            win().getMessage();
            getScore();
        }
    }

    //initialize the board upon loading
    updateBoard();

    return {place, getCurrent, check, getPlayers};
}

const game=GameController();