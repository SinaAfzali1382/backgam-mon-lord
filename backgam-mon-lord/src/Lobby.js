import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lobby.css";

const Lobby = () => {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState();
  const navigate = useNavigate();
  const getPlayers = async () => {
    fetch("http://localhost:5000/player/waiting/" + currentPlayer)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPlayers(data);
      });
  };

  const startGame = async (index) => {
    fetch(
      "http://localhost:5000/player/startGame/" +
        currentPlayer +
        "/" +
        players[index]
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        navigate("/board");
      });
  };

  const getCurrentPlayer = async () => {
    if (!currentPlayer) {
      fetch("http://localhost:5000/player/online")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (!sessionStorage.getItem("id")) {
            setCurrentPlayer(data);
            sessionStorage.setItem("id", data);
          } else setCurrentPlayer(sessionStorage.getItem("id"));
        });
    }
  };

  const isStartGame = async () => {
    fetch("http://localhost:5000/player/game/status/" + currentPlayer)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data) {
          navigate("/board");
        }
      });
  };

  useEffect(() => {
    setTimeout(async () => {
      if (!currentPlayer && sessionStorage.getItem("id"))
        setCurrentPlayer(sessionStorage.getItem("id"));
      getPlayers();
      isStartGame();
    }, 500);
  });

  return (
    <div className="lobby-container">
      <div className="curved-text-container">
        <svg width="500" height="200" viewBox="0 0 500 200">
          <defs>
            <path id="curve" d="M 50 150 Q 250 50 450 150" />
          </defs>
          <text width="500">
            <textPath href="#curve" className="welcome">
              به بازی خوش اومدی مشتی
            </textPath>
          </text>
        </svg>
      </div>
      <div style={{ fontSize: "24px", marginBottom : "10px" }}>
        Your ID :{currentPlayer}
      </div>
      <button onClick={getCurrentPlayer}>
        آنلاین شدن
      </button>

      <h1 className="text-light">حریفت رو انتخاب کن</h1>
      <ul>
        {players?.map(
          (player, index) =>
            player !== currentPlayer && (
              <button
                key={index}
                onClick={() => startGame(index)}
              >
                {player}
              </button>
            )
        )}
      </ul>

      <button className="builders"></button>
    </div>
  );
};

export default Lobby;
