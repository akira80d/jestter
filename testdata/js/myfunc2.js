/*
 * ExportDefaultDeclaration > AssignmentExpression >
 * Identifier > CallExpression
 */

export const myfunc = (function(a, b = "hello"){
  return function(san){
    return `${b} ${a}${san}`
  }
}());

export const myfunc2 = (function(a, ...b){
  let c = false;
  return function(arg){
    if(arg=="true"){
      c = true
    }
    if (c){
      return a + b[0];
    }else{
      return a;
    }
  }
}());
