const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetEl = document.getElementById("reset");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawEl = document.getElementById("score-draw");
const xLabelEl = document.getElementById("x-label");
const oLabelEl = document.getElementById("o-label");
const cells = [...document.querySelectorAll(".cell")];
const modeButtons = [...document.querySelectorAll(".mode-btn")];

const state = {
  board: Array(9).fill(""),
  turn: "X",
  mode: "cpu",
  locked: false,
  scores: { X: 0, O: 0, draw: 0 },
};

function winner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  if (board.every(Boolean)) return { player: "draw", line: [] };
  return null;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function render() {
  cells.forEach((cell, i) => {
    const mark = state.board[i];
    cell.textContent = mark;
    cell.classList.toggle("x", mark === "X");
    cell.classList.toggle("o", mark === "O");
    cell.disabled = Boolean(mark) || state.locked;
  });
}

function highlight(line) {
  line.forEach((i) => cells[i].classList.add("win"));
}

function clearHighlight() {
  cells.forEach((cell) => cell.classList.remove("win"));
}

function endGame(result) {
  state.locked = true;
  if (result.player === "draw") {
    state.scores.draw += 1;
    scoreDrawEl.textContent = String(state.scores.draw);
    setStatus("Draw");
    return;
  }
  highlight(result.line);
  state.scores[result.player] += 1;
  scoreXEl.textContent = String(state.scores.X);
  scoreOEl.textContent = String(state.scores.O);
  if (state.mode === "cpu") {
    setStatus(result.player === "X" ? "You win!" : "Computer wins");
  } else {
    setStatus(`${result.player} wins`);
  }
}

function emptyIndexes(board) {
  return board.map((v, i) => (v ? null : i)).filter((i) => i !== null);
}

function minimax(board, isMax) {
  const result = winner(board);
  if (result) {
    if (result.player === "O") return 10;
    if (result.player === "X") return -10;
    return 0;
  }

  const moves = emptyIndexes(board);
  if (isMax) {
    let best = -Infinity;
    for (const i of moves) {
      board[i] = "O";
      best = Math.max(best, minimax(board, false));
      board[i] = "";
    }
    return best;
  }

  let best = Infinity;
  for (const i of moves) {
    board[i] = "X";
    best = Math.min(best, minimax(board, true));
    board[i] = "";
  }
  return best;
}

function computerMove() {
  const board = [...state.board];
  let bestScore = -Infinity;
  let move = emptyIndexes(board)[0];
  for (const i of emptyIndexes(board)) {
    board[i] = "O";
    const score = minimax(board, false);
    board[i] = "";
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  play(move);
}

function play(index) {
  if (state.locked || state.board[index]) return;
  state.board[index] = state.turn;
  render();
  const result = winner(state.board);
  if (result) {
    endGame(result);
    return;
  }
  state.turn = state.turn === "X" ? "O" : "X";
  if (state.mode === "cpu") {
    if (state.turn === "O") {
      setStatus("Computer is thinking…");
      state.locked = true;
      render();
      window.setTimeout(() => {
        state.locked = false;
        computerMove();
      }, 280);
    } else {
      setStatus("Your turn — you are X");
    }
  } else {
    setStatus(`${state.turn}'s turn`);
  }
}

function newGame() {
  state.board = Array(9).fill("");
  state.turn = "X";
  state.locked = false;
  clearHighlight();
  render();
  setStatus(state.mode === "cpu" ? "Your turn — you are X" : "X's turn");
}

function setMode(mode) {
  state.mode = mode;
  modeButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.mode === mode);
  });
  if (mode === "cpu") {
    xLabelEl.textContent = "You (X)";
    oLabelEl.textContent = "Computer (O)";
  } else {
    xLabelEl.textContent = "Player X";
    oLabelEl.textContent = "Player O";
  }
  newGame();
}

boardEl.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell) return;
  play(Number(cell.dataset.index));
});

resetEl.addEventListener("click", newGame);

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

newGame();
