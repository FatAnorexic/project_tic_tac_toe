/* 
**This will load the title screen immediately upon loading the page. It will be responsible for displaying
**certain settings options such as setting player names, choosing avatars, x or o, and ai or player oponents.
**It will be the one to create an instance of the game controller, and will pass this along to the display controller.
*/

const titleScreen=(function title(){
    const start=document.getElementById('startGame');
    const displayGame=document.getElementById('game');
    const displayTitle=document.getElementById('titleScreen');
    const playerOneImage=document.getElementById('image One');
    const playerTwoImage=document.getElementById('image Two');
    let isAIOne=document.querySelectorAll('[name="playerOneAI"]');
    let isAITwo=document.querySelectorAll('[name="playerTwoAI"]');
    

    // Factory function that sets the Avatar images for players
    const setPlayerAvatar=()=>{
        const avOne=document.querySelector('.avatar.One');
        const avTwo=document.querySelector('.avatar.Two');
        avOne.appendChild(playerOneImage);
        avTwo.appendChild(playerTwoImage);
    };

    // Set the difficulty level to display or not based on Human or AI selection
    // And change the Avatar image
    const setForm=(event)=>{
        let formChange=event.target.name=='playerOneAI'? document.querySelector('.challengeFormOne'):document.querySelector('.challengeFormTwo');
        let imageSrc=event.target.name=='playerOneAI'? document.getElementById('image One'):document.getElementById('image Two');
        if(event.target.value=='true'){
            imageSrc.src='images/AIAbstractTest.png';
            formChange.style.display='block';
        }else{
            imageSrc.src='images/PlayerAbstractTest.png';
            formChange.classList.add('fadeOut');
            // Function exists solely to let the fade out animation to play
            async function fadeOut() {
                await new Promise(resolve=>setTimeout(resolve, 200));
                formChange.style.display='none';
                formChange.classList.remove('fadeOut');
            }
            fadeOut();
        }
    };

    const aiPrecision=(ai, menu)=>{
        /* 
        **Get the AI difficulty level. If it is false, we pass a null value.
        **If true, a switch statement yields a decimal value based on the string in the dropdown box.
        **This 'precision' value will later be a threshold for determining if the AI will use a random
        **move, or the optimal move using minimax.
        */
        if(!ai) return null;
        
        switch(menu.value){
            case 'cheez': 
                return 1.00;
            case 'hard' : 
                return 0.75;
            case 'medium' : 
                return 0.50;
            default:
                return 0.25;
        }
    };
    
    //Function that gets both player values, and returns them as an object to be passed to game controller
    const getPlayerValues=()=>{
        // Checks if the input field is blank, and returns a default if it is. returns the name if it is not
        const oneName=document.getElementById('player_one_name').value== '' ? "Player One":document.getElementById('player_one_name').value;
        const twoName=document.getElementById('player_two_name').value== '' ? "Player Two":document.getElementById('player_two_name').value;

        // Selects the characters for player one and player two|if the two values are the same Player one defaultes to the other
        let charOne=document.querySelector('[name="playerOneChar"]:checked').value;
        let charTwo=document.querySelector('[name="playerTwoChar"]:checked').value;
        if(charOne=='X' && charTwo=='X'){
            charOne='O';
        }else if(charOne=='O' && charTwo=='O'){
            charOne='X';
        }

        // Get the AI status of both players
        const aiOne=document.querySelector('[name="playerOneAI"]:checked').value=='false' ? false:true;
        const aiTwo=document.querySelector('[name="playerTwoAI"]:checked').value=='false' ? false:true;

        // Call to set AI accuracy
        const menuOne=document.querySelector('#difficultyOne');
        const menuTwo=document.querySelector('#difficultyTwo')
        const aiAccuracyOne=aiPrecision(aiOne, menuOne);
        const aiAccuracyTwo=aiPrecision(aiTwo, menuTwo);
        
        return {
            oneName, 
            twoName,
            charOne,
            charTwo,
            aiOne,
            aiTwo,
            aiAccuracyOne,
            aiAccuracyTwo
        };
    }
    //function that when executed will render the game board and set all parameters to the game controller
    const startGame=()=>{
        const play=getPlayerValues();
        setPlayerAvatar();
        // Pass play values to game controller
        const game=GameController(
            play.oneName, play.twoName, play.charOne, play.charTwo, play.aiOne,
            play.aiTwo, play.aiAccuracyOne, play.aiAccuracyTwo
        );

        displayTitle.style.display='none';
        displayGame.style.display='grid';
        displayController(game);
    }

    isAIOne.forEach(radioBtn=>radioBtn.addEventListener('click', setForm));
    isAITwo.forEach(radioBtn=>radioBtn.addEventListener('click', setForm));
    start.addEventListener('click', startGame);
})(0);




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

function AI(maximizer, minimizer){

    // Function to determine if the next move will be random or the best possible 
    // move it can make.
    const determineMove=(board, precision)=>{
        let value =(Math.random()*101)/100
        let choice;
        if(value<=precision){
            choice=findBestMove(board, maximizer);
            return choice;
        }else{
            do{
                choice=Math.floor(Math.random()*9);
            }while(board[choice].getVal()!='');
            return choice;
        }
    };

    const emptyCells=(board)=>{
        return board.filter(empty=>empty.getVal()==='');
    };
    //evaluate the board for win conditions
    const evaluate=(board)=>{
        let win=null;

        winStates=[
                    [0,1,2],[3,4,5],[6,7,8],
                    [0,3,6],[1,4,7],[2,5,8],
                    [0,4,8],[2,4,6]
                  ];

        let status=board.map(({addChar, getVal})=>getVal());
        //Checks if win has been met
        for(let i=0;i<winStates.length;i++){
            [x,y,z]=winStates[i];
            if(status[x]===maximizer && status[y]===maximizer && status[z]===maximizer){
                win=maximizer;
            }else if(status[x]===minimizer && status[y]===minimizer && status[z]===minimizer){
                win=minimizer;
            }
        }
        if(win==null && emptyCells(board).length==0){
            return 'tie';
        }else{
            return win;
        }
    };

    
    //Return the index and score of the next best move. it takes the player char and game board as arguments
    const minimax=(board, depth, player)=>{
        let result=evaluate(board);
        let score={
            O: maximizer=='O'?10:-10,
            X: minimizer=='X'?-10:10,
            tie: 0
        }
        if(result!==null){
            return score[result]
        }
        
        if(player==maximizer){
            let bestScore=-1000;
            for(let x=0;x<board.length;x++){
                if(board[x].getVal()==''){
                    board[x].addChar(player);
                    bestScore=Math.max(bestScore,minimax(board, depth+1, minimizer));
                    board[x].addChar('');
                }
            }
            return bestScore;
        }else{
            let bestScore=1000;
            for(let x=0;x<board.length;x++){
                if(board[x].getVal()==''){
                    board[x].addChar(player);
                    bestScore=Math.min(bestScore,minimax(board, depth+1, maximizer));
                    board[x].addChar('');
                }
            }
            return bestScore
        }
    };
    
    
    //finds the best move to make on the board
    const findBestMove=(board, player)=>{
        let bestVal=-1000;
        let bestMove;
        for(let x=0;x<board.length;x++){
            if(board[x].getVal()==''){
                board[x].addChar(player);

                let value=minimax(board, 0, minimizer);
                // console.log(value)
                board[x].addChar('');
                if(value>bestVal){
                    bestMove=x;
                    bestVal=value;
                }
            }
        }
        return bestMove;
    }



    return{determineMove};
}

/*
**Handles the game itself and uses the previously defined functions to place Characters on the board.
**Checks for win conditions and tie breakers. Players are stored in objects and assigned a char upon
**creation of the game. This will also be the function that assigns either an AI or a second player 
**to the game. Players will also be able to input their name and will be assigned strings.
*/

function GameController(playerOne, playerTwo, pOneChar, pTwoChar, aiOne, aiTwo, difficultyOne, difficultyTwo){

    //Creates an array of player objects containing both their name and their Character
    const contenders=[{name:playerOne, char: pOneChar, score: 0, AI: aiOne, precision: difficultyOne}, 
                      {name:playerTwo, char: pTwoChar, score: 0, AI: aiTwo, precision: difficultyTwo}
                     ];
    //Initialize a variable called round and set it to 1
    let round=1;
    
    // variable to pause the AI in the display function from rendering endlessly. 
    //It is independent of the Check function, though the check function does ammend it.
    //This prevents the need to call check to halt the recursive render in ai display,
    //Which itself adds to the score, more than once. 
    let playGame=true;
    const setGame=(flag)=>{
        playGame=flag;
    }
    const getGame=()=>playGame;
    
    //allows manipulation of the continue state, while keeping it private
    let continueGame=true;
    const getContinue=()=>continueGame;
    const setContinue=(flag)=>{
        continueGame=flag;
    }

    const setRound=()=>{
        if(round<6) round++;
        else round=1;
    }
    const getRound=()=>{
        return {round};
    }
    //Ends the current round and moves onto the next
    const endRound=()=>{
        if(getRound().round<6){
            board.clearBoard();
            setRound();
            getScore();
            turn();
            updateBoard();
        }else{
            endGame();
        }
    }

    //Function that exectutes at the end of Every game->uses the resetGame function to bring everything back to start
    //If the end game button is clicked, display controller will reload the page.
    const endGame=()=>{
        const one=getPlayers()[0].score;
        const two=getPlayers()[1].score;
        
        winMessage().hideWinMessage();
        tieMessage().hideTieMessage();
        //Get the winner for the game
        if(one>two){
            console.log(`${getPlayers()[0].name} won the game!`);
            winGameMessage(getPlayers()[0]).getWinner();
        }else if(two>one){
            console.log(`${getPlayers()[1].name} won the game!`);
            winGameMessage(getPlayers()[1]).getWinner();
        }else{
            console.log(`Both players tied:`)
            console.log(`${getPlayers()[0].name} score: ${one}`);
            console.log(`${getPlayers()[1].name} score: ${two}`);
            tieGameMessage().getTieGame();
        }
    };

    //Reset game is a function to reset the contents of the game back to default values->can be triggered at anytime
    const resetGame=()=>{
        for(let x=0;x<getPlayers().length;x++){
            getPlayers()[x].score=0;
        }
        round=1;
        board.clearBoard();
        currentPlayer=contenders[0];
        updateBoard();
        setGame(true);
    };

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
        }else if(getWin() || getTie()){
            if(getWin()){
                getCurrent().score++;
                setGame(false);
                winMessage().getWinMessage();
                updateBoard();
            }else if(getTie()){
                setGame(false);
                tieMessage().getTieMessage();
                updateBoard();
            }
        } 
        return {getWin, getTie}
    };
    
    const winMessage=()=>{
        getWinMessage=()=>{
            document.querySelector('.winName').textContent=getCurrent().name;
            document.querySelector('.winMessage').style.display='block';
        }
        hideWinMessage=()=>{
            document.querySelector('.winName').textContent='';
            document.querySelector('.winMessage').style.display='none';
        }
        return {getWinMessage, hideWinMessage};
    };

    const tieMessage=()=>{
        getTieMessage=()=>{
            document.querySelector('.tieMessage').style.display='block';
        }
        hideTieMessage=()=>{
            document.querySelector('.tieMessage').style.display='none';
        }

        return {getTieMessage, hideTieMessage};
    };

    const winGameMessage=(winner)=>{
        const getWinner=()=>{
            document.querySelector('.winPlayer').textContent=winner.name;
            document.querySelector('.winGame').style.display='flex';
            document.querySelector('.winScore').textContent=winner.score;
        }
        const hideWinner=()=>{
            document.querySelector('.winPlayer').textContent='';
            document.querySelector('.winScore').textContent='';
            document.querySelector('.winGame').style.display='none';
        }

        return {getWinner, hideWinner};
    };

    const tieGameMessage=()=>{
        const getTieGame=()=>{
            document.querySelector('.tieGame').style.display='block';
        };
        const hideTieGame=()=>{
            document.querySelector('.tieGame').style.display='none';
        }
        return {getTieGame, hideTieGame};
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
        let maximizer=getCurrent().char;
        // Find the current minimizer for minimax function
        let minimizer = getCurrent().char==contenders[1].char ? contenders[0].char:contenders[1].char;
        let choice=AI(maximizer, minimizer).determineMove(board.getBoard(), getCurrent().precision);
        board.markIdx(choice, getCurrent().char);

        check();
        return choice;
    }

    //initialize the board upon loading
    updateBoard();

    return {
        player, 
        aiPlayer, 
        getCurrent, 
        getPlayers,
        getContinue,
        setContinue, 
        resetGame, 
        board,
        getRound, 
        getBoard: board.getBoard,
        endRound,
        endGame,
        setGame,
        getGame,
        winMessage,
        tieMessage,
        winGameMessage,
        tieGameMessage
    };
}

/*
**This function handles all things related to interactivity between the game controller and displaying those contents to
**the player. There also should not be any return values in here, as we are merely plugging in the
**content from our actual script and giving visual information to the player/s. 
*/

function displayController(game){
    // Get the player elements from HTML
    const playerOne=document.getElementById('nameOne');
    const playerTwo=document.getElementById('nameTwo');
    const scoreOne=document.getElementById('scoreNumOne');
    const scoreTwo=document.getElementById('scoreNumTwo');

    //selects the next round button for handling of next round
    const nextRound=document.getElementById('nextRound');

    //Select the span element that will display the current round on screen
    const round=document.getElementById('roundNum');

    //Select the div element that will display the board on the page
    const boardDiv=document.querySelector('.board');

    //Selects the endgame and reset buttons
    const reset=document.getElementById('resetGame');
    const end=document.getElementById('endGame');

    //This is to delay the AI from executing too fast, and gives the illusion that the computer is thinking
    const delay=(ms)=>new Promise(res=>setTimeout(res, ms));
    
    //FF that updates all statistics like score, names and round number
    const stats=()=>{
        playerOne.textContent=game.getPlayers()[0].name;
        playerTwo.textContent=game.getPlayers()[1].name;
        scoreOne.textContent=game.getPlayers()[0].score;
        scoreTwo.textContent=game.getPlayers()[1].score;
        round.textContent=game.getRound().round;
        //Sets the class for whose turn it currently is
        if(game.getCurrent()==game.getPlayers()[0]){
            playerOne.classList.add('turn');
            document.querySelector('.scoreOne').classList.add('turn');

            if(playerTwo.classList.contains('turn')){
                playerTwo.classList.remove('turn');
                document.querySelector('.scoreTwo').classList.remove('turn');
            }
        }else if(game.getCurrent()==game.getPlayers()[1]){
            playerTwo.classList.add('turn');
            document.querySelector('.scoreTwo').classList.add('turn');
            
            if(playerOne.classList.contains('turn')){
                playerOne.classList.remove('turn');
                document.querySelector('.scoreOne').classList.remove('turn');
            }
        }
    }

    //This renders the board when the game is loaded into memory
    const render=(target)=>{
        //if we end the game, we return to the title screen
        if(!game.getContinue()) location.reload();
        if(!game.getGame() && game.getRound().round<6) {nextRound.style.display='block';}
        if(!game.getGame() && game.getRound().round>=6){game.endGame();}
        stats();

        const board=game.getBoard();
        boardDiv.textContent='';
        board.forEach((cell, index)=>{
            const cellButton=document.createElement("button");

            
            let word=document.createElement('span')
            word.classList.add('chars')
            word.textContent=cell.getVal();
            cellButton.appendChild(word);
            
            cellButton.classList.add('tempCells');
            if(index==2 || index==5 || index==8){
                cellButton.classList.add('R');
            }
            if(index==6 || index==7 || index==8){
                cellButton.classList.add('B');
            }

            cellButton.dataset.column=index;
            //Sets the animation for the clicked cell
            if(target!=undefined && cellButton.dataset.column==target){
                word.classList.add('animate');
            }
            
            boardDiv.appendChild(cellButton);
        })

        if(game.getCurrent().AI && game.getGame()){
            (async()=>{
                await delay(1000);
                let choice=game.aiPlayer();
                let target=document.querySelector('.tempCells').dataset.column=choice;
                render(target);
            })();
            
        }

    };

    function clickHandler(e){
        const index=e.target.dataset.column;
        //Prevents the action if clicked outside of button
        if(index==undefined) return;
        //Prevents player from wasting a turn if the cell is already occupied
        if(game.getBoard()[index].getVal()!='') return;
        if(!game.getGame()) return;
        if(game.getCurrent().AI) Event.stop(e);
        if(!game.getCurrent().AI) game.player(index);
        render(index);
    }
    
    boardDiv.addEventListener('click', clickHandler);

    //two event handlers that change the state of the game, and then calls render
    reset.addEventListener('click', ()=>{
        game.winMessage().hideWinMessage();
        game.tieMessage().hideTieMessage();
        game.winGameMessage().hideWinner();
        game.tieGameMessage().hideTieGame();
        game.resetGame();
        nextRound.style.display='none';
        render();  
    });

    end.addEventListener('click', ()=>{
        game.setContinue(false);
        render();
    });

    // event handler for next round
    nextRound.addEventListener('click', ()=>{
        game.endRound();
        game.setGame(true);
        (async()=>{
            document.querySelectorAll('h2').forEach((header)=>{
                header.classList.add('dissolveOut');
            })
            nextRound.classList.add('fadeAway');
            await delay(700);
            game.winMessage().hideWinMessage();
            game.tieMessage().hideTieMessage();
            nextRound.style.display='none';
            nextRound.classList.remove('fadeAway');
            document.querySelectorAll('h2').forEach((header)=>{
                header.classList.remove('dissolveOut');
            })
            render();
        })();
    })

    render();
    
}

/*
**Legacy Code: This is code stored at the bottom of the page incase future updates require the creation/implementation of out of use code.
**    gameBoard(){
**        ...
**        ...
**        //Make the actual board private and display as needed. This board will need to be converted to a 2d Array
**        //for playing in the console. 
**
**        const displayBoard=()=>{
**            let copy=board.map((cell)=>cell.getVal()); //another way is to say copy=[].concat(board) then map the value when running through the while loop. 
**
**            const boardVal=[];
**             while(copy.length) boardVal.push(copy.splice(0,3));
**
**            console.log(boardVal);
**        }; **(LEGACY CODE| DELETE OR MOVE FOR LATER USE->GAME NOW DISPLAYS IN DOM)
**    }
*/