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