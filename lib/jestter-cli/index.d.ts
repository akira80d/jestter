#!/usr/bin/env node
export default function args(__programroot: string): {
    [x: string]: unknown;
    kind: unknown;
    testdir: unknown;
    verbose: unknown;
    _: (string | number)[];
    $0: string;
};
