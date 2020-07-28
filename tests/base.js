const fs = require("fs");
const loader = require("@assemblyscript/loader");

const imports = { /* imports go here */ };
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/../build/base32.wasm"), imports);
const myModule = wasmModule.exports;

// //const ptr = myModule.__allocArray(myModule.Uint8Array_ID, [102, 111, 111, 98, 97]); // fooba
// const ptr = myModule.__allocArray(myModule.Uint8Array_ID, [102, 111, 111, 98, 97, 114]); // foobar
// let encodePtr = myModule.encode32(ptr);
// let encodeStr = myModule.__getString(encodePtr);
// console.log(encodeStr);



let ptr = myModule.__allocString('foobar'); // foobar
let encodePtr = myModule.encode32str(ptr);
let encodeStr = myModule.__getString(encodePtr);
console.log(encodeStr);


ptr = myModule.__allocString('Hello, world!'); // foobar
encodePtr = myModule.encode32str(ptr);
encodeStr = myModule.__getString(encodePtr);
console.log(encodeStr);


ptr = myModule.__allocArray(myModule.Uint8Array_ID, [1]);
encodePtr = myModule.encode32(ptr);
encodeStr = myModule.__getString(encodePtr);
console.log(encodeStr);

ptr = myModule.__allocArray(myModule.Uint8Array_ID, [1, 2, 3, 4, 5]);
encodePtr = myModule.encode32(ptr);
encodeStr = myModule.__getString(encodePtr);
console.log(encodeStr);

ptr = myModule.__allocArray(myModule.Uint8Array_ID,  [102, 111, 111, 98, 97, 114]); // foobar
encodePtr = myModule.encode32(ptr);
encodeStr = myModule.__getString(encodePtr);
console.log(encodeStr);

// --- decode ---

ptr = myModule.__allocString(encodeStr); 
let decodePtr = myModule.decode32(ptr);
let decordArr = myModule.__getUint8Array(decodePtr);
console.log(decordArr);

// ptr = myModule.__allocArray(myModule.Uint8Array_ID, [1]);
// encodePtr = myModule.encode32arr(ptr);
// let encordArr = myModule.__getUint8Array(encodePtr);
// console.log(encordArr);

// ptr = myModule.__allocArray(myModule.Uint8Array_ID, [1, 2, 3, 4, 5]);
// encodePtr = myModule.encode32arr(ptr);
// encordArr = myModule.__getUint8Array(encodePtr);
// console.log(encordArr);
