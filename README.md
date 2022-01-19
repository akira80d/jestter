# Jestter
STUB FIRST DEVELOPMENT. Jestter scaffold Jest Test File from your stub.

# Getting Started
install Jestter using npm:
```bash
npm install --save-dev jestter
```
Or yarn:
```bash
yarn add --dev jestter
```

# Usage
```bash
npx jestter ./myfile.js
```
Jestter create a file.
  ./\_\_tests\_\_/myfile.test.js

# example
myfile.js
```bash
export default function myfunc(a,b,c){
  return a + b + c;
}
```

./\_\_tests\_\_/myfile.test.js
```bash
 import myfunc from '../myfile.js';
 
 test('myfunc Test ....'), (a,b,c) => {
    const a = undefiend;
    const b = undefiend;
    const c = undefiend;
    
    expect(myfunc(a,b,c)).toBe();
 });
```

# React
./jestter.json
```bash
{
  "kind": "REACT",
  "testdir": "__tests__"
}
```
