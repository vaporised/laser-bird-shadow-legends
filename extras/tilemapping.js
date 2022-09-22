/**
 * An object containing the indexes of every type of tile to make tilemapping easier.
 * 
 * Also contains weightings of certain tiles for using weightedRandomize().
 */
const tiles = {
  blank: 4,
  rock: 12,
  wall: {
    top_left: 36,
    top_right: 39,
    bottom_right: 77,
    bottom_left: 76,

    topBottom: [ {
      index: 41,
      weight: 2
    }, {
      index: [ 49, 50, 57, 58, 65, 66, 73, 74 ],
      weight: 1
    } ],
    left: [ {
      index: [ 44, 52 ],
      weight: 5
    } ],
    right: [ {
      index: [ 47, 55 ],
      weight: 5
    } ]
  },

  wallTop: {
    type1: 33,
    type2: 34
  },

  floor: [ {
    index: 0,
    weight: 2
  }, {
    index: [ 1, 2, 8, 9, 10, 16, 17, 18 ],
    weight: 1
  } ],

  door: {
    top_left: 89,
    top_right: 90,
    bottom_left: 105,
    bottom_right: 106,
    wallTop_top_left: 81,
    wallTop_top_right: 82,
    wallTop_bottom_left: 97,
    wallTop_bottom_right: 98
  }
};