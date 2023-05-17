export
interface AB {
  time: number;
  ask: number;
  ask_volume: number;
  bid: number;
  bid_volume: number;
}

export
function ArrayToAB(array: number[]) {
  return {
    time: array[0],
    ask: array[1], ask_volume: array[2],
    bid: array[3], bid_volume: array[4],
  } as AB;
}
