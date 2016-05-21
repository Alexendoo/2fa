const dict = { // https://tools.ietf.org/html/rfc4648#section-6
  'A': 0, 'K': 10, 'U': 20, '6': 30,
  'B': 1, 'L': 11, 'V': 21, '7': 31,
  'C': 2, 'M': 12, 'W': 22,
  'D': 3, 'N': 13, 'X': 23,
  'E': 4, 'O': 14, 'Y': 24,
  'F': 5, 'P': 15, 'Z': 25,
  'G': 6, 'Q': 16, '2': 26,
  'H': 7, 'R': 17, '3': 27,
  'I': 8, 'S': 18, '4': 28,
  'J': 9, 'T': 19, '5': 29, '=': 0
}

export function base32ToTypedArray (string) {
  if (!string || string.length % 8 !== 0) return null

  const buffer = new ArrayBuffer(string.length / 8 * 5)
  const view = new Uint8Array(buffer)

  const values = string.toUpperCase().match(/.{4}/g)
    .map(group => group.split('')
      .reduce((prev, curr) =>
        dict[curr] | (prev << 5), 0
    ))

  for (let i = 0; i < values.length; i += 2) {
    // 20 bits, 20 bits in each iter
    // 8 8 4 | 4 8 8
  }

  return buffer
}
