const chess_board = document.querySelector('#chess_board');
const player_turn = document.querySelector('#player_turn');
const info = document.querySelector('#info'); 
var start_pos_id; //id of piece dragged
var dragged_element;
var opp_taken = [];
var pawn_moves = [];
var turn = 'white';
var knight_moves = [];
var rook_moves = [];
var king_moves = [];
var bishop_moves = [];
var queen_moves = [];
var new_attacked_squares = [];
var new_enemy_attacked_squares = [];
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
        square.setAttribute('white_square_id', 63-i);
        square.setAttribute('black_square_id', i);
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
    start_pos_id = e.currentTarget.getAttribute(`${turn}_square_id`); // fix for vid
    dragged_element = e.target.parentNode;
}

function drag_over(e){// uh idk
    e.preventDefault();
}

function drag_drop(e){//detects drop of drag...
    e.stopPropagation();  
    const target_square = e.target.closest('.square');
    if (!target_square) return;
    const start_square = document.querySelector(`[${turn}_square_id="${start_pos_id}"]`);
    const your_turn = dragged_element.firstChild.classList.contains(turn);
    const opp_turn = turn === 'white' ? 'black' : 'white';
    opp_taken = e.target.classList.contains(opp_turn);

    const valid = check_valid(e.target)    
    var your_king = document.querySelector(`#king .${turn}`).parentElement.parentElement.getAttribute(`${turn}_square_id`);
    var their_king = document.querySelector(`#king .${opp_turn}`).parentElement.parentElement.getAttribute(`${turn}_square_id`);
    
    function is_in_check(){
        attacked_squares(turn);
        const their_king = document.querySelector(`#king .${opp_turn}`)?.parentElement.parentElement.getAttribute(`${turn}_square_id`);
        if (their_king && new_attacked_squares.includes(Number(their_king))){
            console.warn('check');
        }
    }

    function is_illegal(){
        const your_king = document.querySelector(`#king .${turn}`)?.parentElement.parentElement.getAttribute(`${opp_turn}_square_id`);
        enemy_attacked_squares(opp_turn);
        const illegal = your_king && new_enemy_attacked_squares.includes(Number(your_king));
        if (illegal) {
            console.warn('illegal move');
        }
        return illegal;
    }

    if(valid && your_turn){ //if regular capture
        if(opp_taken){
            const existing_piece = target_square.querySelector('.piece');
            target_square.append(dragged_element); //kept leaving ghost pieces with no img child, this is the fix
            existing_piece.remove();
            document.querySelectorAll('.piece:not(:has(img))').forEach(ghost => ghost.remove());
            console.log(new_attacked_squares);
            is_in_check();
            if (is_illegal()) {
                start_square.append(dragged_element);
                if (existing_piece) target_square.append(existing_piece);
                return;
            }
            change_turn();
            return;
        }

        target_square.append(dragged_element); //kept leaving ghost pieces with no img child, this is the fix
        document.querySelectorAll('.piece:not(:has(img))').forEach(ghost => ghost.remove());
        console.log(new_attacked_squares);
        is_in_check();
        if (is_illegal()) {
            start_square.append(dragged_element);
            return;
        }
        change_turn();
        return;        
    }    
}



function attacked_squares(col){
    var attacked_squares = [];
    all_squares.forEach((square, i) => {   

        let correct_square = document.querySelector(`[${col}_square_id="${i}"]`);
        if (!correct_square) return;

        const piece = correct_square.querySelector('.piece');
        const img = piece?.querySelector('img');

        if (img && img.getAttribute('class') === col) {
            const piece_type = piece.getAttribute('id');
            
            if (piece_type == 'pawn') {
                get_virtual_pawn_attacks(i, attacked_squares, col);//only the diagonal movements count as threatning attacks (ie give check)
            }
            else if (piece_type == 'knight') {
                get_knight_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'bishop') {
                get_bishop_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'rook') {
                get_rook_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'king') {
                get_king_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'queen') {
                get_queen_moves(i, attacked_squares, col);
            }
        }
    });
    new_attacked_squares = [...new Set(attacked_squares)].sort((a, b) => a - b);
    console.log([...new Set(attacked_squares)].sort((a, b) => a - b));  
}
function enemy_attacked_squares(col){
    var attacked_squares = [];
    all_squares.forEach((square, i) => {   

        let correct_square = document.querySelector(`[${col}_square_id="${i}"]`);
        if (!correct_square) return;

        const piece = correct_square.querySelector('.piece');
        const img = piece?.querySelector('img');

        if (img && img.getAttribute('class') === col) {
            const piece_type = piece.getAttribute('id');
            
            if (piece_type == 'pawn') {
                get_virtual_pawn_attacks(i, attacked_squares, col);//only the diagonal movements count as threatning attacks (ie give check)
            }
            else if (piece_type == 'knight') {
                get_knight_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'bishop') {
                get_bishop_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'rook') {
                get_rook_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'king') {
                get_king_moves(i, attacked_squares, col);
            }
            else if (piece_type == 'queen') {
                get_queen_moves(i, attacked_squares, col);
            }
        }
    });
    new_enemy_attacked_squares = [...new Set(attacked_squares)].sort((a, b) => a - b);
    console.log([...new Set(attacked_squares)].sort((a, b) => a - b));  
}

window.addEventListener("keydown",(e)=>{
    if(event.repeat){
            return;
        }
        if(e.key === 'l'){
            const attacking_colour = (turn === 'white') ? 'black' : 'white';
            attacked_squares(attacking_colour);
            new_attacked_squares.forEach((a)=>{
                const marked = document.querySelector(`[${attacking_colour}_square_id="${a}"]`);
                marked.classList.add('attack-highlight');
            })
        }
        if(e.key === 'k'){
            const attacking_colour = (turn === 'white') ? 'white' : 'black';
            enemy_attacked_squares(attacking_colour);
            new_enemy_attacked_squares.forEach((a)=>{
                const marked = document.querySelector(`[${attacking_colour}_square_id="${a}"]`);
                marked.classList.add('attack-highlight');
            })
        }
    })
window.addEventListener("keyup",(e)=>{
    if(event.repeat){
            return;
        }
        if(e.key === 'l'){
            const attacking_colour = (turn === 'white') ? 'black' : 'white';
            new_attacked_squares.forEach((a)=>{
                const marked = document.querySelector(`[${attacking_colour}_square_id="${a}"]`);
                marked.classList.remove('attack-highlight');
            })
        }
        if(e.key === 'k'){
            const attacking_colour = (turn === 'white') ? 'white' : 'black';
            new_enemy_attacked_squares.forEach((a)=>{
                const marked = document.querySelector(`[${attacking_colour}_square_id="${a}"]`);
                marked.classList.remove('attack-highlight');
            })
        }
    })

function change_turn(){ //changes turn no sh       utdown
    if(turn === 'black'){
        turn = 'white';
        player_turn.textContent = 'white';
    }
    else{
        turn = 'black';
        player_turn.textContent = 'black';
    }
    
}   

function get_virtual_pawn_attacks(start, array, col = turn) { 
            const directions = [
                { offset: 9,  type: 'dl'  },
                { offset: 7, type: 'dr'  }
            ];

            directions.forEach(dir => {
                    let legal_id = start + dir.offset;
                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    const pieceOnSquare = square ? square.querySelector('#pawn, #queen, #king, #rook, #knight, #bishop') : null;
                        
                    const column_diff = legal_id % 8 - start % 8;
                    if (legal_id < 0 || legal_id > 63) return;
                    if (!square) return;

                    if(Math.abs(legal_id%8-start%8)!=1) return;
                    
                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        
                        if (piece_colour == col) { 
                            return;
                        }
                        array.push(legal_id);
                        return;
                    }
                    array.push(legal_id);
            });
}

function get_pawn_attacks(start, array, col = turn) { 
            const directions = [
                { offset: 9,  type: 'dl'  },
                { offset: 7, type: 'dr'  }
            ];

            directions.forEach(dir => {
                for (let i = 1; i < 2; i++) { 
                    let legal_id = start + dir.offset * i;
                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                        
                    const column_diff = legal_id % 8 - start % 8;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (!square) break;

                    if (dir.type === 'dl' && !pieceOnSquare) break;
                    if (dir.type === 'dr' && !pieceOnSquare) break;

                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour == col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}

function get_pawn_moves(start, array, col = turn) { 
            const pawn_start_row = [8, 9, 10, 11, 12, 13, 14, 15];
            const directions = [
                { offset: 8,  type: 'v'  },
                { offset: 16, type: 'v2'},
            ];

            directions.forEach(dir => {
                for (let i = 1; i < 2; i++) { 
                    let legal_id = start + dir.offset * i;
                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    let block_piece = document.querySelector(`[${col}_square_id="${legal_id-8}"]`);
                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                    const pieceOnSquarebefore = block_piece ? block_piece.querySelector('.piece') : null;
                        
                    const column_diff = legal_id % 8 - start % 8;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (!square) break;

                    if (dir.type === 'v' && pieceOnSquare) break;
                    if (dir.type === 'v2' &&(pieceOnSquarebefore || pieceOnSquare)) break;
                    if (dir.type === 'v2' && !pawn_start_row.includes(start)) break;

                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour == col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}  
    
function get_knight_moves(start, array, col = turn) {
    start = Number(start); 
            const directions = [
                { offset: 17,  type: 'u2l1'  },
                { offset: 15, type: 'u2r1'  },
                { offset: 10,  type: 'u1l2'  },
                { offset: 6, type: 'u1r2'  },
                { offset: -17,  type: 'd2r1' },
                { offset: -15,  type: 'd2l1' },
                { offset: -10, type: 'd1r2' },
                { offset: -6, type: 'd1l2' } 
            ];

            directions.forEach(dir => {
                for (let i = 1; i < 2; i++) { 
                    let legal_id = start + dir.offset * i;
                    const column_diff = legal_id % 8 - start % 8;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (dir.type === 'u2r1' && column_diff != -1) break;
                    if (dir.type === 'u2l1' && column_diff != 1) break;
                    if (dir.type === 'u1r2' && column_diff != -2) break;
                    if (dir.type === 'u1l2' && column_diff != 2) break;
                    if (dir.type === 'd2r1' && column_diff != -1) break;
                    if (dir.type === 'd2l1' && column_diff != 1) break;
                    if (dir.type === 'd1r2' && column_diff != -2) break;
                    if (dir.type === 'd1l2' && column_diff != 2) break;

                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);

                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour === col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}
    
function get_king_moves(start, array, col = turn) {
    start = Number(start); 
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
                    let legal_id = start + dir.offset * i;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (dir.type === 'h'  && Math.floor(start / 8) !== Math.floor(legal_id / 8)) break;
                    if (dir.type === 'dr' && (legal_id % 8 <= start % 8)) break;
                    if (dir.type === 'dl' && (legal_id % 8 >= start % 8)) break;
                    if (dir.type === 'ur' && (legal_id % 8 <= start % 8)) break;
                    if (dir.type === 'ul' && (legal_id % 8 >= start % 8)) break;

                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    if (!square) break;

                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour === col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}  
    
function get_bishop_moves(start, array, col = turn) {
    start = Number(start); 
            const directions = [
                { offset: 9,  type: 'dr' },
                { offset: 7,  type: 'dl' },
                { offset: -7, type: 'ur' },
                { offset: -9, type: 'ul' }
            ];

                directions.forEach(dir => {
                for (let i = 1; i < 8; i++) { 
                let legal_id = start + dir.offset * i;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (dir.type === 'dr' && (legal_id % 8 <= start % 8)) break;
                    if (dir.type === 'dl' && (legal_id % 8 >= start % 8)) break;
                    if (dir.type === 'ur' && (legal_id % 8 <= start % 8)) break;
                    if (dir.type === 'ul' && (legal_id % 8 >= start % 8)) break;

                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    if (!square) break;

                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour === col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}

function get_rook_moves(start, array, col = turn) {
    start = Number(start); 
            const directions = [
                { offset: 8,  type: 'v'  },
                { offset: -8, type: 'v'  },
                { offset: 1,  type: 'h'  },
                { offset: -1, type: 'h'  }
            ];

            directions.forEach(dir => {
                for (let i = 1; i < 8; i++) { 
                    let legal_id = start + dir.offset * i;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (dir.type === 'h'  && Math.floor(start / 8) !== Math.floor(legal_id / 8)) break;

                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    if (!square) break;

                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour === col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}
    
function get_queen_moves(start, array, col = turn) {    
    start = Number(start); 
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
                    let legal_id = start + dir.offset * i;
                    if (legal_id < 0 || legal_id > 63) break;
                    if (dir.type === 'h'  && Math.floor(start / 8) !== Math.floor(legal_id / 8)) break;
                    if (dir.type === 'dr' && (legal_id % 8 <= start % 8)) break;
                    if (dir.type === 'dl' && (legal_id % 8 >= start % 8)) break;
                    if (dir.type === 'ur' && (legal_id % 8 <= start % 8)) break;
                    if (dir.type === 'ul' && (legal_id % 8 >= start % 8)) break;

                    let square = document.querySelector(`[${col}_square_id="${legal_id}"]`);
                    if (!square) break;

                    const pieceOnSquare = square ? square.querySelector('.piece') : null;
                    if (pieceOnSquare) {
                        let piece_colour = pieceOnSquare.querySelector('img')?.getAttribute('class');
                        if (piece_colour === col) { 
                            break;
                        }
                        array.push(legal_id);
                        break;
                    }
                    array.push(legal_id);
                }
            });
}


function check_valid(target){// can you play that?
    const target_square = event.target.closest('.square');
    const target_id = target_square ? Number(target_square.getAttribute(`${turn}_square_id`)) : null;
    const start_id = Number(start_pos_id);
    const piece = dragged_element.id;
    const can_drop = !target_square.firstChild || opp_taken; //no more friendly fire haah
    const start_column = start_id % 8; // ALL THE MANUAL CASES SOB
    const target_column = target_id % 8;
    const col_diff = target_column - start_column;
    const row_diff = target_id - start_id;  

    switch(piece){
        case 'pawn':
            pawn_moves=[];
            get_pawn_moves(start_id,pawn_moves,turn);
            get_pawn_attacks(start_id,pawn_moves,turn);
            console.log("pawn ",pawn_moves);
            if (pawn_moves.includes(target_id)) {
                return true;
            }
            return false;
        case 'knight': //the dum yt tutorial doesn't account for EDGE wrap ugh
            knight_moves=[];
            get_knight_moves(start_id,knight_moves);
            console.log("knight ",knight_moves,turn);
            if (knight_moves.includes(target_id)) {
                return true;
            }
            return false;
        case 'king': //bruh bruh bruh
            king_moves=[];
            get_king_moves(start_id,king_moves,turn);
            console.log("king ",king_moves);
            if (king_moves.includes(target_id)) {
                return true;
            }
            return false;
        case 'bishop':
            bishop_moves=[];
            get_bishop_moves(start_id,bishop_moves,turn);
            console.log("bishop ",bishop_moves);
            if (bishop_moves.includes(target_id)) {
                return true;
            }
            return false;
        case 'rook':
            rook_moves=[];
            get_rook_moves(start_id,rook_moves,turn);
            console.log("rook ",rook_moves);
            if (rook_moves.includes(target_id)) {
                return true;
            }
            return false;
        case 'queen':
            queen_moves=[];
            get_queen_moves(start_id,queen_moves,turn);
            console.log("queen ",queen_moves);
            if (queen_moves.includes(target_id)) {
                return true;
            }
            return false;
    }
    
    
}

