

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
    return {getBoard, displayBoard, markIdx};
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


    //finds the best move to make on the board
    const findBestMove=(moves, player)=>{
        let bestMove;
        if(player.char==='X'){
            let bestScore=1000;
            for(let x=0;x<moves.length;x++){
                if(moves[x].score<bestScore){
                    bestScore=moves[x].score;
                    bestMove=x;
                }
            }
        }else{
            let bestScore=-1000;
            for(let x=0;x<moves.length;x++){
                if(moves[x].score>bestScore){
                    bestScore=moves[x].score;
                    bestMove=x;
                }
            }
        }
        return moves[bestMove];
    };

    return{findBestMove};
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

    /*
    **place function that takes a numerical value from the player and pushes it to the markIdx function 
    **after the character is placed, call the win/tie functions to see if either are met. If not,
    **call the switch and update board functions
    */

    const place=(idx)=>{
        
        AI.findBestMove(0,getCurrent());
        board.markIdx(idx, getCurrent().char);

        // An IIFE that checks to see if the win state is achieved or if there is a tie
        const check=(function(){
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
        })();

        //Returns the win message and resets the board

        const win=()=>{
            let message;
            
            if(check.getWin()){
                message=`${getCurrent().name} has won the round!`;
                getCurrent().score++;
            }else if(check.getTie()){
                message=`Nobody won this round, as there are no moves left on the board`;
            }


            const getMessage=()=>{console.log(message);};

            return {getMessage};
        }

        if(!check.getWin() && !check.getTie()){
            turn();
            updateBoard();
        }else{
            win().getMessage();
            getScore();
        }
    }

    //initialize the board upon loading
    updateBoard();

    return {place, getCurrent};
}

const game=GameController();