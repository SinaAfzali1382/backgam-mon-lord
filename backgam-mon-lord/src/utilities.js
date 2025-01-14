import { diceRange, player, pieceNumber, houseNumber } from "./enums";

export class Player {
  constructor(name) {
    this.name = name;
    this.initialize();
  }

  initialize() {
    const whitePieces = Array(24).fill(pieceNumber.Zero);
    whitePieces[0] = pieceNumber.Two;
    whitePieces[11] = pieceNumber.Five;
    whitePieces[16] = pieceNumber.Three;
    whitePieces[18] = pieceNumber.Five;

    const blackPieces = Array(24).fill(pieceNumber.Zero);
    blackPieces[5] = pieceNumber.Five;
    blackPieces[7] = pieceNumber.Three;
    blackPieces[12] = pieceNumber.Five;
    blackPieces[23] = pieceNumber.Two;

    this.piecies = this.name === player.white ? whitePieces : blackPieces;
    this.initializeDice();
  }

  initializeDice() {
    this.dice = {
      value1: diceRange.Zero,
      value2: diceRange.Zero,
      value3: diceRange.Zero,
      value4: diceRange.Zero,
      isPair: false,
    };
  }

  rollTheDice() {
    this.initializeDice();
    this.dice.value1 = Math.floor(Math.random() * 6) + 1;
    this.dice.value2 = Math.floor(Math.random() * 6) + 1;
    if (this.dice.value1 === this.dice.value2) {
      this.dice.value3 = this.dice.value1;
      this.dice.value4 = this.dice.value1;
      this.dice.isPair = true;
    }
  }

  getName() {
    return this.name;
  }

  getDice() {
    return this.dice;
  }
  setPieces(pieces) {
    this.piecies = pieces;
  }
  getPices() {
    return this.piecies;
  }
  updateDice(numberMove) {
    const diceValues = [
      this.dice.value3,
      this.dice.value4,
      this.dice.value2,
      this.dice.value1,
    ];

    // تابعی برای پیدا کردن ترکیب مقادیر که با `numberMove` برابر است
    const findCombination = (arr, target, used = []) => {
      if (target === 0) {
        return used;
      }
      if (arr.length === 0 || target < 0) {
        return null;
      }

      // انتخاب عنصر اول
      const withFirst = findCombination(arr.slice(1), target - arr[0], [
        ...used,
        0,
      ]);
      if (withFirst) return withFirst;

      // رد کردن عنصر اول
      return findCombination(arr.slice(1), target, [...used, -1]);
    };

    // یافتن ترکیب مناسب
    const result = findCombination(diceValues, numberMove);

    if (result) {
      // به‌روزرسانی مقادیر تاس
      result.forEach((index, i) => {
        if (index === 0) diceValues[i] = 0;
      });
    }

    // بروزرسانی مقادیر `dice` در کلاس
    [this.dice.value3, this.dice.value4, this.dice.value1, this.dice.value2] =
      diceValues;
  }

  destinations(currentPiece) {
    const values = [
      this.dice.value1,
      this.dice.value2,
      this.dice.value3,
      this.dice.value4,
    ];

    const uniqueSums = new Set();

    for (let r = 1; r <= values.length; r++) {
      const combinations = (arr, r) => {
        if (r === 0) return [[]];
        if (arr.length === 0) return [];
        const [first, ...rest] = arr;
        const withFirst = combinations(rest, r - 1).map((combo) => [
          first,
          ...combo,
        ]);
        const withoutFirst = combinations(rest, r);
        return [...withFirst, ...withoutFirst];
      };

      combinations(values, r).forEach((combo) => {
        const comboSum = combo.reduce((sum, num) => sum + num, 0);
        uniqueSums.add(comboSum);
      });
    }

    const uniqueSumsList = Array.from(uniqueSums).sort((a, b) => a - b);
    let destination = [];
    if (this.name === player.white) {
      destination = uniqueSumsList
        .filter((item) => {
          return item !== 0 && currentPiece - item >= houseNumber.One;
        })
        .map((item) => currentPiece - item);
    } else {
      destination = uniqueSumsList
        .filter((item) => {
          return item !== 0 && item + currentPiece <= houseNumber.TwentyFour;
        })
        .map((item) => item + currentPiece);
    }
    return destination;
  }

  isFinish() {
    const md = this.dice;
    return (
      md.value1 === diceRange.Zero &&
      md.value2 === diceRange.Zero &&
      md.value3 === diceRange.Zero &&
      md.value4 === diceRange.Zero
    );
  }
}

export class Board {
  constructor(white, black) {
    this.houses = Array(24).fill(null);
    this.player1 = white;
    this.player2 = black;
    this.setPices();
    this.currentPlayer = Math.random() < 0.5 ? this.player1 : this.player2;
  }

  setPices() {
    this.houses = Array(24).fill(null);
    let mPieces = this.player1.getPices();
    for (let i = 0; i < mPieces.length; i++) {
      if (mPieces[i] > pieceNumber.Zero) {
        this.houses[i] = { player: player.white, numberPiece: mPieces[i] };
      }
    }
    mPieces = this.player2.getPices();
    for (let i = 0; i < mPieces.length; i++) {
      if (mPieces[i] > pieceNumber.Zero) {
        this.houses[i] = { player: player.black, numberPiece: mPieces[i] };
      }
    }
  }

  movePiece() {
    this.setPices();
  }

  getCurrPlayer() {
    return this.currentPlayer;
  }

  closedHouses(color) {
    return this.houses
      .map((item, index) => ({ item, index })) // ترکیب آیتم و اندیس
      .filter(
        ({ item }) =>
          item &&
          ((color === player.white && item.player === player.black) ||
            (color === player.black && item.player === player.white)) &&
          item.numberPiece > 1
      )
      .map(({ index }) => index); // فقط اندیس‌ها را برگردان
  }
  myHouses(color) {
    return this.houses
      .map((item, index) => ({ item, index })) // ترکیب آیتم و اندیس
      .filter(
        ({ item }) => item && item.player === color && item.numberPiece >= 1
      )
      .map(({ index }) => index);
  }

  changeCurrentPlayer() {
    if (
      this.currentPlayer.getName() === this.player1.getName() &&
      this.currentPlayer.isFinish()
    ) {
      this.currentPlayer = this.player2;
    } else if (
      this.currentPlayer.getName() === this.player2.getName() &&
      this.currentPlayer.isFinish()
    ) {
      this.currentPlayer = this.player1;
    }
  }
}
