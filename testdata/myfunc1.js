
export let funcname1 = function(c,d=10){
  const e = funcname4(c, d);
  return c + d + e;
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

