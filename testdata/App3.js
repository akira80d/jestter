import React from "react";

function App (argA, argB) {
  const a = {a: "aaa", b:"bbb"}
  return (
    <div className="App">
      <header className="App-header">
	  <h1>Jestter Test</h1>
      </header>
    </div>
  );
}

export let funcname1 = function(c,d){
	return c + d;
}

export function funcname2(e,f){
	return e + f;
}

export const funcname3 = (a,b) => {
	return a + b;
}

export const name = "tarou";

function funcname4(argE,argF){
	return argE + argF;
}

export default App;
