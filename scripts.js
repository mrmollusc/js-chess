const chess_board = document.querySelector('#chess_board');
const player_turn = document.querySelector('#player_turn');
const info = document.querySelector('#info'); 
var start_pos_id; //id of piece dragged
var dragged_element;
var turn = 'white';
var opp_taken;
player_turn.textContent = 'white';
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

function delay(ms){ //delAy
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

all_squares.forEach((square, i) => {//listens for dragging events
    square.addEventListener('dragstart', drag_start);
    square.addEventListener('dragover', drag_over);
    square.addEventListener('drop', drag_drop);
    if(square.children.length==2){
        all_squares[i].innerHTML='';
    }
})

function drag_start(e){ //measures where you dragged from
    start_pos_id = e.currentTarget.getAttribute('square_id'); // fix for vid
    dragged_element = e.target.parentNode;
}

function drag_over(e){// uh idk
    e.preventDefault();
}

function drag_drop(e){//detects drop of drag...
    e.stopPropagation();  
    const your_turn = dragged_element.firstChild.classList.contains(turn);
    const opp_turn = turn === 'white' ? 'black' : 'white';
    opp_taken = e.target.classList.contains(opp_turn);
    const valid = check_valid(e.target)

    if(your_turn && valid){

        if(opp_taken){ //if regular capture
            e.target.parentNode.append(dragged_element);
            e.target.remove(); //kept leaving ghost pieces with no img child, this is the fix
            document.querySelectorAll('.piece:not(:has(img))').forEach(piece => piece.remove()); 
            change_turn();
                console.log(dragged_element.id)
            return;
        }

        e.target.append(dragged_element); 
        change_turn();
        return;
        }
}

function change_turn(){ //changes turn no sh       utdown
    if(turn === 'black'){
        turn = 'white';
        player_turn.textContent = 'white';
        change_ids();
    }
    else{
        turn = 'black';
        player_turn.textContent = 'black';
        revert_ids();
    }
    
}
function change_ids(){//um the tutorial said so, id's from white = 0 for piece movement: supposedly
    const all_squares = document.querySelectorAll('.square')
    all_squares.forEach((square, i) => square.setAttribute('square_id', (63-i))
    )
}
function revert_ids(){//yeah seems useful
    const all_squares = document.querySelectorAll('.square')
    all_squares.forEach((square, i) => square.setAttribute('square_id', (i)) 
    )   
}

function check_valid(target){// can you play that?
    const target_square = event.target.closest('.square');
    const target_id = target_square ? Number(target_square.getAttribute('square_id')) : null;
    const start_id = Number(start_pos_id);
    const piece = dragged_element.id;
    const can_drop = !target_square.firstChild || opp_taken; //no more friendly fire haah
    const start_column = start_id % 8; // ALL THE MANUAL CASES SOB
    const target_column = target_id % 8;
    const col_diff = target_column - start_column;
    const row_diff = target_id - start_id;   

    
    //all the legal moves go here

    switch(piece){
        
        case 'pawn':
            const pawn_start_row = [8, 9, 10, 11, 12, 13, 14, 15];

            const one_step = start_id + 8 === target_id && !document.querySelector(`[square_id="${start_id + 8}"]`).firstChild;
            const two_step = pawn_start_row.includes(start_id) && start_id + 16 === target_id && !document.querySelector(`[square_id="${start_id + 8}"]`).firstChild && !document.querySelector(`[square_id="${start_id + 16}"]`).firstChild;
            const capture_right = start_id + 7 === target_id && document.querySelector(`[square_id="${start_id + 7}"]`).firstChild && start_id % 8 != 0 && can_drop;
            const capture_left = start_id + 9 === target_id && document.querySelector(`[square_id="${start_id + 9}"]`).firstChild && start_id % 8 != 7 && can_drop;

            if(one_step || two_step || capture_left || capture_right){
                return true;
            }
        break;
        case 'knight': //the dum yt tutorial doesn't account for EDGE wrap ugh

            const up2_right1 = (row_diff === 17) && (col_diff === 1);
            const p2_left1 = (row_diff === 15) && (col_diff === -1);
            const up1_right2 = (row_diff === 10) && (col_diff === 2);
            const up1_left2 = (row_diff === 6) && (col_diff === -2);
            const down2_left1 = (row_diff === -17) && (col_diff === -1);
            const down2_right1 = (row_diff === -15) && (col_diff === 1);
            const down1_left2 = (row_diff === -10) && (col_diff === -2);
            const down1_right2 = (row_diff === -6) && (col_diff === 2);

            if(can_drop && (up2_right1 || p2_left1 || up1_right2 || up1_left2 || down2_left1 || down2_right1 || down1_left2 || down1_right2)){
                return true;
            }
        case 'king': //bruh bruh bruh
            var king_moves = [];
            function get_king_moves() {
                const directions = [
                    { offset: 8,  type: 'v'  },
                    { offset: -8, type: 'v'  },
                    { offset: 1,  type: 'h'  },
                    { offset: -1, type: 'h'  },
                    { offset: 9,  type: 'dr' },
                    { offset: 7,  type: 'dl' },
                    { offset: -7, type: 'ur' },
                    { offset: -9, type: 'ul' } 
                ];

                directions.forEach(dir => {
                    for (let i = 1; i < 2; i++) { 
                        let legal_id = start_id + dir.offset * i;
                        if (legal_id < 0 || legal_id > 63) break;
                        if (dir.type === 'h'  && Math.floor(start_id / 8) !== Math.floor(legal_id / 8)) break;
                        if (dir.type === 'dr' && (legal_id % 8 <= start_id % 8)) break;
                        if (dir.type === 'dl' && (legal_id % 8 >= start_id % 8)) break;
                        if (dir.type === 'ur' && (legal_id % 8 <= start_id % 8)) break;
                        if (dir.type === 'ul' && (legal_id % 8 >= start_id % 8)) break;

                        let square = document.querySelector(`[square_id="${legal_id}"]`);
                        if (!square) break;

                        const pieceOnSquare = square.querySelector('.piece');
                        if (pieceOnSquare) {
                            let piece_colour = pieceOnSquare.querySelector('img').getAttribute('class');
                            if (piece_colour === turn) { 
                                break;
                            }
                            king_moves.push(legal_id);
                            break;
                        }
                        king_moves.push(legal_id);
                    }
                });
            }

            get_king_moves();
            console.log("king ",king_moves);
            if (king_moves.includes(target_id)) {
                return true;
            }
            return false;

        case 'bishop':
            var bishop_moves = [];
            function get_bishop_moves() {
                const directions = [
                    { offset: 9,  type: 'dr' },
                    { offset: 7,  type: 'dl' },
                    { offset: -7, type: 'ur' },
                    { offset: -9, type: 'ul' }
                ];

                directions.forEach(dir => {
                    for (let i = 1; i < 8; i++) { 
                        let legal_id = start_id + dir.offset * i;
                        if (legal_id < 0 || legal_id > 63) break;
                        if (dir.type === 'dr' && (legal_id % 8 <= start_id % 8)) break;
                        if (dir.type === 'dl' && (legal_id % 8 >= start_id % 8)) break;
                        if (dir.type === 'ur' && (legal_id % 8 <= start_id % 8)) break;
                        if (dir.type === 'ul' && (legal_id % 8 >= start_id % 8)) break;

                        let square = document.querySelector(`[square_id="${legal_id}"]`);
                        if (!square) break;

                        const pieceOnSquare = square.querySelector('.piece');
                        if (pieceOnSquare) {
                            let piece_colour = pieceOnSquare.querySelector('img').getAttribute('class');
                            if (piece_colour === turn) { 
                                break;
                            }
                            bishop_moves.push(legal_id);
                            break;
                        }
                        bishop_moves.push(legal_id);
                    }
                });
            }

            get_bishop_moves();
            console.log("bishop ",bishop_moves);
            if (bishop_moves.includes(target_id)) {
                return true;
            }
            return false;

        case 'rook':
            var rook_moves = [];
            function get_rook_moves() {
                const directions = [
                    { offset: 8,  type: 'v'  },
                    { offset: -8, type: 'v'  },
                    { offset: 1,  type: 'h'  },
                    { offset: -1, type: 'h'  }
                ];

                directions.forEach(dir => {
                    for (let i = 1; i < 8; i++) { 
                        let legal_id = start_id + dir.offset * i;
                        if (legal_id < 0 || legal_id > 63) break;
                        if (dir.type === 'h'  && Math.floor(start_id / 8) !== Math.floor(legal_id / 8)) break;

                        let square = document.querySelector(`[square_id="${legal_id}"]`);
                        if (!square) break;

                        const pieceOnSquare = square.querySelector('.piece');
                        if (pieceOnSquare) {
                            let piece_colour = pieceOnSquare.querySelector('img').getAttribute('class');
                            if (piece_colour === turn) { 
                                break;
                            }
                            rook_moves.push(legal_id);
                            break;
                        }
                        rook_moves.push(legal_id);
                    }
                });
            }

            get_rook_moves();
            console.log("rook ",rook_moves);
            if (rook_moves.includes(target_id)) {
                return true;
            }
            return false;

        case 'queen':
            var queen_moves = [];
            function get_queen_moves() {
                const directions = [
                    { offset: 8,  type: 'v'  },
                    { offset: -8, type: 'v'  },
                    { offset: 1,  type: 'h'  },
                    { offset: -1, type: 'h'  },
                    { offset: 9,  type: 'dr' },
                    { offset: 7,  type: 'dl' },
                    { offset: -7, type: 'ur' },
                    { offset: -9, type: 'ul' }
                ];

                directions.forEach(dir => {
                    for (let i = 1; i < 8; i++) { 
                        let legal_id = start_id + dir.offset * i;
                        if (legal_id < 0 || legal_id > 63) break;
                        if (dir.type === 'h'  && Math.floor(start_id / 8) !== Math.floor(legal_id / 8)) break;
                        if (dir.type === 'dr' && (legal_id % 8 <= start_id % 8)) break;
                        if (dir.type === 'dl' && (legal_id % 8 >= start_id % 8)) break;
                        if (dir.type === 'ur' && (legal_id % 8 <= start_id % 8)) break;
                        if (dir.type === 'ul' && (legal_id % 8 >= start_id % 8)) break;

                        let square = document.querySelector(`[square_id="${legal_id}"]`);
                        if (!square) break;

                        const pieceOnSquare = square.querySelector('.piece');
                        if (pieceOnSquare) {
                            let piece_colour = pieceOnSquare.querySelector('img').getAttribute('class');
                            if (piece_colour === turn) { 
                                break;
                            }
                            queen_moves.push(legal_id);
                            break;
                        }
                        queen_moves.push(legal_id);
                    }
                });
            }

            get_queen_moves();
            console.log("queen ",queen_moves);
            if (queen_moves.includes(target_id)) {
                return true;
            }
            return false;
    }
        }
change_ids();