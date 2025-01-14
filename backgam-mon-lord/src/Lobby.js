import React, { useState } from 'react';
import './Lobby.css';

const Lobby = () => {
  const [players, setPlayers] = useState(["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"]);

  return (
<div className="lobby-container">


      
  <div className="curved-text-container">
    <svg width="500" height="200" viewBox="0 0 500 200">
      <defs>
        <path id="curve" d="M 50 150 Q 250 50 450 150" />
      </defs>
      <text width="500">
        <textPath href="#curve" className="welcome">به بازی خوش اومدی مشتی</textPath>
      </text>
    </svg>
  </div>



      <h1>حریفت رو انتخاب کن</h1>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>



      <button className='builders'></button>
</div>
  );
};

export default Lobby;
