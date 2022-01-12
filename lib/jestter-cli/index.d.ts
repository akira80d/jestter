#!/usr/bin/env node
export default function args(__programroot: string): {
    [x: string]: unknown;
    verbose: unknown;
    _: (string | number)[];
    $0: string;
};
