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

# example function
```bash
npx jestter ./src/myfunc1.js
```

*JavaScript* ./src/myfunc1.js
```bash
export let funcname1 = function(c,d=10){
  return c + d;
}

export function funcname2(...numbers){
  return numbers.reduce((total,n)=> total + n, 0);
}

export const funcname3 = (a,b) => {
  return a + b;
}

function funcname4(argE,argF){
  return argE + argF;
}
```

*test data* ./src/\_\_tests\_\_/myfunc1.test.js
local function need 'npm install -save-dev babel-plugin-rewire'
```bash
import {funcname1,funcname2,funcname3,__RewireAPI__ as myfunc1RewireAPI} from '../myfunc1.js';

test('export funcname1 Test ....', () => {
  const c = undefined;
  const d = undefined;
  const result = undefined;
  
  expect(funcname1(c,d)).toBe(result);
});
test('export funcname2 Test ....', () => {
  const numbers = undefined;
  const result = undefined;
  
  expect(funcname2(numbers)).toBe(result);
});
test('export funcname3 Test ....', () => {
  const a = undefined;
  const b = undefined;
  const result = undefined;
  
  expect(funcname3(a,b)).toBe(result);
});
test('local funcname4 Test ....', () => {
  const argE = undefined;
  const argF = undefined;
  const result = undefined;
  const funcname4 = myfunc1RewireAPI.__get__('funcname4')
  expect(funcname4(argE,argF)).toBe(result);
});
```

# example class
```bash
npx jestter ./src/myclass.js
```

*JavaScript* ./src/myclass.js
```bash
export default class MyClass {
    constructor(name= "bar") {
      this.name = name;
    }
  
    classFunc(argA) {
      return 'Hello! ' + this.name + " " + argA;
    }

    static classFunc2(argB){
      return argB;
    }
}
```

*test data* ./src/\_\_tests\_\_/myclass.test.js
```bash
import MyClass from '../myclass.js';

test('exportdefault MyClass Test ....', () => {
  const name = undefined;
  const argA = undefined;
  const argB = undefined;
  const result1 = undefined;
  const result2 = undefined;
  
  const _MyClass = new MyClass(name);
  expect(_MyClass.classFunc(argA)).toBe(result1);
  expect(MyClass.classFunc2(argB)).toBe(result2);
});
```

# example React
```bash
npx jestter ./src/App.js --kind REACT
```
*JavaScript* ./src/App.js
```bash
import React from "react";

function App () {
  return (
    <div className="App">
      <header className="App-header">
	  <h1>
	    Jestter Test
	  </h1>
      </header>
    </div>
  );
}

export default App;
```

*test data* ./src/\_\_tests\_\_/App.test.js
```bash
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {screen, cleanup, fireEvent, render} from '@testing-library/react';

import App from '../App.js';

test('exportdefault App Test ....', () => {
  const result = undefined;
  
  const { getByText } = render(<App />);
  const obj = getByText(/Great Test/);
  expect(obj).toHaveTextContent(result);
});
```
