import { updateLeaderboard } from '../project/functions/shared';


function makeBoard() {
  return {
    ids: ['a', 'b', 'c', 'd'],
    data: {
      a: { count: 10 },
      b: { count: 5 },
      c: { count: 4 },
      d: { count: 2 }
    }
  };
}

/** @typedef {ReturnType<typeof makeBoard>} Leaderboard */

/**
 *  @param {Leaderboard} board -
 */
function denormalize(board, mapFn=(x => x)) {
  return board.ids.map(uid => mapFn({ id: uid, ...board.data[uid]}));
}

describe('', () => {
  it('', () => {
    const Board = makeBoard();

    let lastLength = Board.ids.length;

    updateLeaderboard(Board, 'e', { count: 1 });
    expect(Board.ids).toHaveLength(++lastLength);
    expect(Board.ids.slice(-1)).toStrictEqual(['e']);
    expect(denormalize(Board, d => d.count)).toBeSortedDesc();
    expect(Board.ids).toContainBefore('d', 'e');
    // console.log(denormalize(Board));

    updateLeaderboard(Board, 'e', { count: 3 });
    expect(Board.ids).toHaveLength(lastLength);
    expect(denormalize(Board, d => d.count)).toBeSortedDesc();
    expect(Board.ids).toContainBefore('e', 'd');
    // console.log(denormalize(Board));

    updateLeaderboard(Board, 'z', { count: 100 }, 5);
    expect(Board.ids).toHaveLength(5);
    expect(new Set(Board.ids)).toStrictEqual(new Set(Object.keys(Board.data)));
    // console.log(denormalize(Board));
  });
});
