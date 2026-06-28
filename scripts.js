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
const w_king = '<div class="piece" id="king" draggable="true"><img src="wk.png" draggable="false"></div>';
const w_queen = '<div class="piece" id="queen" draggable="true"><img src="wq.png" draggable="false"></div>';
const w_bishop = '<div class="piece" id="bishop" draggable="true"><img src="wb.png" draggable="false"></div>';
const w_knight = '<div class="piece" id="knight" draggable="true"><img src="wn.png" draggable="false"></div>';
const w_rook = '<div class="piece" id="rook" draggable="true"><img src="wr.png" draggable="false"></div>';
const w_pawn = '<div class="piece" id="pawn" draggable="true"><img src="wp.png" draggable="false"></div>';

//black
const b_king = '<div class="piece" id="king" draggable="true"><img src="bk.png" draggable="false"></div>';
const b_queen = '<div class="piece" id="queen" draggable="true"><img src="bq.png" draggable="false"></div>';
const b_bishop = '<div class="piece" id="bishop" draggable="true"><img src="bb.png" draggable="false"></div>';
const b_knight = '<div class="piece" id="knight" draggable="true"><img src="bn.png" draggable="false"></div>';
const b_rook = '<div class="piece" id="rook" draggable="true"><img src="br.png" draggable="false"></div>';
const b_pawn = '<div class="piece" id="pawn" draggable="true"><img src="bp.png" draggable="false"></div>';

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
        const piece = square.querySelector('.piece');
        if (piece) {
            piece.setAttribute('draggable', true);
            const image = piece.querySelector('img');
            if (image) image.setAttribute('draggable', false);
        }
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

//measures where you dragged from, also stupid CHROMIUM blocks drag-drop by default
function drag_start(e) {
    const piece = e.target.closest('.piece');
    if (!piece) return;

    const square = piece.closest('.square');
    if (!square) return;

    start_pos_id = square.getAttribute(`${turn}_square_id`);
    dragged_element = piece;

    if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', start_pos_id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(piece, piece.offsetWidth / 2, piece.offsetHeight / 2);
    }
}

function drag_over(e){// uh idk
    e.preventDefault();
}

function drag_drop(e){//detects drop of drag...
    e.preventDefault();
    e.stopPropagation();  
    const target_square = e.target.closest('.square');
    if (!target_square) return;
    const start_square = document.querySelector(`[${turn}_square_id="${start_pos_id}"]`);
    const your_turn = dragged_element.firstChild.classList.contains(turn);
    const opp_turn = turn === 'white' ? 'black' : 'white';
    const existing_piece = target_square.querySelector('.piece');
    opp_taken = existing_piece?.querySelector('img')?.classList.contains(opp_turn) || false;

    const valid = check_valid(e.target)
    var your_king = document.querySelector(`#king .${turn}`).parentElement.parentElement.getAttribute(`${turn}_square_id`);
    var their_king = document.querySelector(`#king .${opp_turn}`).parentElement.parentElement.getAttribute(`${turn}_square_id`);
    
    function is_in_check(){
        attacked_squares(turn);
        const their_king = document.querySelector(`#king .${opp_turn}`)?.parentElement.parentElement.getAttribute(`${turn}_square_id`);
        if (their_king && new_attacked_squares.includes(Number(their_king))){
            console.warn('check');
            return true;
        }
        return false;
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
        if (opp_taken) {
            const existing_piece = target_square.querySelector('.piece');
            if (existing_piece) {
                existing_piece.remove();
            }
            target_square.append(dragged_element); //kept leaving ghost pieces with no img child, this is the fix
            document.querySelectorAll('.piece:not(:has(img))').forEach(ghost => ghost.remove());
            is_in_check();
            if (is_illegal()) {
                start_square.append(dragged_element);
                if (existing_piece) target_square.append(existing_piece);
                return;
            }
            change_turn();
            if (check_for_checkmate(opp_turn)==2) {
                document.querySelector(`#king .${turn}`).parentElement.parentElement.classList.add('stalemate');
                document.querySelector(`#king .${turn == 'white' ? 'black' : 'white'}`).parentElement.parentElement.classList.add('stalemate');
            }
            else if (check_for_checkmate(opp_turn)==1) {
                document.querySelector(`#king .${turn}`).parentElement.parentElement.classList.add('checkmate');
                document.querySelector(`#king .${turn == 'white' ? 'black' : 'white'}`).parentElement.parentElement.classList.add('checkmater');
            }
            return;
        }

        target_square.append(dragged_element); //kept leaving ghost pieces with no img child, this is the fix
        document.querySelectorAll('.piece:not(:has(img))').forEach(ghost => ghost.remove());
        is_in_check();
        if (is_illegal()) {
            start_square.append(dragged_element);
            return;
        }
        
        change_turn();
        if (check_for_checkmate(opp_turn)==2) {
                document.querySelector(`#king .${turn}`).parentElement.parentElement.classList.add('checkmate');
                document.querySelector(`#king .${turn == 'white' ? 'black' : 'white'}`).parentElement.parentElement.classList.add('checkmater');
            }
            else if (check_for_checkmate(opp_turn)==1) {
                document.querySelector(`#king .${turn}`).parentElement.parentElement.classList.add('stalemate');
                document.querySelector(`#king .${turn == 'white' ? 'black' : 'white'}`).parentElement.parentElement.classList.add('stalemate');
            }
        return;        
    }    
}



function attacked_squares(col){//cycles through all the piece attack functions to find the attacked squares
    //my friend @vincentchen18 said to instead check from a king's positions the rook, bishop and knight moves away, but this is more naive and simple.
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
}
function enemy_attacked_squares(col){// a function so weird i wrote it twice
    var attacked_squares = [];
    all_squares.forEach((square, i) => {   

        let correct_square = document.querySelector(`[${col}_square_id="${i}"]`);
        if (!correct_square) return;

        const piece = correct_square.querySelector('.piece');
        const img = piece?.querySelector('img');

        if (img && img.getAttribute('class') === col) {
            const piece_type = piece.getAttribute('id');
            
            if (piece_type == 'pawn') {
                get_virtual_pawn_attacks(i, attacked_squares, col);
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
}

function check_for_checkmate(defending_turn) {
    const opp_turn = turn === 'white' ? 'black' : 'white';
    let has_legal_move = false;
    enemy_attacked_squares(opp_turn);
    const their_king = document.querySelector(`#king .${turn}`)?.parentElement.parentElement.getAttribute(`${turn}_square_id`);
    
    const is_currently_in_check = their_king && new_enemy_attacked_squares.includes(Number(their_king));

    for (let i = 0; i < 64; i++) {
        let current_square = document.querySelector(`[${defending_turn}_square_id="${i}"]`);
        if (!current_square) continue;

        const piece = current_square.querySelector('.piece');
        const img = piece?.querySelector('img');

        if (img && img.getAttribute('class') === defending_turn) {
            const piece_type = piece.getAttribute('id');
            let moves = [];

            if (piece_type == 'pawn')   get_pawn_moves(i, moves, defending_turn);  
            if (piece_type == 'knight') get_knight_moves(i, moves, defending_turn);
            if (piece_type == 'bishop') get_bishop_moves(i, moves, defending_turn);
            if (piece_type == 'rook')   get_rook_moves(i, moves, defending_turn);
            if (piece_type == 'king')   get_king_moves(i, moves, defending_turn);
            if (piece_type == 'queen')  get_queen_moves(i, moves, defending_turn);

            for (const target_id of moves) {
                let target_square = document.querySelector(`[${defending_turn}_square_id="${target_id}"]`);
                if (!target_square) continue;

                const target_piece = target_square.querySelector('.piece');

                target_square.append(piece);
                if (target_piece) target_piece.remove();

                enemy_attacked_squares(opp_turn);
                const new_king_pos = document.querySelector(`#king .${defending_turn}`)?.parentElement.parentElement.getAttribute(`${opp_turn}_square_id`);
                const still_in_check = new_king_pos && new_enemy_attacked_squares.includes(Number(new_king_pos));

                current_square.append(piece);
                if (target_piece) {
                    target_square.append(target_piece);
                }
                if (!still_in_check) {
                    has_legal_move = true;
                    break; 
                }
            }
        }
        if (has_legal_move) break;
    }
    if (!is_currently_in_check && !has_legal_move) {
        console.log('stalemate');
        return 1;
    }
    if(is_currently_in_check && !has_legal_move){
    console.warn('checkmate');
    return 2;
    }
}


window.addEventListener("keydown",(e)=>{//this was annoying
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

function get_virtual_pawn_attacks(start, array, col = turn) { //its like get_pawn_attacks but it also looks at unoccupied squares (threats)
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

function get_pawn_attacks(start, array, col = turn) { //different from above, used for checking if a pawn can capture an enemy piece
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

function get_pawn_moves(start, array, col = turn) { //non threatning pawn moves, only forward movement
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
    
function get_knight_moves(start, array, col = turn) {//simple case
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
    
function get_king_moves(start, array, col = turn) {//REALLY SIMPLE
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
    
function get_bishop_moves(start, array, col = turn) {//the first one i implemented, see queen and rook
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

function get_rook_moves(start, array, col = turn) {//like bishop but less confusing
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
    
function get_queen_moves(start, array, col = turn) {//rook + bishop go brr
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

