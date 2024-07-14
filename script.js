

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
    
    /*
    //Make the actual board private and display as needed. This board will need to be converted to a 2d Array
    //for playing in the console. 
    
    const displayBoard=()=>{
        let copy=board.map((cell)=>cell.getVal()); //another way is to say copy=[].concat(board) then map the value when running through the while loop. 
        
        const boardVal=[];
         while(copy.length) boardVal.push(copy.splice(0,3));
        
        console.log(boardVal);
    }; **(LEGACY CODE| DELETE OR MOVE FOR LATER USE->GAME NOW DISPLAYS IN DOM)*/

    //Function to clear the board and return everything back to a zeroth state
    const clearBoard=()=>{
        for(let x=0;x<board.length;x++){
            board[x].addChar('');
        }
    }

    return {getBoard, markIdx, getInd, clearBoard};
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
**An AI function that uses a modified version of minimax. Credit must be given to Peter Abordan GH:@Pety99
**for helping me to understand the logic of how this algorithm would work early in its implementation.
**This version is more based off of the GeeksforGeeks rendition. With the exception of
**dificulty modes(still needs implementation), this algorithm can be considered fully complete. 
**Future modifacations may include calling the evaluate elsewhere in the game controller to reducuce redundant
**code. Further reading on this Algorithm: 
**https://www.geeksforgeeks.org/finding-optimal-move-in-tic-tac-toe-using-minimax-algorithm-in-game-theory/
*/

function AI(){
    let game=GameController();
    const isMovesLeft=(board)=>{
        let state=board.map(({addChar, getVal})=>getVal());
        for(let x=0;x<state.length;x++){
            if(state[x]=='') return true;
        }
        return false;
    }

    //evaluate the board for win conditions
    const evaluate=(board, player)=>{
        let win=false;

        winStates=[
                    [0,1,2],[3,4,5],[6,7,8],
                    [0,3,6],[1,4,7],[2,5,8],
                    [0,4,8],[2,4,6]
                  ];

        let status=board.map(({addChar, getVal})=>getVal());
        //Checks if win has been met
        for(let i=0;i<winStates.length;i++){
            [x,y,z]=winStates[i];
            if(status[x]===player && status[y]===player && status[z]===player){
                win=true;
            }
        }
        
        if(win){
            if(player==game.getPlayers()[1].char){
                return +10;
            }else if(player==game.getPlayers()[0].char){
                return -10;
            }
        }
        return 0;
    };

    //Return the index and score of the next best move. it takes the player char and game board as arguments
    const minimax=(board, depth, player)=>{
        let score=evaluate(board, player);
        if(score==10) return score;
        if(score==-10) return score;
        if(isMovesLeft(board)==false) return 0;

        if(player==game.getPlayers()[1].char){
            let best=-1000;
            for(let x=0;x<board.length;x++){
                if(board[x].getVal()==''){
                    board[x].addChar(player);

                    best=Math.max(best, minimax(board, depth+1, game.getPlayers()[0].char));
                    board[x].addChar('');
                }
            }
            return best;
        }else{
            let best=1000;
            for(let x=0;x<board.length;x++){
                if(board[x].getVal()==''){
                    board[x].addChar(game.getPlayers()[0].char);
                    best=Math.min(best, minimax(board, depth+1, game.getPlayers()[1].char));
                    board[x].addChar('');
                }
            }
            return best
        }
    };
    
    
    //finds the best move to make on the board
    const findBestMove=(board, player)=>{
        let bestVal=-1000;
        let bestMove;
        for(let x=0;x<board.length;x++){
            if(board[x].getVal()==''){
                board[x].addChar(player);

                let value=minimax(board, 0, game.getPlayers()[0].char);

                board[x].addChar('');

                if(value>bestVal){
                    bestMove=x;
                    bestVal=value;
                }
            }
        }
        return bestMove;
    }



    return{findBestMove};
}




/*
**Handles the game itself and uses the previously defined functions to place Characters on the board.
**Checks for win conditions and tie breakers. Players are stored in objects and assigned a char upon
**creation of the game. This will also be the function that assigns either an AI or a second player 
**to the game. Players will also be able to input their name and will be assigned strings.
*/

function GameController(playerOne="Player One", playerTwo="Player Two"){

    //Creates an array of player objects containing both their name and their Character
    const contenders=[{name:playerOne, char: "X", score: 0, AI: false}, {name:playerTwo, char: "O", score: 0, AI: true}];
    
    //Initialize a variable called round and set it to 1
    let round=1;

    const setRound=()=>{
        if(round<5) round++;
        else round=1;
    }
    const getRound=()=>{
        return {round};
    }
    //Ends the current round and moves onto the next
    const endRound=()=>{
        if(getRound().round<5){
            setRound();
            getScore();
            board.clearBoard();
            turn();
            updateBoard();
        }else{
            endGame();
        }
    }

    //Function that exectutes at the end of Every game->uses the resetGame function to bring everything back to start
    const endGame=()=>{
        const one=getPlayers()[0].score;
        const two=getPlayers()[1].score;
        
        //Get the winner for the game
        if(one>two){
            console.log(`${getPlayers()[0].name} won the game!`);
        }else if(two>one){
            console.log(`${getPlayers()[1].name} won the game!`);
        }else{
            console.log(`Both players tied:`)
            console.log(`${getPlayers()[0].name} score: ${one}`);
            console.log(`${getPlayers()[1].name} score: ${two}`);
        }

        let choice=parseInt(prompt(`Would you like to play another round? 1 for yes 0 for no.`));
        if(choice===1){
            resetGame();
        }
        return;
    }

    //Reset game is a function to reset the contents of the game back to default values->can be triggered at anytime
    const resetGame=()=>{
        for(let x=0;x<getPlayers().length;x++){
            getPlayers()[x].score=0;
        }
        round=1;
        board.clearBoard();
        currentPlayer=contenders[0];
        updateBoard();
    }

    //Creates an instance of the game board
    const board=gameBoard();

    //initialize the contenders and make the variable private by wrapping it into a function
    let currentPlayer=contenders[0];
    const getPlayers=()=>contenders;
    const getCurrent=()=>currentPlayer;


    //Add factory function to get both scores
    const getScore=()=>{console.log(contenders[0].score, contenders[1].score);};

    //Function to switch players each turn
    const turn=()=>{
        currentPlayer=currentPlayer===contenders[0]?contenders[1]:contenders[0];
    };

    //Updates the board to the most current round
    const updateBoard=()=>{
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


        if(!getWin() && !getTie()){
            turn();
            updateBoard();
        }else{
            winRound(getWin(), getTie()).getMessage();
            endRound();
        }
    };
    
    const winRound=(win, tie)=>{
        let message;
        
        if(win){
            message=`${getCurrent().name} has won the round!`;
            getCurrent().score++;
        }else if(tie){
            message=`Nobody won this round, as there are no moves left on the board`;
        }


        const getMessage=()=>{console.log(message);};

        return {getMessage};
    };
    
    
    /*
    **player and AI functions. Both operate fundementally the same with the exception that one takes the index that
    **has been clicked on. While the other takes no index, and instead used the AI function to find the index to place
    **the character on. 
    */

    const player=(idx)=>{
        board.markIdx(idx, getCurrent().char);
        check();
    }

    const aiPlayer=()=>{
        let choice=AI().findBestMove(board.getBoard(), getCurrent().char);
        board.markIdx(choice, getCurrent().char);

        check();
    }


    //initialize the board upon loading
    updateBoard();

    return {
        player, 
        aiPlayer, 
        getCurrent, 
        getPlayers, 
        resetGame, 
        board, 
        getBoard: board.getBoard
    };
}

const displayController=(()=>{
    const game=GameController();

    const boardDiv=document.querySelector('.board');

    //This is to delay the AI from executing too fast, and gives the illusion that the computer is thinking
    const delay=(ms)=>new Promise(res=>setTimeout(res, ms));

    //This renders the board when the game is loaded into memory
    const render=()=>{
        const board=game.getBoard();
        boardDiv.textContent='';
        board.forEach((cell, index)=>{
            const cellButton=document.createElement("button");
            cellButton.classList.add('tempCells');

            cellButton.dataset.column=index;
            cellButton.textContent=cell.getVal();
            boardDiv.appendChild(cellButton);
        })
        if(game.getCurrent().AI){
            (async()=>{
                await delay(500);
                game.aiPlayer();
                render();
            })();
            
        }

    };

    function clickHandler(e){
        const index=e.target.dataset.column;

        if(!game.getCurrent().AI) game.player(index);
        render();
    }
    boardDiv.addEventListener('click', clickHandler);
    render();
})();

