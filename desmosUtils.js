import { format, getDataFromOEIS } from "./utils";

export function makeTable(calc, xLabel, yLabel, xArr, yArr, xId, yId, id = null, hex = null) {
    if (!id) {
        id = "";
    }
    calc.setExpression({
        id: id,
        type: 'table',
        columns: [
            {
                id: id + "_" + xId,
                latex: xLabel,
                values: xArr,
            },
            {
                id: id + "_" + yId,
                latex: yLabel,
                values: yArr,
                color: hex
            },
        ]
    });
}

export async function makeFromOEIS(calc, idNum, min = null, max = null, hex = null) {
    const { sequence } = await getDataFromOEIS(idNum);

    let nArr = []
    if (!min) {
        min = 0;
    } else if (min > max) {
        min = max;
    }

    if (!max) {
        max = sequence.length;
    } else if (max > sequence.length) {
        max = sequence.length;
    }
    for (let i = min; i < max; i++) {
        nArr.push(i + 1);
    }
    const nLabel = String.raw`n_{${format(idNum)}}`;
    const sLabel = "a_n"
    const sArr = sequence.slice(min, max);
    makeTable(calc, nLabel, sLabel, nArr, sArr, "n", "a{n}", format(idNum), hex);
}

export function getExpression(calc, id) {
    let retExpr = {}
    calc.getExpressions().forEach((expr) => {
        if (expr["id"] == id) {
            retExpr = expr;
        }
    });
    return retExpr;
}

export function appendTable(calc, tableId, zLabel, zArr, zId) {
    let expr = getExpression(calc, tableId);
    expr["columns"].push({
        id: tableId + "_" + zId,
        latex: zLabel,
        values: zArr
    })
    calc.setExpression(expr);
}

export function addTransform(calc, tableId, { label, func, id }) {
    const ogArr = getExpression(calc, tableId).columns[1].values;
    appendTable(calc, tableId, label, (ogArr.map(func(calc, tableId))), id);
}

export function addRestyle(calc, tableId, { label, func }) {
    const ogArr = getExpression(calc, tableId).columns[1].values;
    calc.setExpression({
        id: tableId + "_" + label,
        latex: func(ogArr)
    });
}

export function listAllSeqs(calc) {
    const tables = calc.getExpressions().map((expr) => {
        return expr.type == "table" ? expr : null;
    }).filter(Boolean);

    let listedSequences = []
    tables.map(table => {
        table.columns.splice(1).map((column) => {
            listedSequences.push({ id: column.id, sequence: column.values });
        });
    });

    return listedSequences;
}

export function getSequence(calc, id) {
    const seqs = listAllSeqs(calc);
    for (let i = 0; i < seqs.length; i++) {
        if (seqs[i].id == id) {
            return seqs[i].sequence;
        }
    }
}

export function existInTable(calc, tableId, seqId) {
    return !(getSequence(calc, tableId + "_" + seqId) === undefined);
}

export function removeFromTable(calc, tableId, seqId) {
    console.log(calc.getExpressions());
    let table = getExpression(calc, tableId);
    console.log(table);
    for(let i = 0; i < table.columns.length; i++) {
        if(tableId + "_" + seqId == table.columns[i].id) {
            table.columns.splice(i, 1);
            break;
        }
    }
    calc.setExpression(table);
}
