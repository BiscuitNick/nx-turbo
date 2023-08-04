'use client';
import { useEffect, useState } from 'react';
import { shuffledDeck, shuffle } from '../../../lib/deck';
import { getHandTitle, getHandValue } from '../math';
import { payouts96, valueCounts, valueCounter } from '../constants';
import { sleep } from '../../blackjack/helpers';
import { handValues, handValueTitles } from '../constants';

interface useVideoPokerProps {
  initBet?: number;
  initCredits?: number;
  initStatus?: string;
  initCards?: number[];
  initHolds?: boolean[];
  initShowOdds?: boolean;
}

export const useVideoPoker = (props: useVideoPokerProps) => {
  const {
    initBet = 5,
    initCredits = 1000,
    initStatus = 'pendingNewGame',
    initCards = [-1, -1, -1, -1, -1],
    initHolds = [false, false, false, false, false],
    initShowOdds = true,
  } = props;
  const [deck, setDeck] = useState<number[]>(shuffledDeck(1));
  const [status, setStatus] = useState<string>(initStatus);
  const [showOdds, setShowOdds] = useState<boolean>(initShowOdds);
  const [bet, setBet] = useState<number>(initBet);
  const [credits, setCredits] = useState<number>(initCredits);
  const [cards, setCards] = useState<number[]>(initCards);
  const [holds, setHolds] = useState<boolean[]>(initHolds);
  const [winningHand, setWinningHand] = useState<string>('High Card');
  const [calculatingOdds, setCalculating] = useState<boolean>(false);
  const [percents] = useState<valueCounts>(valueCounter); //setPercents
  const [counts] = useState<valueCounts>(valueCounter); //setCounts
  const [winnings, setWinnings] = useState<number>(0);

  const [handTitles, setHandTitles] = useState<string[]>(
    handValues.map((val: string) => handValueTitles[val])
  );
  // TODO allow other payouts
  const payouts = payouts96;

  const updateHolds = (index: number) => {
    if (status !== 'pendingDraw') return;
    const newHolds = [...holds];
    newHolds[index] = !newHolds[index];
    setHolds(newHolds);
  };

  const minusBet = () => {
    const newBet = bet - 1 >= 1 ? bet - 1 : 1;
    const diff = bet - newBet;
    const newCredits = credits + diff;

    setBet(newBet);
    setCredits(newCredits);
  };

  const betOne = () => {
    const newBet = bet + 1 > 5 ? 1 : bet + 1;
    const diff = bet - newBet;
    const newCredits = credits + diff;

    setBet(newBet);
    setCredits(newCredits);
  };

  const betMax = () => {
    setBet(5);
  };

  const dealOrDraw = () => {
    if (status === 'pendingNewGame') {
      console.log('');
      setStatus('dealingCards');
      const newCredits = credits - bet;
      setCredits(newCredits);
    } else if (status === 'pendingDraw') {
      setStatus('dealingDraw');
    }
  };

  useEffect(() => {
    async function dealNewGame() {
      const newDeck = shuffle(deck);
      setCards(newDeck.slice(0, 5));
      setHolds([false, false, false, false, false]);
      setDeck(newDeck);

      await sleep(1000);
      setStatus('pendingDraw');
    }
    async function dealDraw() {
      const hand = [...cards];
      let drawIndex = 5;

      holds.forEach((h, i) => {
        if (!h) {
          hand[i] = deck[drawIndex];
          drawIndex++;
        }
      });

      await sleep(500);
      setCards(hand);
      await sleep(500);
      setStatus('pendingPayouts');
    }

    async function payoutWinnings() {
      const newCredits = credits + winnings;
      setCredits(newCredits);
      await sleep(200);
      setStatus('pendingNewGame');
    }

    if (status === 'dealingCards') {
      dealNewGame();
    } else if (status === 'dealingDraw') {
      dealDraw();
    } else if (status === 'pendingPayouts') {
      payoutWinnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const handTitle = getHandTitle(cards);
    const hValue = getHandValue(cards);

    const winnings = payouts[hValue][bet - 1];

    setWinningHand(handTitle);
    setWinnings(winnings);
  }, [cards]);

  // useEffect(() => {
  //   console.log(status, credits);
  //   if (status === 'pendingPayouts') {
  //     const newCredits = credits + winnings;
  //     setCredits(newCredits);
  //     setStatus('pendingNewGame');
  //   }
  // }, [status]);

  // useEffect(() => {
  //   async function calculateOdds() {
  //     setCalculating(true);
  //     const holdCards: number[] = [];
  //     const muckCards: number[] = [];
  //     holds.forEach((h, i) => {
  //       if (h) {
  //         holdCards.push(cards[i]);
  //       } else {
  //         muckCards.push(cards[i]);
  //       }
  //     });

  //     const holdStr = holdCards.sort((a, b) => (a > b ? 1 : -1)).join(',');
  //     const muckStr = muckCards.sort((a, b) => (a > b ? 1 : -1)).join(',');
  //     const key = `${holdStr}-${muckStr}`;

  //     console.log(key);

  //     const endpoint = '/api/poker';
  //     const options = {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ holdCards, muckCards }),
  //     };
  //     const response = await fetch(endpoint, options);
  //     const { counts: c, percents: p } = await response.json();

  //     setCounts(c);
  //     setPercents(p);
  //     setCalculating(false);
  //   }

  //   if (showOdds) {
  //     calculateOdds();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [holds]);

  return {
    deck,
    setDeck,
    status,
    setStatus,
    showOdds,
    setShowOdds,
    credits,
    setCredits,
    bet,
    setBet,
    cards,
    setCards,
    holds,
    setHolds,
    winningHand,
    setWinningHand,
    payouts,
    updateHolds,
    minusBet,
    betOne,
    betMax,
    dealOrDraw,
    percents,
    counts,
    calculatingOdds,
    setCalculating,
    handValues,
    handTitles,
    winnings,
  };
};
