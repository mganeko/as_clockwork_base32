const fs = require("fs");
const loader = require("@assemblyscript/loader");

const imports = { /* imports go here */ };
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/../build/base32.wasm"), imports);
const myModule = wasmModule.exports;


// // --- simple test ----
// let ptr = myModule.__allocString('foobar'); // foobar
// let encodePtr = myModule.encode32str(ptr);
// let encodeStr = myModule.__getString(encodePtr);
// console.log(encodeStr);


// ptr = myModule.__allocString('Hello, world!'); // foobar
// encodePtr = myModule.encode32str(ptr);
// encodeStr = myModule.__getString(encodePtr);
// console.log(encodeStr);


// ptr = myModule.__allocArray(myModule.Uint8Array_ID, [1]);
// encodePtr = myModule.encode32(ptr);
// encodeStr = myModule.__getString(encodePtr);
// console.log(encodeStr);

// ptr = myModule.__allocArray(myModule.Uint8Array_ID, [1, 2, 3, 4, 5]);
// encodePtr = myModule.encode32(ptr);
// encodeStr = myModule.__getString(encodePtr);
// console.log(encodeStr);

// ptr = myModule.__allocArray(myModule.Uint8Array_ID, [102, 111, 111, 98, 97, 114]); // foobar
// encodePtr = myModule.encode32(ptr);
// encodeStr = myModule.__getString(encodePtr);
// console.log(encodeStr);

// // --- decode ---

// ptr = myModule.__allocString(encodeStr);
// let decodePtr = myModule.decode32(ptr);
// let decordArr = myModule.__getUint8Array(decodePtr);
// console.log(decordArr);

// ptr = myModule.__allocString(encodeStr);
// decodePtr = myModule.decode32str(ptr);
// let decordedStr = myModule.__getString(decodePtr);
// console.log(decordedStr);

// =========== test ======

let erros = 0;
let cases = 0;
console.log('----test encode-----');
erros += testEncodeStr('', ''); cases++;
erros += testEncodeStr('fooba', 'CSQPYRK1'); cases++;
erros += testEncodeStr('foobar', 'CSQPYRK1E8'); cases++;
erros += testEncodeStr('Hello, world!', '91JPRV3F5GG7EVVJDHJ22'); cases++;
erros += testEncodeStr('The quick brown fox jumps over the lazy dog.', 'AHM6A83HENMP6TS0C9S6YXVE41K6YY10D9TPTW3K41QQCSBJ41T6GS90DHGQMY90CHQPEBG'); cases++;
erros += testEncodeStr('Wow, it really works!', 'AXQQEB10D5T20WK5C5P6RY90EXQQ4TVK44'); cases++;


console.log('----test decode-----');
erros += testDecodeStr('', ''); cases++;
erros += testDecodeStr('fooba', 'CSQPYRK1'); cases++;
erros += testDecodeStr('foobar', 'CSQPYRK1E8'); cases++;
erros += testDecodeStr('Hello, world!', '91JPRV3F5GG7EVVJDHJ22'); cases++;
erros += testDecodeStr('The quick brown fox jumps over the lazy dog.', 'AHM6A83HENMP6TS0C9S6YXVE41K6YY10D9TPTW3K41QQCSBJ41T6GS90DHGQMY90CHQPEBG'); cases++;
erros += testDecodeStr('Wow, it really works!', 'AXQQEB10D5T20WK5C5P6RY90EXQQ4TVK44'); cases++;


console.log('----test string-----');
erros += testEncodeDecode(''); cases++;
erros += testEncodeDecode('A'); cases++;
erros += testEncodeDecode('AB'); cases++;
erros += testEncodeDecode('abc'); cases++;
erros += testEncodeDecode('AbCd'); cases++;
erros += testEncodeDecode('fooba'); cases++;
erros += testEncodeDecode('foobar'); cases++;
erros += testEncodeDecode('Hello, mjs world!'); cases++;
erros += testEncodeDecode('this is clockwork base32'); cases++;


console.log('----test array-----');
erros += testEncodeDecodeArray(new Uint8Array([])); cases++;
erros += testEncodeDecodeArray(new Uint8Array([1])); cases++;
erros += testEncodeDecodeArray(new Uint8Array([1, 2])); cases++;
erros += testEncodeDecodeArray(new Uint8Array([1, 2, 3])); cases++;
erros += testEncodeDecodeArray(new Uint8Array([1, 2, 3, 4])); cases++;
erros += testEncodeDecodeArray(new Uint8Array([1, 2, 3, 4, 5])); cases++;
erros += testEncodeDecodeArray(new Uint8Array([1, 2, 3, 4, 5, 6])); cases++;

// --- report ---
console.log('=== total report =====');
console.log(' case count=', cases);
console.log(' ERROR count=', erros);



// --- benchmark ---
// console.time('bench');

// const arr = new Uint8Array([0, 0]);
// //const arr = new Uint8Array([0, 0, 0, 0, 0]);
// for (let ii = 0; ii <= 255; ii++) {
//   for (let i = 0; i <= 255; i++) {
//     arr[0] = i;
//     for (let j = 0; j <= 255; j++) {
//       arr[1] = j;
//       const ptr = myModule.__allocArray(myModule.Uint8Array_ID, arr);
//       const encodePtr = myModule.encode32(ptr);
//       const encodedStr = myModule.__getString(encodePtr);
    
//       const ptr2 = myModule.__allocString(encodedStr);
//       const decodePtr = myModule.decode32(ptr2);
//       const decodedArr = myModule.__getUint8Array(decodePtr);
//     }
//   }
// }
// console.timeEnd('bench');

// ---- exit ---
if (erros > 0) {
  process.exit(1);
}
else {
  process.exit(0);
}

// ------------- test utility function ----------
function testEncodeStr(rowStr, encodedStr) {
  const ptr = myModule.__allocString(rowStr);
  const encodePtr = myModule.encode32str(ptr);
  const encodeTry = myModule.__getString(encodePtr);

  const test = (encodeTry === encodedStr);
  console.assert(test, 'encode32str Error: "%s" --> "%s"(len=%d) !== "%s"(len=%d)', rowStr, encodeTry, encodeTry.length, encodedStr, encodedStr.length);

  if (test) {
    console.log('-PASS- ("%s", "%s")', rowStr, encodedStr);
    return 0; // OK
  }
  else {
    return 1; // ERROR
  }
}

function testDecodeStr(rowStr, encodedStr) {
  const ptr = myModule.__allocString(encodedStr);
  const decodePtr = myModule.decode32str(ptr);
  const decodeTry = myModule.__getString(decodePtr);

  const test = (decodeTry === rowStr);
  console.assert(test, 'decode32str Error: "%s" --> "%s"(len=%d) !== "%s"(len=%d)', encodedStr, decodeTry, decodeTry.length, rowStr, rowStr.length);

  if (test) {
    console.log('-PASS- ("%s", "%s")', rowStr, encodedStr);
    return 0; // OK
  }
  else {
    return 1; // ERROR
  }
}


function testEncodeDecode(str) {
  const ptr = myModule.__allocString(str);
  const encodePtr = myModule.encode32str(ptr);
  const encodedStr = myModule.__getString(encodePtr);

  const ptr2 = myModule.__allocString(encodedStr);
  const decodePtr = myModule.decode32str(ptr2);
  const decodedStr = myModule.__getString(decodePtr);

  const test = (str === decodedStr);
  console.assert(test, 'Encode-Decode Error: (%d) "%s"(len=%d) --> "%s"(len=%d)', (str === decodedStr), str, str.length, decodedStr, decodedStr.length);

  if (test) {
    console.log('-PASS- ("%s")', str);
    return 0; // OK
  }
  else {
    return 1; // ERROR
  }
}

function testEncodeDecodeArray(arr) {
  const ptr = myModule.__allocArray(myModule.Uint8Array_ID, arr);
  const encodePtr = myModule.encode32(ptr);
  const encodedStr = myModule.__getString(encodePtr);

  const ptr2 = myModule.__allocString(encodedStr);
  const decodePtr = myModule.decode32(ptr2);
  const decodedArr = myModule.__getUint8Array(decodePtr);

  const test = compareAarrayWithType(arr, decodedArr, Uint8Array);
  console.assert(test, 'Encode-Decode Error:', arr, '-->', decodedArr);

  if (test) {
    console.log('-PASS-', arr);
    return 0; // OK
  }
  else {
    return 1; // ERROR
  }
}

//----- inner func ---
function compareAarray(arr1, arr2) {
  //console.log('---compareArray----');
  //console.log(arr1);
  //console.log(arr2);
  if (arr1.length !== arr2.length) {
    console.error('compeareAarray length not same %d !== %d', arr1.length, arr2.length);
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      console.error('compeareAarray arr1[%d]=%d arr2[%d]=%d, NOT SAME', i, arr1[i], i, arr2[i]);
      return false;
    }
  }

  return true;
}

function compareAarrayWithType(arr1, arr2, t) {
  if (!(arr1 instanceof t)) {
    console.error('compareAarrayWithType arr1 is not type:', t, 'arr1:', arr1);
    return false;
  }
  if (!(arr2 instanceof t)) {
    console.error('compareAarrayWithType arr2 is not type:', t, 'arr2:', arr2);
    return false;
  }

  return compareAarray(arr1, arr2);
}
