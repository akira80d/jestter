export type Test = {
    ancestors: string,
    title: string,
    name: string,
    kind: string,
    params: string[],
    range: string,
    body: any,
}
  
export type Importset = {
    defaultname: string,
    names: string[],
    filepath: string,
}

export type Testdata = {
    filepath: string,
    importset: Importset,
    tests: Test[],
}
  
export type Collections = {
    exportdefault?: string[],
    functions: Test[],
    classes: Test[],
}
  
export type Method = {
    kind?: string,
    static?: boolean,
    name?: string,
    params?: string[],
    async?: boolean
}
  
export type ClassMethods = {
    constructor: {
      kind?: string,
      name?: string,
      params?: string[],
      async?: boolean
    },
    methods: Method[]
}
  