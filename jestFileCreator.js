const fs = require("fs");

let datas = null;
let idlist = [];
let nextNum = 0;
let nodeProcessLog = [];

function writeJest() {
  if (process.argv.length == 2) {
    console.log("select jsfile in argument");
    console.log(" $ node writeJest.js ./test.js");
    return;
  }

  const filepath = process.argv[2];
  const rootNodeId = getRootNodeIdFromJsfile(filepath);

  // make sentence Node
  let termination = [{ begin: ["", 0], end: ["\n", 1], kind: "RETURN" }];
  const kind = "SENTENCE";
  const nodeProcessNum = 1;
  const bool = makeNodeProcess(rootNodeId, termination, kind, nodeProcessNum);

  debugNode();
}

function getRootNodeIdFromJsfile(filepath) {
  let data = fs.readFileSync(filepath, "utf-8");
  datas = data.split("");

  // make root Node
  let rootNodeId = makeRootNode(0, data.length - 1);

  return rootNodeId;
}

function makeNodeProcess(objId, termination, kind, num) {
  mylog(9999, " makeNodeProcess start------", {
    objId: idlist[objId],
    nodeProcessNum: num,
  });
  let firstPoint = idlist[objId].firstPoint;
  let termination2 = [{ begin: ["", 0], end: [" ", 1], kind: "SPACE" }];

  while (firstPoint < idlist[objId].lastPoint) {
    processPoint = makeNodes({
      parentId: idlist[objId].id,
      firstPoint: firstPoint,
      lastPoint: idlist[objId].lastPoint,
      level: idlist[objId].level,
      termination: termination,
      kind: kind,
    });

    firstPoint = processPoint + 1;
  }

  idOrFalse = seekSentence();
  if (idOrFalse == false) {
    return true
  } else {
    makeNodeProcess(idOrFalse, termination2, "", num + 1);
  }
}

/*
 * return id is needed to make node
 * or false
 */
function seekSentence() {
  for (let i = 0; i < idlist.length; i++) {
    let node = idlist[i];
    if (node.kind == "SENTENCE" && node.children.length == 0) {
      //firstPoint lastPoint is not undefined
      let firstPoint = node.firstPoint
        ? node.firstPoint
        : idlist[node.parentId].firstPoint + 1;
      let lastPoint = node.lastPoint
        ? node.lastPoint
        : idlist[node.parentId].lastPoint - 1;

      if (firstPoint < lastPoint) {
        if (node.firstPoint == undefined) {
          const functionname = "seekSentence";
          editFirstPoint(i, firstPoint, functionname);
        }
        if (node.lastPoint == undefined) {
          const functionname = "seekSentence";
          editLastPoint(i, lastPoint, functionname);
        }
        return node.id;
      } else {
        makeTerminationNode(i, node);
      }
    }
  }
  return false;
}

function makeTerminationNode(i, node) {
  // make termination Node
  const tNodeId = makeNode({
    parentId: node.id,
    kind: nodeKind.TERMINATION,
    level: node.level + 1,
  });
}

function makeNodes(props) {
  let termination = props.termination;
  let firstPoint = props.firstPoint;
  const lastPoint = props.lastPoint;
  const level = props.level;
  const kind = props.kind;
  const parentId = props.parentId;
  let node;

  for (let i = firstPoint; i <= lastPoint; i++) {
    // delete space
    if (firstPoint == i && /\s/.test(datas[i])) {
      firstPoint += 1;
      continue;
    }

    // make node in firstPoint
    if (i == firstPoint) {
      nodeId = makeNodeInFirstPoint(i, kind, level, firstPoint, parentId);
    }

    // termination begin point process
    if (hasBeginTermination(i, termination, idlist[nodeId].level)) {
      termination.push(getTermination(i));
      mylog(i, "T-push:", { term: termination.slice(-1)[0].end[0] });

      // store before process nodeId
      if (idlist[nodeId].contents != "") {
        if (isStoreNode(i, nodeId, termination)) {
          if (idlist[nodeId].lastPoint == undefined) {
            const functionname = "makeNodes_beginPoint";
            editLastPoint(nodeId, i - 1, functionname);
            mylog(i, functionname, { lastPoint: idlist[nodeId].lastPoint });
          }
          storeNodeProcess(nodeId, "hasBeginTerm");
          return i;
        }
      }

      /*
       * TODO is there the problem? when kind of node is brackets
       *  /n {a;"a",b;"b" }("aaaa")
       */
      idlist[nodeId].contents += datas[i];
      idlist[nodeId].memo += "T-push:" + idlist[nodeId].kind;
      continue;
    }

    // termination end point process
    if (hasEndTermination(i, termination)) {
      const nodeIdfalse = terminationEndPointProcess(i, nodeId, termination);

      if (termination.length > 1) {
        mylog(i, "T-pop:", { term: termination.slice(-1)[0].end[0] });
        if (termination.length > 2) {
          mylog(i, "T-pop222222:", { term: termination.slice(-1)[0].end[0] });
        }
        termination = popTermination(i, termination, lastPoint);
      }

      /*
       * same termination process
       * termination.length > 1 continue
       */
      if (termination.length > 1) {
        continue;
      } else if (nodeIdfalse == false) {
        continue;
      } else {
        nodeId = nodeIdfalse;
        return i;
      }
    }

    // strip space when contents is empty
    if (
      (datas[i] != "\n" || termination.length > 1) &&
      !(idlist[nodeId].contents == "" && datas[i].match(/\s/))
    ) {
      idlist[nodeId].contents += datas[i];
    }
  }

  if (idlist[nodeId].lastPoint == undefined) {
    idlist[nodeId].memo += " End lastPoint == undefined!!!!!!!!!-----";
    let functionname = " makeNodesEnd";
    editLastPoint(nodeId, lastPoint, functionname);
  }

  return lastPoint;
}

function isStoreNode(i, nodeId, termination) {
  const node = idlist[nodeId];
  /*
  mylog(i, " isStoreNode:", {
    kind: node.kind == "SENTENCE",
    termLength: termination.length > 1,
    contents: node.contents,
    beginTerm: datas[i],
  });*/
  
  if (isBackets(node.kind)){
	return false
  }
  return !(node.kind == "SENTENCE" && termination.length > 1);
}

function storeNodeProcess(nodeId, prefunction) {
  idlist[nodeId].memo += " saveNodeProcessFrom" + prefunction;
  return nodeId;
}

function makeNodeInFirstPoint(i, propsKind, level, firstPoint, parentId) {
  // search kind over level2
  let kind;
  if (level == 1) {
    kind = propsKind;
  } else {
    kind = searchKind(i);
  }

  if (isBackets(kind)) {
    const begin = datas[i];
    nodeId = makeBracketsNode(firstPoint, level + 1, kind, begin, parentId);
  } else {
    nodeId = makeNode({
      parentId: parentId,
      contents: "",
      kind: kind,
      level: level + 1,
      firstPoint: firstPoint,
    });
  }
  idlist[nodeId].memo = kind;
  mylog(i, "makeNodeInFirstPoint", { kind: kind });
  return nodeId;
}

/*
 * termination end point process
 * return Node or false
 * false: not return Node when level <= 2 and termination.length > 1
 */
function terminationEndPointProcess(i, nodeId, termination) {
  // \n space delete
  if (!(datas[i] == "\n" || /\s/.test(datas[i]))) {
    //} else {
    idlist[nodeId].contents += datas[i];
  }

  if (!(termination.length == 1 || idlist[nodeId].level > 2)) {
    return false;
  }

  // input end propertiee
  if (isBackets(idlist[nodeId].kind)) {
    idlist[nodeId].end = datas[i];
  }

  if (returnEndTerminationWordCount(i, termination)[0] == 2) {
    const functionname = " terminationEndPointP:WordCount==2:";
    editLastPoint(nodeId, i + 1, functionname);
    idlist[nodeId].contents += datas[i + 1];
  } else {
    const functionname = " terminationEndPointP:fP+wlength:";
    editLastPoint(
      nodeId,
      idlist[nodeId].firstPoint + idlist[nodeId].contents.length - 1,
      functionname
    );

    idlist[nodeId].memo +=
      " f+wlength:" +
      (idlist[nodeId].firstPoint + idlist[nodeId].contents.length - 1);
  }
  idlist[nodeId].memo += " kind:" + termination.slice(-1)[0].kind;
  idlist[nodeId].memo += " hasEndTermination";

  mylog(i, " termEndPointProcess", {
    f: idlist[nodeId].firstPoint,
    l: idlist[nodeId].lastPoint,
    contents: idlist[nodeId].contents,
  });
  return nodeId;
}

function isBackets(kind) {
  return [
    "CURLYBRACKETS",
    "PARENTHESES",
    //    "ANGLEBRACKETS",
    //    "SQUAREBRACKETS",
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
  if (termination.length > 1 && termination.slice(-1)[0].begin[0] != datas[i]) {
    return false;
  }

  if (termRegExp1.test(datas[i])) {
    if (!isIntoComment(termination) && !isIntoQuotation(termination)) {
      return true;
    } else {
      return false;
    }
  }

  const str = datas.slice(i, i + 2).join("");
  if (termRegExp2.test(str)) {
    if (!isIntoComment(termination) && !isIntoQuotation(termination)) {
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
  return false;
}

function searchKind(i) {
  const kindItem1 = getTerminationItem(datas[i]);
  if (kindItem1 != false) {
    return kindItem1.kind;
  }

  const kindItem2 = getTerminationItem(datas.slice(i, i + 2).join(""));
  if (kindItem2 != false) {
    return kindItem2.kind;
  }
  return nodeKind.OBJ;
}

//{ begin: [" ", 1], end: [" ", 1], kind: "SPACE" },
const termList = [
  { begin: ["{", 1], end: ["}", 1], kind: "CURLYBRACKETS" },
  { begin: ["(", 1], end: [")", 1], kind: "PARENTHESES" },
  //  { begin: ["<", 1], end: [">", 1], kind: "ANGLEBRACKETS" },
  //  { begin: ["[", 1], end: ["]", 1], kind: "SQUAREBRACKETS" },
  { begin: ["/*", 2], end: ["*/", 2], kind: "ASTA_COMMENT" },
  { begin: ["//", 2], end: ["\n", 1], kind: "SLASH_COMMENT" },
  { begin: ["'", 1], end: ["'", 1], kind: "SQUOTATION" },
  { begin: ['"', 1], end: ['"', 1], kind: "WQUOTATION" },
  { begin: ["`", 1], end: ["`", 1], kind: "BQUOTATION" },
];

//const termRegExp1 = new RegExp("[{(<['\"`]");
const termRegExp1 = new RegExp("[{('\"`]");
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

/*
 * finished used Delete termination
 */
function popTermination(i, termination, lastPoint) {
  if (termination.length > 1) {
    // termination word countr 1 or 2
    if (termination.slice(-1)[0].end[1] == 1) {
      if (datas[i] == termination.slice(-1)[0].end[0]) {
        termination.pop();
      }
    } else if (termination.slice(-1)[0].end[1] == 2) {
      if (i < lastPoint) {
        if (datas.slice(i, i + 2).join("") == termination.slice(-1)[0].end[0]) {
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
    parentId: 0,
    contents: "",
    kind: nodeKind.ROOT,
    level: level,
    firstPoint: firstPoint,
    lastPoint: lastPoint,
  });
}

function makeBracketsNode(firstPoint, level, kind, begin, parentId) {
  let nodeId = makeNode({
    parentId: parentId,
    contents: "",
    kind: kind,
    level: level,
    firstPoint: firstPoint,
    begin: begin,
    end: "",
  });
  let sentenceNodeId = makeNode({
    parentId: nodeId,
    contents: "",
    kind: nodeKind.SENTENCE,
    level: level + 1,
  });
  return nodeId;
}

function editFirstPoint(id, firstPoint, functionname) {
  idlist[id].firstPoint = firstPoint;
  idlist[id].memo += " editfirstPoint:" + functionname;
}

function editLastPoint(id, lastPoint, functionname) {
  if (datas[lastPoint] == "\n") {
    idlist[id].lastPoint = lastPoint - 1;
  } else {
    idlist[id].lastPoint = lastPoint;
  }
  idlist[id].memo += " editLastPoint:" + functionname;
}

function nextId() {
  const nextId = nextNum;
  nextNum += 1;
  return nextId;
}

function makeNode(props) {
  if (props.parentId == undefined) {
    throw new Error("parentId Error");
  }

  let node = {
    id: nextId(),
    parentId: props.parentId,
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

  const nodeId = node.id;

  idlist[nodeId] = node;

  // save node id in prent.children
  if (props.parentId > 0) {
    idlist[props.parentId].children.push(nodeId);
  }

  return nodeId;
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
  //  ANGLEBRACKETS: "ANGLEBRACKETS",
  //  SQUAREBRACKETS: "SQUAREBRACKETS",
  TERMINATION: "TERMINATION",
};

function mylog(i, name, props) {
  nodeProcessLog.push([i, name, props]);
}

function debugNode() {
  for (let i = 0; i <= idlist.length; i++) {
    console.log(9999, " analyzeNode2", { num: i, idlist: idlist[i] });
  }

  //console.log(nodeProcessLog);
  nodeProcessLog.forEach((p) => {
    if (/^4\d+/.test(p[0])) {
      //      console.log(p);
    }
  });

  // contents.length == (lastPoint - firstPoint)
  let contents = null;
  let strnum = null;
  let flLength = null;
  for (let l = 0; l < idlist.length; l++) {
    if (idlist[l].contents != undefined) {
      contents = idlist[l].contents;
      if (contents.length == 0) {
        continue;
      }
      flLength = idlist[l].lastPoint - idlist[l].firstPoint + 1;
      if (contents.length != flLength) {
        console.log(
          "diff ID:" +
            l +
            " '" +
            contents +
            "' '" +
            datas
              .slice(idlist[l].firstPoint, idlist[l].lastPoint + 1)
              .join("") +
            "' conLen:" +
            contents.length +
            " flLen:" +
            flLength +
            " f:" +
            idlist[l].firstPoint +
            " l:" +
            idlist[l].lastPoint
        );
      }
    }
  }
}

writeJest();
