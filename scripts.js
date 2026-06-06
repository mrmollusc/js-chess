const chess_board = document.querySelector('#chess_board');
const player_turn = document.querySelector('#player_turn');
const info = document.querySelector('#info'); 
var start_pos_id; //id of piece dragged
var dragged_element;
//pieces

//white
const w_king = '<div class="piece" id="king"><img src="wk.png"></div>';
const w_queen = '<div class="piece" id="queen"><img src="wq.png"></div>';
const w_bishop = '<div class="piece" id="bishop"><img src="wb.png"></div>';
const w_knight = '<div class="piece" id="knight"><img src="wn.png"></div>';
const w_rook = '<div class="piece" id="rook"><img src="wr.png"></div>';
const w_pawn = '<div class="piece" id="pawn"><img src="wp.png"></div>';

//black
const b_king = '<div class="piece" id="king"><img src="bk.png"></div>';
const b_queen = '<div class="piece" id="queen"><img src="bq.png"></div>';
const b_bishop = '<div class="piece" id="bishop"><img src="bb.png"></div>';
const b_knight = '<div class="piece" id="knight"><img src="bn.png"></div>';
const b_rook = '<div class="piece" id="rook"><img src="br.png"></div>';
const b_pawn = '<div class="piece" id="pawn"><img src="bp.png"></div>';

const start_board = [
    b_rook, b_knight, b_bishop, b_queen, b_king, b_bishop, b_knight, b_rook,
    b_pawn, b_pawn, b_pawn, b_pawn, b_pawn, b_pawn, b_pawn, b_pawn,
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    w_pawn, w_pawn, w_pawn, w_pawn, w_pawn, w_pawn, w_pawn, w_pawn,
    w_rook, w_knight, w_bishop, w_queen, w_king, w_bishop, w_knight, w_rook
]

function create_board() {
    start_board.forEach((index, i) => {

        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = index;
        square.firstChild && square.firstChild.setAttribute('draggable', true);
        square.setAttribute('square_id', i);
        const row = Math.floor((63-i)/8) + 1;

        //colour the board
        if(row % 2 == 0){
            square.classList.add(i % 2 == 0 ? 'ice' : 'navy');
        }
        else{
            square.classList.add(i % 2 != 0 ? 'ice' : 'navy');
        }
        //piece id the board
        if(i<=15){
            square.firstChild.firstChild.classList.add('black');
        }
        if(i>=48){
           square.firstChild.firstChild.classList.add('white'); 
        }
        
        chess_board.append(square);
    })
}
create_board();

const all_squares = document.querySelectorAll("#chess_board .square");

all_squares.forEach(square => {//listens for dragging events
    square.addEventListener('dragstart', drag_start);
    square.addEventListener('dragover', drag_over);
    square.addEventListener('drop', drag_drop);
})

function drag_start(e){ //measures where you dragged from
    start_pos_id = e.target.parentNode.getAttribute('square_id');
    dragged_element = e.target;
}

function drag_over(e){// uh idk
    e.preventDefault();
}

function drag_drop(e){//detects drop of drag...
    e.stopPropagation();    
    e.target.append(dragged_element);
}