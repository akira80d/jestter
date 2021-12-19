import React from "react";

function App () {
  const a = {a: "aaa", b:"bbb"}
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

export const funcname = (a,b) => {
	return a + b;
}

export const name = "tarou";

export default App;
