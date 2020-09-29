import React, { useState, useEffect, useRef } from "react";
import "./Game.css";

let CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;
let timer;
let rows = HEIGHT / CELL_SIZE;
let cols = WIDTH / CELL_SIZE;

function Cell(props) {
  const { x, y, alive } = props;
  return (
    <div
      className="Cell"
      style={{
        left: `${CELL_SIZE * x + 1}px`,
        top: `${CELL_SIZE * y + 1}px`,
        width: `${CELL_SIZE - 1}px`,
        height: `${CELL_SIZE - 1}px`
      }}
    />
  );
}
const Game = () => {
  const [cells, setCells] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [boardRef, setBoardRef] = useState(null);
  const [board, setBoard] = useState(makeEmptyBoard());
  const [gametime, setGametime] = useState(null);
  const [generation, setGeneration] = useState(0);

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay[0] !== null) {
        let id = setInterval(tick, delay[0]);
        return () => clearInterval(id);
      }
    }, delay);
  }

  useInterval(() => {
    if (isRunning) {
      runIteration();
    }
  }, [gametime, isRunning]);

  console.log("loop");

  function handleCellSize(event) {
    if (event.target.value < 5) {
      console.log("value too small");
    } else {
      CELL_SIZE = event.target.value;
      rows = HEIGHT / CELL_SIZE;
      cols = WIDTH / CELL_SIZE;
      setGeneration(0);
      setBoard(makeEmptyBoard()); //1 rerender
      setCells(makeCells(makeEmptyBoard())); //2nd render
    }
  }

  function makeEmptyBoard() {
    let newBoard = [];
    for (let y = 0; y < rows; y++) {
      newBoard[y] = [];
      for (let x = 0; x < cols; x++) {
        newBoard[y][x] = false;
      }
    }

    return newBoard;
  }

  function getElementOffset() {
    const rect = boardRef.getBoundingClientRect();
    const doc = document.documentElement;

    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop
    };
  }

  function makeCells(newBoard) {
    // console.log(board)
    let cells2 = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (newBoard[y][x]) {
          cells2.push({ x: x, y: y, alive: true });
        }
      }
    }
    console.log(cells2);
    return cells2;
  }

  function handleClick(event) {
    if (!isRunning) {
      let newBoard = JSON.parse(JSON.stringify(board));
      const elemOffset = getElementOffset();
      const offsetX = event.clientX - elemOffset.x;
      const offsetY = event.clientY - elemOffset.y;

      const x = Math.floor(offsetX / CELL_SIZE);
      const y = Math.floor(offsetY / CELL_SIZE);

      if (x >= 0 && x <= cols && y >= 0 && y <= rows) {
        newBoard[y][x] = !newBoard[y][x];
      }
      setBoard(newBoard);
      setCells(makeCells(newBoard));
    }
  }

  function runGame() {
    setGametime(gametime ? gametime : 100);
    setIsRunning(true);
    runIteration();
    console.log(timer);
  }

  function stopGame() {
    setIsRunning(false);
    console.log(timer);
    clearInterval(timer);
  }

  function checkIfAlive(neighbors, x, y) {
    let alive = false;
    if (board[y][x]) {
      if (neighbors === 2 || neighbors === 3) {
        alive = true;
      } else {
        alive = false;
      }
    } else {
      if (!board[y][x] && neighbors === 3) {
        alive = true;
      }
    }
    return alive;
  }

  function runIteration() {
    let newBoard = makeEmptyBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let neighbors = calculateNeighbors(board, x, y);
        newBoard[y][x] = checkIfAlive(neighbors, x, y);
      }
    }
    console.log("iterate", board, newBoard);
    setBoard(newBoard);
    setGeneration(generation + 1);
    setCells(makeCells(newBoard));
    if (cells.length == 0) {
      clearInterval();
      setGeneration(0);
      setIsRunning(false);
    }
  }

  function calculateNeighbors(board, x, y) {
    let neighbors = 0;
    const dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1]
    ];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];

      if (x1 >= 0 && x1 < cols && y1 >= 0 && y1 < rows && board[y1][x1]) {
        neighbors++;
      }
    }

    return neighbors;
  }

  function handleIntervalChange(event) {
    setGametime(event.target.value);
  }

  function handleClear() {
    // let board = makeEmptyBoard();
    setGeneration(0);
    setBoard(makeEmptyBoard()); //1 rerender
    setCells(makeCells(makeEmptyBoard())); //2nd render
  }

  function handleRandom() {
    // console.log(board)
    let newBoard = makeEmptyBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newBoard[y][x] = Math.random() >= 0.5;
      }
    }
    setGeneration(0);
    setBoard(newBoard);
    setCells(makeCells(newBoard));
    // console.log(board)
  }

  return (
    <div>
      <div
        className="Board"
        style={{
          width: WIDTH,
          height: HEIGHT,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
        }}
        onClick={handleClick}
        ref={n => {
          setBoardRef(n);
        }}
      >
        {cells.map(cell => (
          <Cell
            x={cell.x}
            y={cell.y}
            alive={cell.alive}
            key={`${cell.x},${cell.y}`}
          />
        ))}
      </div>

      <div className="controls">
        Update every{" "}
        <input
          value={gametime ? gametime : 100}
          onChange={handleIntervalChange}
        />{" "}
        msec Cell size:{" "}
        <input placeholder={CELL_SIZE} onChange={handleCellSize} />
        {isRunning ? (
          <button className="button" onClick={stopGame}>
            Stop
          </button>
        ) : (
          <button className="button" onClick={runGame}>
            Run
          </button>
        )}
        <button className="button" onClick={handleRandom}>
          Random
        </button>
        <button className="button" onClick={handleClear}>
          Clear
        </button>
        <p>Generation Number {generation}</p>
      </div>
    </div>
  );
};

export default Game;
