export declare type Test = {
    ancestors: string;
    title: string;
    name: string;
    kind: string;
    params: string[];
    range: string;
    body: any;
};
export declare type Importset = {
    defaultname: string;
    names: string[];
    filepath: string;
};
export declare type Testdata = {
    filepath: string;
    importset: Importset;
    tests: Test[];
};
export declare type Collections = {
    exportdefault?: string[];
    functions: Test[];
    classes: Test[];
};
export declare type Method = {
    kind?: string;
    static?: boolean;
    name?: string;
    params?: string[];
    async?: boolean;
};
export declare type ClassMethods = {
    constructor: {
        kind?: string;
        name?: string;
        params?: string[];
        async?: boolean;
    };
    methods: Method[];
};
