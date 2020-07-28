# as_clockwork_base32

AssemblyScript implementation of Clockwork Base32

- spec: https://gist.github.com/szktty/228f85794e4187882a77734c89c384a8
- go implementation:  https://github.com/szktty/go-clockwork-base32
- js implementation: 

# How to use

## setup

with node v12 or upper.

```
$ git clone https://github.com/mganeko/as_clockwork_base32.git
$ cd as_clockwork_base32
$ npm install
```

## build

```
$ npm run asbuild
```

## test

```
$ npm test
```

# example

```js
  const fs = require("fs");
  const loader = require("@assemblyscript/loader");

  const imports = { /* imports go here */ };
  const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/../build/base32.wasm"), imports);
  const myModule = wasmModule.exports;


  // Uint8Array --> base32 string
  const ptr1 = myModule.__allocArray(myModule.Uint8Array_ID, [1]);
  const encodePtr1 = myModule.encode32(ptr1);
  const encodedStr1 = myModule.__getString(encodePtr1);

  // base32 string --> Uint8Array
  const ptr2 = myModule.__allocString(encodedStr1);
  const decodePtr2 = myModule.decode32(ptr2);
  const decodedArr2 = myModule.__getUint8Array(decodePtr2);


  // string --> base32 string
  const ptr3 = myModule.__allocString('ABC');
  const encodePtr3 = myModule.encode32str(ptr3);
  const encodedStr3 = myModule.__getString(encodePtr3);

  // base32 string --> string
  const ptr4 = myModule.__allocString(encodedStr3);
  const decodePtr4 = myModule.decode32str(ptr4);
  const decodedStr4 = myModule.__getString(decodePtr4);


```

# License

MIT
