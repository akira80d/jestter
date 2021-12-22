# Jestter
STUB FIRST. Jestter scaffold Jest Test File from your stub.

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
./__TEST__/myfile.test.js

myfile.js
```bash
export default function myfunc(a,b,c){
  return a + b + c;
}
```

./__TEST__/myfile.test.js
```bash
 import myfunc from '../myfile.js';
 
 test('myfunc Test ....'), (a,b,c) => {
    const a == undefiend;
    const b == undefiend;
    const c == undefiend;
    
    expect(myfunc(a,b,c)).toBe();
 });
```