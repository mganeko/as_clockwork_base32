// WASM implementation for Clockwork Base32
//
// -- refer ---
// https://gist.github.com/szktty/228f85794e4187882a77734c89c384a8
// https://medium.com/shiguredo/base32-の変種を作った話-d8da2e3102ec
// https://github.com/szktty/go-clockwork-base32
// ----------

// npx asc --outFile base32.wasm --textFile bas32.wat --runtime none --config asconfig0.json  assembly/base32.ts

export const Uint8Array_ID = idof<Uint8Array>();

/**
 * stringを受け取り、clockwork base32 エンコーディングした文字列を返します
 * @param {string} str - 入力バイト列
 * @return {string} - エンコード結果
 */
export function encode32str(str: string): string {
  const len = str.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = str.charCodeAt(i) as u8;
  }

  return encode32(arr);
}


/**
 * バイト列(Uint8Array)を受け取り、clockwork base32 エンコーディングした文字列を返します
 * @param {Uint8Array} arr - 入力バイト列
 * @return {string} - エンコード結果
 */
export function encode32(arr: Uint8Array): string {
  const newArr = _splitBytesBy5bits(arr);
  let str: string = '';
  for (let i = 0; i < newArr.length; i++) {
    const b = newArr[i];
    str += _encodeByte(b);
  }

  return str;
}

export function encode32arr(arr: Uint8Array) : Uint8Array {
  const newArr = _splitBytesBy5bits(arr);
  return newArr;
}

/**
 * stringを受け取り、clockwork base32 デコードしたバイト列(Uint8Array)を返します
 * @param {string}} str - 入力文字列
 * @return {Uint8Array} - デコード結果
 */
export function decode32(str: string) : Uint8Array {
  const arr = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i++) {
    const s = str.charAt(i);
    const n = _decodeByte(s);
    arr[i] = n;
  }

  const byteArray = _pack5bitsArrayAsBytes(arr);
  return byteArray;
}

// split 8bit array --> 5bit array
//  5(bytes) --> 8(bytes)
//  4 --> 7
//  3 --> 5
//  2 --> 4
//  1 --> 2
//  0 --> 0
function _splitBytesBy5bits(srcArr: Uint8Array): Uint8Array {
  //return srcArr; // OK

  const srcLen = srcArr.length;
  if (srcLen < 1) {
    //throw ' _split8BitsBytesBy5bits NO src byte';
    return new Uint8Array(0);
  }
  let destBitLength = 0;
  let destArr = new Uint8Array(srcLen * 2);
  let destByte: u8 = 0;
  let destIndex = 0;

  for (let srcIdx = 0; srcIdx < srcLen; srcIdx++) {
    const srcByte = srcArr[srcIdx];

    for (let srcBitPos = 7; srcBitPos >= 0; srcBitPos--) { // srcBitPos : 76543210
      const bit1: u8 = (srcByte >> (srcBitPos as u8)) & 0b00000001;
      destByte = destByte << 1;
      destByte = (destByte | bit1);

      destBitLength++;
      if (destBitLength >= 5) {
        // next dest byte
        destArr[destIndex] = destByte;
        destBitLength = 0;
        destByte = 0;
        destIndex++
      }
    }
  }
  if (destBitLength > 0) {
    destByte = destByte << ((5 - destBitLength) as u8);
    destArr[destIndex] = destByte;
    destIndex++
  }


  //return destArr.subarray(0, destIndex);
  //return destArr;

  const sub = new Uint8Array(destIndex);
  for (let i = 0; i < destIndex; i++) {
    sub[i] = destArr[i];
  }
  return sub;

}


// pack  8bit array  <-- 5bit array
//  5(bytes) <-- 8(bytes)
//  4 <-- 7
//  3 <-- 5
//  2 <-- 4
//  1 <-- 2
//  0 <-- 0
function _pack5bitsArrayAsBytes(srcArr: Uint8Array): Uint8Array {
  const srcLen = srcArr.length;
  //console.log('_pack5bitsArrayAsBytes srcLen=', srcLen);
  if (srcLen < 1) {
    //throw ' _pack5bitsArrayAsBytes NO src byte';
    return new Uint8Array(0);
  }
  let destBitLength = 0;
  let destArr = new Uint8Array(srcLen);
  let destByte = 0;
  let destIndex = 0;

  for (let srcIdx = 0; srcIdx < srcLen; srcIdx++) {
    const srcByte = srcArr[srcIdx];
    for (let srcBitPos = 4; srcBitPos >= 0; srcBitPos--) { // srcBitPos : xxx43210
      const bit1 : u8 = (srcByte >> (srcBitPos as u8)) & 0b00000001;
      destByte = destByte << 1;
      destByte = (destByte | bit1);
      destBitLength++;
      if (destBitLength >= 8) {
        // next dest byte
        destArr[destIndex] = destByte;
        destBitLength = 0;
        destByte = 0;
        destIndex++;
        //console.log('==_pack5bitsArrayAsBytes newDest byte');
      }
    }
  }

  // --- rest is padding, so leave them (not neet to append)
  // if (destBitLength > 0) {
  //   console.log('==_pack5bitsArrayAsBytes rest bitts=', destBitLength);
  //   destByte = destByte << (8 - destBitLength);
  //   destArr.push(destByte);
  // }

  //return new Uint8Array(destArr);
  //return destArr.subarray(0, destIndex - 1);

  
  const sub = new Uint8Array(destIndex);
  for (let i = 0; i < destIndex; i++) {
    sub[i] = destArr[i];
  }
  return sub;
}

// const _encodeTable: Uint8Array = new Uint8Array(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
//   'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M',
//   'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
// ]);

const _encodeTable: Uint8Array = new Uint8Array(32);
let _initTableFlag: boolean = false;
function _initTable(): void {
  const stringTable = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  for (let i = 0; i < 32; i++) {
    _encodeTable[i] = stringTable.charCodeAt(i) as u8;
  }
  _initTableFlag = true;
}


function _encodeByte(b: u8): string {
  if (_encodeTable.length !== 32) {
    //console.error('TABLE error');
    throw 'TABLE error';
  }
  if ((b < 0) || (b >= 32)) {
    //console.error('Byte value range ERROR', b);
    throw 'Byte value range ERROR';
  }

  if (!_initTableFlag) {
    _initTable();
  }

  return String.fromCharCode(_encodeTable[b]);
}

// const _decodeHash = {
//   '0': 0, 'O': 0,
//   '1': 1, 'L': 1, 'I': 1,
//   '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
//   'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15,
//   'G': 16, 'H': 17, 'J': 18, 'K': 19, 'M': 20, 'N': 21, 'P': 22, 'Q': 23,
//   'R': 24, 'S': 25, 'T': 26, 'V': 27, 'W': 28, 'X': 29, 'Y': 30, 'Z': 31,
// };

const _decodeMap = new Map<string, u8>();
let _initMapFlag: boolean = false;
function _initMap(): void {
  _decodeMap.set('0', 0); _decodeMap.set('O', 0);

  _decodeMap.set('1', 1); _decodeMap.set('L', 1); _decodeMap.set('I', 1);

  _decodeMap.set('2', 2);
  _decodeMap.set('3', 3);
  _decodeMap.set('4', 4);
  _decodeMap.set('5', 5);
  _decodeMap.set('6', 6);
  _decodeMap.set('7', 7);
  _decodeMap.set('8', 8);
  _decodeMap.set('9', 9);

  _decodeMap.set('A', 10);
  _decodeMap.set('B', 11);
  _decodeMap.set('C', 12);
  _decodeMap.set('D', 13);
  _decodeMap.set('E', 14);
  _decodeMap.set('F', 15);
  _decodeMap.set('G', 16);
  _decodeMap.set('H', 17);

  _decodeMap.set('J', 18);
  _decodeMap.set('K', 19);

  _decodeMap.set('M', 20);
  _decodeMap.set('N', 21);

  _decodeMap.set('P', 22);
  _decodeMap.set('Q', 23);
  _decodeMap.set('R', 24);
  _decodeMap.set('S', 25);
  _decodeMap.set('T', 26);

  _decodeMap.set('V', 27);
  _decodeMap.set('W', 28);
  _decodeMap.set('X', 29);
  _decodeMap.set('Y', 30);
  _decodeMap.set('Z', 31);

  _initMapFlag = true;
}


function _decodeByte(s: string) : u8{
  if (! _initMapFlag) {
    _initMap();
  }

  const sUpper = s.toUpperCase();
  const n : u8 = _decodeMap.get(sUpper) as u8;
  // if ((n === null) || n === undefined) {
  //   //console.error('Byte string decode ERROR', s, n);
  //   throw 'Byte string decode ERROR';
  // }
  return n;
}

