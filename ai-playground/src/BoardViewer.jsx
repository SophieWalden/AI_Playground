import React, { useState, useEffect, useRef } from 'react';
import './BoardViewer.css';

function BoardViewer({ data }) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const scrollRef = useRef(null);

  const isValid = Array.isArray(data) && data.length > 0;

  

  const handleChange = (e) => {
    setTurnIndex(parseInt(e.target.value));
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (data == null) return;
    setTurnIndex(0);
    setIsPlaying(true)
  }, [data])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTurnIndex((prev) => {
          if (prev < data.length - 1) {
            return prev + 1;
          } else {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return prev;
          }
        });
      }, 100); 
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, data.length]);

  if (!isValid) {
    return (
      <div className="viewer-container">
        <p>Run the simulator</p>
      </div>
    );
  }

  const current = data[turnIndex];
  const board = current?.board ?? [];
  const logs = current?.player_logs.split(",") ?? [];
  const scores = current?.scores  ?? [0, 0];
  const playerPositions = current?.player_positions ?? [];

  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }


  const isPlayerHere = (row, col) =>
    playerPositions.some(([r, c]) => r === row && c === col);

  const getPlayerIndex = (row, col) =>
    playerPositions.findIndex(([r, c]) => r === row && c === col);

  return (
    <div className="viewer-container">
      <div id="scorebox">
        <div id="player-score">myAi: {scores[1]}</div>
        <div id="enemy-score">Enemy: {scores[0]}</div>
      </div>
      <div className="board-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPlayer = isPlayerHere(rowIndex, colIndex);
            const playerIdx = getPlayerIndex(rowIndex, colIndex);
            const isWall = cell === '#';
            const isPellet = cell === 'o';

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell 
                  ${isWall ? 'wall' : 'open'} 
                  ${isPellet ? 'pellet' : ''} 
                  ${isPlayer ? `player${playerIdx}` : ''}`}
              >
                {isPlayer
                  ? `${["enemy", "myAi"][playerIdx]}`
                  : isPellet
                  ? '•'
                  : ''}
              </div>
            );
          })
        )}
      </div>
      <div className="slider-container">
        <button className="play-button" onClick={togglePlay}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <input
          type="range"
          min={0}
          max={data.length - 1}
          value={turnIndex}
          onChange={handleChange}
        />
        <span>{turnIndex + 1} / {data.length}</span>
      </div>

      <div ref={scrollRef} id="terminal">
        {logs.map((log, index) => {return (
            <div className="terminal-log" key={index}>
                {log}
            </div>
        )})}
      </div>
    </div>
  );
}

export default BoardViewer;
