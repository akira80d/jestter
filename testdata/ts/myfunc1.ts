
export let funcname1 = function(c:number,d: number =10):number {
  const e = funcname4(c, d);
  return c + d + e;
}

export function funcname2(...numbers: number[]){
  return numbers.reduce((total,n)=> total + n, 0);
}

export const funcname3 = (a:number ,b:number ) => {
  return a + b;
}

function funcname4(argE:number ,argF:number ){
  return argE + argF;
}

