export default class MyClass {
    constructor(private name:string) {}
  
    classFunc(argA:string) {
      return 'Hello! ' + this.name + " " + argA;
    }

    static classFunc2(argB:string){
      return argB;
    }
}
