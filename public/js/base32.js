const dict = {
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

/**
 * Decodes an rfc4648 {@link https://tools.ietf.org/html/rfc4648#section-6}
 * base32 string into an ArrayBuffer
 *
 * @param  {String} string A base32 encoded string
 *
 * @return {ArrayBuffer} Decoded contents in an ArrayBuffer
 */
export function base32ToArrayBuffer (string) {
  if (!string || string.match(/^[a-z2-7=]$/i)) return null

  // Pad with = if string is unpadded
  if (string.length % 8 !== 0) {
    let chars = 8 - string.length % 8
    while (chars--) {
      string += '='
    }
  }

  // The number of bytes encoded by the string
  let size = string.length / 8 * 5
  if (string.indexOf('=') > -1) {
    size -= Math.ceil((8 - string.indexOf('=') % 8) * 5 / 8)
  }

  const buffer = new ArrayBuffer(size)
  const view = new Uint8Array(buffer)

  // Split into 20 bit values
  const values = string.toUpperCase().match(/.{4}/g)
    .map(group => group.split('')
      .reduce((prev, curr) =>
        dict[curr] | (prev << 5), 0
    ))

  // Insert the bytes into buffer
  for (let byte = 0; byte < size; byte++) {
    // 20bit alignment: 8 8 4|4 8 8
    // offset:          0 1  2  3 4

    const base = Math.floor(byte / 2.5)
    const offset = byte % 5

    if (offset === 2) {
      view[byte] = values[base] << 4 | values[base + 1] >> 16
    } else {
      view[byte] = values[base] >> [12, 4, 0, 8, 0][offset]
    }
  }

  return buffer
}
