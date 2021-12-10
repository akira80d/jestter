const fs = require("fs");

let datas = null;

function writeJest() {
    if (process.argv.length == 2) {
        console.log("select jsfile in argument");
        console.log(" $ node writeJest.js ./test.js");
        return;
    }

    const filepath = process.argv[2];

    const nodes = makeNodesFromJsfile(filepath);

    //console.log(nodes.children.map(c => c.children));
    mylog(0, "root child[2]:child:", nodes.children[2].children);
    mylog(0, "root child[5]:", nodes.children[5].children[3]);
    //mylog(0, "root child[6]:", nodes.children[6]);
    //mylog(0,"root child[7]:child:", nodes.children[7].children);
}

function makeNodesFromJsfile(filepath) {
    let data = fs.readFileSync(filepath, "utf-8");
    datas = data.split("");

    // make root Node
    let rootobj = makeRootNode(0, data.length);

    // make sentence Node
    let termination = [{ begin: ["", 0], end: ["\n", 1], kind: "RETURN" }];
    let firstPoint = rootobj.firstPoint;
    let lastPoint = rootobj.lastPoint;
    let props = {
        firstPoint: firstPoint,
        lastPoint: lastPoint,
        level: rootobj.level,
        termination: termination,
        kind: nodeKind.SENTENCE,
    };
    const sentences = loop(props);

    //	return (objs)

    rootobj.children = sentences;

    sentences.forEach((sen) => {
        let objs = loop({
            firstPoint: sen.firstPoint,
            lastPoint: sen.lastPoint,
            level: sen.level,
            termination: [{ begin: ["", 0], end: [" ", 1], kind: "SPACE" }],
            //kind: nodeKind.OBJ,
        });
        sen.children = objs;
        //console.log(sen, sen.children);
    });

    //make other Node
    /*
    obj = rootobj.children[7].children[3];
    let obj3 = loop({
        firstPoint: obj.firstPoint,
        lastPoint: obj.lastPoint,
        level: obj.level,
        termination: [{ begin: ["", 0], end: [" ", 1], kind: "SPACE" }],
        kind: nodeKind.OBJ,
        debug: true,
    });
*/
    //console.log(obj3)

    //	return (rootobj.children[7].children[3])
    return rootobj;
}

function loop(props) {
    let firstPoint = props.firstPoint;
    objs = [];
    while (firstPoint < props.lastPoint) {
        node = makeNodes({
            firstPoint: firstPoint,
            lastPoint: props.lastPoint,
            level: props.level,
            termination: props.termination,
            kind: props.kind,
            debug: props.debug ? props.debug : false,
        });

        objs.push(node);
        firstPoint = node.lastPoint + 1;
    }
    return objs;
}

function mylog(i, name, props) {
    console.log("mylog: i:", i, name, props);
}

function makeNodes(props) {
    let termination = props.termination;
    let firstPoint = props.firstPoint;
    const lastPoint = props.lastPoint;
    const level = props.level;
    let node;

    for (let i = firstPoint; i < props.lastPoint; i++) {
        //debug process
        if (props.debug) {
            mylog(i, "makeNodes debug", {
                datas: datas[i],
                hasEndTermination: hasEndTermination(i, termination),
            });
        }

        // delete space
        if (firstPoint == i && /\s/.test(datas[i])) {
            firstPoint += 1;
            continue;
        }

        // make node in firstPoint
        if (i == firstPoint) {
            node = makeNodeInFirstPoint(i, props.kind, level, firstPoint);
        }

        // termination start point process
        if (hasBeginTermination(i, termination, node.level)) {
            termination.push(getTermination(i));

            mylog(i, "term.push:", { term: termination });
            /*
            if (node.level >= 3) {
                if (firstPoint == i) {
                    node.kind = getTermination(i).kind;
                    //	console.log("!!!termination:",termination, termination.length)
                }
            }*/
            node.contents += datas[i];
            node.memo += " term.push:" + node.kind;
            continue;
        }

        // termination end point process
        if (hasEndTermination(i, termination)) {
            //mylog(i, "hasEndTerm:",{term:termination, kind: node.kind} )
            // \n space delete
            if (datas[i] == "\n" || /\s/.test(datas[i])) {
            } else {
                //mylog(i, "end space:", {datas: datas[i], exp:/\s/.test(datas[i])})
                node.contents += datas[i];
            }
            /*
             * TODO: if SENTENCE??
             */
            if (termination.length == 1 || node.level > 2) {
                // || node.kind != "SENTENCE") {
                node.lastPoint = i;

                //mylog(i,"isBackets(kind) :",{isBackets: isBackets(node.kind),kind:node.kind, datas:datas[i]})
                if (isBackets(node.kind)) {
                    node.end = datas[i];
                }

                if (returnEndTerminationWordCount(i, termination)[0] == 2) {
                    node.lastPoint = i + 1;
                    node.contents += datas[i + 1];
                }
                node.memo += " kind:" + termination.slice(-1)[0].kind;

                node.memo += " hasEndTermination";
                if (node.level > 2) {
                    termination = popTermination(i, termination, lastPoint);
                }

                return node;
            }
            termination = popTermination(i, termination, lastPoint);
            continue;
        }

        // strip space when contents is empty
        if (
            (datas[i] != "\n" || termination.length > 1) &&
            !(node.contents == "" && datas[i].match(/\s/))
        ) {
            node.contents += datas[i];
        }
    }
    node.lastPoint = lastPoint;
    node.memo += " end";
    return node;
}

function makeNodeInFirstPoint(i, propsKind, level, firstPoint) {
    // search kind over level2 SENTENCE
    let kind;
    if (level == 1) {
        kind = propsKind;
    } else {
        kind = searchKind(i);
    }
    //	mylog(i, "firstPoint:", {kind: props.kind, level: level+1})

    if (isBackets(kind)) {
        const begin = datas[i];
        node = makeBracketsNode(firstPoint, level + 1, kind, begin);
    } else {
        node = makeNode({
            contents: "",
            kind: kind,
            level: level + 1,
            firstPoint: firstPoint,
        });
    }
    node.memo = kind;
    mylog(i, "kind debug", { kind: kind });
    return node;
}

function isBackets(kind) {
    return [
        "CURLYBRACKETS",
        "PARENTHESES",
        "ANGLEBRACKETS",
        "SQUAREBRACKETS",
    ].includes(kind);
}

function hasEndTermination(i, termination) {
    return (
        (termination.slice(-1)[0].end[1] == 1 &&
            datas[i] == termination.slice(-1)[0].end[0]) ||
        (termination.slice(-1)[0].end[1] == 2 &&
            datas.slice(i, i + 2).join("") == termination.slice(-1)[0].end[0])
    );
}

function returnEndTerminationWordCount(i, termination) {
    if (
        termination.slice(-1)[0].end[1] == 1 &&
        datas[i] == termination.slice(-1)[0].end[0]
    ) {
        return [1, termination.slice(-1)[0].end[0]];
    }

    if (
        termination.slice(-1)[0].end[1] == 2 &&
        datas.slice(i, i + 2).join("") == termination.slice(-1)[0].end[0]
    ) {
        return [2, termination.slice(-1)[0].end[0]];
    }

    return false;
}

function hasBeginTermination(i, termination, level) {
    if (termination.length > 1) {
        return false;
    }
    //const deny = level <= 2 ? ["<", "["] : [];
    const deny = []; //TODO delte??

    if (termRegExp1.test(datas[i])) {
        if (
            !deny.includes(datas[i]) &&
            !isIntoComment(termination) &&
            !isIntoQuotation(termination)
        ) {
            return true;
        } else {
            return false;
        }
    }

    const str = datas.slice(i, i + 2).join("");
    if (termRegExp2.test(str)) {
        if (
            !deny.includes(str) &&
            !isIntoComment(termination) &&
            !isIntoQuotation(termination)
        ) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

function getTermination(i) {
    if (termRegExp1.test(datas[i])) {
        return getTerminationItem(datas[i]);
    }
    const str = datas.slice(i, i + 2).join("");
    if (termRegExp2.test(str)) {
        return getTerminationItem(str);
    }
}

function getTerminationItem(str) {
    for (let i = 0; i < termList.length; i++) {
        if (termList[i].begin[0] == str) {
            return termList[i];
        }
    }
    console.log("getTerminationItem--------------", str);
    return false;
}

function searchKind(i) {
    const kindItem1 = getTerminationItem(datas[i]);
    if (!(kindItem1 == false)) {
        return kindItem1.kind;
    }

    const kindItem2 = getTerminationItem(datas.slice(i, i + 2).join(""));
    if (!(kindItem2 == false)) {
        return kindItem2.kind;
    }
    return nodeKind.OBJ;
}

//{ begin: [" ", 1], end: [" ", 1], kind: "SPACE" },
const termList = [
    { begin: ["{", 1], end: ["}", 1], kind: "CURLYBRACKETS" },
    { begin: ["(", 1], end: [")", 1], kind: "PARENTHESES" },
    { begin: ["<", 1], end: [">", 1], kind: "ANGLEBRACKETS" },
    { begin: ["[", 1], end: ["]", 1], kind: "SQUAREBRACKETS" },
    { begin: ["/*", 2], end: ["*/", 2], kind: "ASTA_COMMENT" },
    { begin: ["//", 2], end: ["\n", 1], kind: "SLASH_COMMENT" },
    { begin: ["'", 1], end: ["'", 1], kind: "SQUOTATION" },
    { begin: ['"', 1], end: ['"', 1], kind: "WQUOTATION" },
    { begin: ["`", 1], end: ["`", 1], kind: "BQUOTATION" },
];

const termRegExp1 = new RegExp("[{(<['\"`]");
const termRegExp2 = /\/\/|\/\*/;

function isIntoComment(termination) {
    return (
        termination.slice(-1)[0].end[0] == "*/" ||
        termination.slice(-1)[0].begin[0] == "//"
    );
}

function isIntoQuotation(termination) {
    return (
        termination.slice(-1)[0].begin[0] == "'" ||
        termination.slice(-1)[0].begin[0] == '"' ||
        termination.slice(-1)[0].begin[0] == "`"
    );
}

// finished used Delte termination
function popTermination(i, termination, lastPoint) {
    if (termination.length > 1) {
        // termination word countr 1 or 2
        if (termination.slice(-1)[0].end[1] == 1) {
            if (datas[i] == termination.slice(-1)[0].end[0]) {
                termination.pop();
            }
        } else if (termination.slice(-1)[0].end[1] == 2) {
            if (i < lastPoint) {
                if (
                    datas.slice(i, i + 2).join("") ==
                    termination.slice(-1)[0].end[0]
                ) {
                    termination.pop();
                }
            }
        }
    }
    return termination;
}

function makeRootNode(firstPoint, lastPoint) {
    const level = 1;
    return makeNode({
        contents: "",
        kind: nodeKind.ROOT,
        level: level,
        firstPoint: firstPoint,
        lastPoint: lastPoint,
    });
}

function makeBracketsNode(firstPoint, level, kind, begin) {
    let node = makeNode({
        contents: "",
        kind: kind,
        level: level,
        firstPoint: firstPoint,
        begin: begin,
        end: "",
    });
    let sentenceNode = makeNode({
        contents: "",
        kind: nodeKind.SENTENCE,
        level: level + 1,
    });
    node.children.push(sentenceNode);
    return node;
}

function makeNode(props) {
    //contents, kind, level, firstPoint, lastPoint = null) {
    let node = {
        kind: props.kind,
        contents: props.contents,
        firstPoint: props.firstPoint,
        lastPoint: props.lastPoint,
        begin: props.begin, // {(<[
        end: props.end, // })>]
        children: [],
        level: props.level,
        memo: [],
    };
    return node;
}

const nodeKind = {
    ROOT: "ROOT",
    SENTENCE: "SENTENCE",
    OBJ: "OBJ",
    CURLYBRACKETS: "CURLYBRACKETS",
    PARENTHESES: "PARENTHESES",
    SLASH_COMMENT: "SLASH_COMMENT",
    ASTA_COMMENT: "ASTA_COMMENT",
    WQUOTATION: "WQUOTATION",
    SQUOTATION: "SQUOTATION",
    ANGLEBRACKETS: "ANGLEBRACKETS",
    SQUAREBRACKETS: "SQUAREBRACKETS",
};

writeJest();
