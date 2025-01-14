import { useEffect, useState } from "react";
import "./App.css";
import { player } from "./enums";
import messagIcon from "./message.jpg";
import player1Image from "./p1.png";
import player2Image from "./p2.png";
import { Board, Player } from "./utilities";
function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // send message in sidebar
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, message]);
      setMessage("");
    }
  };

  //////////////////////////////////////////////////////////////
  const getGame = async () => {
    fetch("http://localhost:5000/game/all/info/" + sessionStorage.getItem("id"))
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setBoard(data);
        setHouses(data.houses);
        setCurrPlayerImage(
          data?.currentPlayer.name === 1 ? player1Image : player2Image
        );
      });
  };
  const rollDice = async () => {
    fetch("http://localhost:5000/game/rollDice/" + sessionStorage.getItem("id"))
      .then((response) => {
        return response.json();
      })
      .then(async (data) => {
        setTimeout(() => {
          let myDice =
            data?.currentPlayer.id === sessionStorage.getItem("id")
              ? data?.currentPlayer.dice
              : { value1: 0, value2: 0, value3: 0, value4: 0, isPair: false };
          setDice(myDice);
          setBoard(data);
          setHouses(data.houses);
          setCurrPlayerImage(
            data?.currentPlayer.name === 1 ? player1Image : player2Image
          );
        }, 500);
      });
  };
  const getDistinations = async (numberHome) => {
    const response = await fetch(
      "http://localhost:5000/game/destinations/" +
        sessionStorage.getItem("id") +
        "/" +
        numberHome
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  };
  const [board, setBoard] = useState();
  if (!board) getGame();

  const [houses, setHouses] = useState(board?.houses);
  const [currPlayerImage, setCurrPlayerImage] = useState();
  const [dice, setDice] = useState({
    value1: 0,
    value2: 0,
    value3: 0,
    value4: 0,
    isPair: false,
  });

  const [moveClick, setMoveClick] = useState(false);
  const [lastClick, setLastClick] = useState(null);

  const setColorForHouses = (selectedHouses) => {
    for (let i = 0; i < 24; i++) document.getElementById("home" + i).style = "";
    for (let i = 0; i < selectedHouses.length; i++) {
      document.getElementById("home" + selectedHouses[i]).style =
        "background-color : aqua;";
    }
  };

  const handleClick = async (numberHome) => {
    fetch(
      "http://localhost:5000/game/validHome/" +
        sessionStorage.getItem("id") +
        "/" +
        numberHome
    )
      .then((response) => {
        return response.json();
      })
      .then(async (data) => {
        if (data && !moveClick) {
          setColorForHouses([]);
          let dest = await getDistinations(numberHome);
          if (dest.length > 0) {
            setLastClick(numberHome);
            setMoveClick(true);
            setColorForHouses(dest);
          }
        } else if (moveClick) {
          fetch(
            "http://localhost:5000/game/validHome/" +
              sessionStorage.getItem("id") +
              numberHome
          )
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              setColorForHouses([]);
              let dest = board.currentPlayer.destinations(lastClick);
              dest = dest.filter(
                (item) =>
                  !board.closedHouses(board.currentPlayer.name).includes(item)
              );
              dest = dest.filter((item) => {
                return item === numberHome;
              });
              if (board.currentPlayer.name === board.player1.name) {
                let pices = board.player1.getPices();
                pices[lastClick] = pices[lastClick] - 1;
                pices[dest[0]] = pices[dest[0]] + 1;
                board.player1.setPieces(pices);
                board.setPices();
                setHouses(board.houses);
                board.player1.updateDice(Math.abs(dest[0] - lastClick));
                setDice(board.player1.dice);
              } else {
                let pices = board.player2.getPices();
                pices[lastClick] = pices[lastClick] - 1;
                pices[dest[0]] = pices[dest[0]] + 1;
                board.player2.setPieces(pices);
                board.setPices();
                setHouses(board.houses);
                board.player2.updateDice(Math.abs(dest[0] - lastClick));
                setDice(board.player2.dice);
              }
              if (board.currentPlayer.isFinish()) {
                board.changeCurrentPlayer();
                setCurrPlayerImage(
                  board.currentPlayer.name === player.white
                    ? player1Image
                    : player2Image
                );
                setDice(board.currentPlayer.dice);
              }
              setMoveClick(false);
              setLastClick(null);
            });
        }
      });
    // if (
    //   moveClick &&
    //   board.currentPlayer
    //     .destinations(lastClick)
    //     .filter(
    //       (item) => !board.closedHouses(board.currentPlayer.name).includes(item)
    //     )
    //     .includes(numberHome)
    // ) {
    //   setColorForHouses([]);
    //   let dest = board.currentPlayer.destinations(lastClick);
    //   dest = dest.filter(
    //     (item) => !board.closedHouses(board.currentPlayer.name).includes(item)
    //   );
    //   dest = dest.filter((item) => {
    //     return item === numberHome;
    //   });
    //   if (board.currentPlayer.name === board.player1.name) {
    //     let pices = board.player1.getPices();
    //     pices[lastClick] = pices[lastClick] - 1;
    //     pices[dest[0]] = pices[dest[0]] + 1;
    //     board.player1.setPieces(pices);
    //     board.setPices();
    //     setHouses(board.houses);
    //     board.player1.updateDice(Math.abs(dest[0] - lastClick));
    //     setDice(board.player1.dice);
    //   } else {
    //     let pices = board.player2.getPices();
    //     pices[lastClick] = pices[lastClick] - 1;
    //     pices[dest[0]] = pices[dest[0]] + 1;
    //     board.player2.setPieces(pices);
    //     board.setPices();
    //     setHouses(board.houses);
    //     board.player2.updateDice(Math.abs(dest[0] - lastClick));
    //     setDice(board.player2.dice);
    //   }
    //   if (board.currentPlayer.isFinish()) {
    //     board.changeCurrentPlayer();
    //     setCurrPlayerImage(
    //       board.currentPlayer.name === player.white
    //         ? player1Image
    //         : player2Image
    //     );
    //     setDice(board.currentPlayer.dice);
    //   }
    //   setMoveClick(false);
    //   setLastClick(null);
    // }
  };

  useEffect(() => {
    setTimeout(() => {
      getGame().then(async () => {
        await rollDice();
      });
    }, 500);
  }, []);
  return (
    <div className="App">
      <div className="App-header">
        {/* message Button */}
        <button
          className={`top-right-button ${sidebarVisible ? "button-left" : ""}`}
          onClick={toggleSidebar}
        >
          <img src={messagIcon} alt="Button Icon" className="button-icon" />
        </button>

        <div
          className={`sidebar ${
            !sidebarVisible ? "sidebar-hidden" : "sidebar-visible"
          }`}
        >
          <div className="chat-history">
            {chatHistory.map((msg, index) => (
              <div key={index} className="chat-message">
                {msg}
              </div>
            ))}
          </div>

          <textarea
            className="message-input"
            value={message}
            onChange={handleMessageChange}
            placeholder="...پیام خود را وارد کنید"
          ></textarea>

          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>

        <button className="top-left-button">
          <img
            src={currPlayerImage}
            alt="Button Icon"
            className="button-icon"
          />
        </button>

        {/* ------------------------------------------------------------------------------------------------ */}

        {/* Board game */}
        <div className="backgammon-board">
          {/* side bars
          
           */}

          {/* Left Half */}
          <div className="left-edge"></div>
          <div className="half-board">
            {/* Top triangles */}
            <div className="row top">
              {houses?.slice(12, 18).map((item, index) => (
                <div
                  key={index}
                  className={`triangle triangle-up ${
                    board.currentPlayer.name === player.white
                      ? index % 2 === 0
                        ? "dark"
                        : "light"
                      : index % 2 === 1
                      ? "dark"
                      : "light"
                  }`}
                  onClick={() => {
                    handleClick(index + 12);
                  }}
                  id={`home${index + 12}`}
                >
                  <div className="piece-slot-container up">
                    {item?.numberPiece > 0 && // بررسی اینکه عدد صفر نباشد
                      Array(item.numberPiece)
                        .fill(0)
                        .map(
                          (_, slotIndex) =>
                            slotIndex < 5 && (
                              <div
                                key={slotIndex}
                                className={
                                  item?.player === player.white
                                    ? "piece-slot-p1"
                                    : "piece-slot-p2"
                                }
                              >
                                {slotIndex === 4 &&
                                  item.numberPiece > 5 &&
                                  item.numberPiece}
                              </div>
                            )
                        )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom triangles */}
            <div className="row bottom">
              {houses?.slice(6, 12).map((item, index) => (
                <div
                  key={index}
                  className={`triangle triangle-down ${
                    board?.currentPlayer.name === player.white
                      ? index % 2 === 0
                        ? "dark"
                        : "light"
                      : index % 2 === 1
                      ? "dark"
                      : "light"
                  }`}
                  onClick={() => {
                    handleClick(index + 6);
                  }}
                  id={`home${index + 6}`}
                >
                  <div className="piece-slot-container down">
                    {item?.numberPiece > 0 && // بررسی اینکه عدد صفر نباشد
                      Array(item.numberPiece)
                        .fill(0)
                        .map(
                          (_, slotIndex) =>
                            slotIndex < 5 && (
                              <div
                                key={slotIndex}
                                className={
                                  item?.player === player.white
                                    ? "piece-slot-p1"
                                    : "piece-slot-p2"
                                }
                              >
                                {slotIndex === 0 &&
                                  item.numberPiece > 5 &&
                                  item.numberPiece}
                              </div>
                            )
                        )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------------------------------------------------------ */}

          {/* Bar in the middle */}
          <div className="bar">
            <div class="dice">
              <div className="dice-value">
                {dice?.value1}/{dice?.value2}
              </div>
            </div>
            <div className="pair-dice">{dice?.isPair && "×2"}</div>
          </div>

          {/* ------------------------------------------------------------------------------------------------ */}

          {/* Right Half */}

          <div className="half-board">
            {/* Top triangles */}
            <div className="row top">
              {houses?.slice(18, 24).map((item, index) => (
                <div
                  key={index}
                  className={`triangle triangle-up ${
                    board.currentPlayer.name === player.white
                      ? index % 2 === 0
                        ? "dark"
                        : "light"
                      : index % 2 === 1
                      ? "dark"
                      : "light"
                  }`}
                  onClick={() => {
                    handleClick(index + 18);
                  }}
                  id={`home${index + 18}`}
                >
                  <div className="piece-slot-container up">
                    {item?.numberPiece > 0 && // بررسی اینکه عدد صفر نباشد
                      Array(item.numberPiece)
                        .fill(0)
                        .map(
                          (_, slotIndex) =>
                            slotIndex < 5 && (
                              <div
                                key={slotIndex}
                                className={
                                  item?.player === player.white
                                    ? "piece-slot-p1"
                                    : "piece-slot-p2"
                                }
                              >
                                {slotIndex === 4 &&
                                  item.numberPiece > 5 &&
                                  item.numberPiece}
                              </div>
                            )
                        )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom triangles */}
            <div className="row bottom">
              {houses?.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className={`triangle triangle-down ${
                    board.currentPlayer.name === player.white
                      ? index % 2 === 0
                        ? "dark"
                        : "light"
                      : index % 2 === 1
                      ? "dark"
                      : "light"
                  }`}
                  id={`home${index}`}
                  onClick={() => handleClick(index)}
                >
                  <div className="piece-slot-container down">
                    {item?.numberPiece > 0 && // بررسی اینکه عدد صفر نباشد
                      Array(item.numberPiece)
                        .fill(0)
                        .map(
                          (_, slotIndex) =>
                            slotIndex < 5 && (
                              <div
                                key={slotIndex}
                                className={
                                  item?.player === player.white
                                    ? "piece-slot-p1"
                                    : "piece-slot-p2"
                                }
                              >
                                {slotIndex === 0 &&
                                  item.numberPiece > 5 &&
                                  item.numberPiece}
                              </div>
                            )
                        )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="right-edge"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
