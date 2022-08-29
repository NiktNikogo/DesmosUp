import { checkBoxHiding, format, replace, } from "./utils";
import { makeFromOEIS, addTransform, addRestyle, listAllSeqs, getSequence, makeTable, existInTable, removeFromTable } from "./desmosUtils";
const seqTransformActions = {
    "seq_log": {
        func: (calc, id) => {
            calc.setExpression({ id: id + "_seq_log_slider", latex: String.raw`b_{${id}} = 10` });
            return (a_n) => {
                return String.raw`\log_{b_{${id}}}(${a_n})`;
            }
        },
        label: "b_n",
        coExpr: "_seq_log_slider",
        id: "b{n}",
    },
    "seq_alt": {
        func: (calc, id) => {
            return (a_n, index) => {
                return String.raw`${a_n}\left(-1\right)^{${index}}`;
            }
        },
        label: "c_n",
        id: "c{n}",
    },
    "seq_exp": {
        func: (calc, id) => {
            calc.setExpression({ id: id + "_seq_exp_slider", latex: String.raw`c_{${id}} = 10` });
            return (a_n) => {
                return String.raw`\left(${a_n}\right)^{c_{${id}}}`;
            }
        },
        label: "d_n",
        coExpr: "_seq_exp_slider",
        id: "d{n}",
    },
    "seq_mul": {
        func: (calc, id) => {
            calc.setExpression({ id: id + "_seq_mul_slider", latex: String.raw`m_{${id}} = 10` });
            return (a_n) => {
                return String.raw`\left(${a_n}\right)\ \cdot\ m_{${id}}`
            }
        },
        label: "e_n",
        coExpr: "_seq_mul_slider",
        id: "e{n}",
    },
    "seq_add": {
        func: (calc, id) => {
            calc.setExpression({ id: id + "_seq_add_slider", latex: String.raw`l_{${id}} = 10` });
            return (a_n) => {
                return String.raw`${a_n}\ +\ l_{${id}}`
            }
        },
        label: "f_n",
        coExpr: "_seq_add_slider",
        id: "f{n}",
    },
    "seq_har": {
        func: (calc, id) => {
            return (a_n, index) => {
                return String.raw`\frac{\left(${a_n}\right)}{${index}!}`
            }
        },
        label: "g_n",
        id: "g{n}",
    },
    "seq_pow": {
        func: (calc, id) => {
            calc.setExpression({ id: id + "_seq_pow_slider", latex: String.raw`t_{${id}} = 10` });
            return (a_n) => {
                return String.raw`{t_{${id}}}^{\left(${a_n}\right)}`
            }
        },
        label: "h_n",
        coExpr: "_seq_pow_slider",
        id: "h{n}",
    },
    "seq_mod": {
        func: (calc, id) => {
            calc.setExpression({ id: id + "_seq_mod_slider", latex: String.raw`k_{${id}} = 10` });
            return (a_n) => {
                return String.raw`\operatorname{mod}\left(${a_n},{k_{${id}}}\right)`
            }
        },
        label: "i_n",
        coExpr: "_seq_mod_slider",
        id: "i{n}",
    },
    "seq_acc": {
        func: (calc, id) => {
            return (a_n, index, arr) => {
                const tempArr = arr.map((n) => Number(n));
                return tempArr.slice(0, index + 1).reduce((partial, a_i) => partial + a_i)
            }
        },
        label: "j_n",
        id: "j{n}",
    }
}
const seqRestyleActions = {
    "seq_pol": {
        func: (seq) => {
            let seqPoly = "f(x) = ";
            seq.forEach((a_n, index) => {
                seqPoly += String.raw`\left(${a_n}\right) \cdot x^{${index}} +`;
            })
            seqPoly = replace(seqPoly, seqPoly.length - 1, "");
            return seqPoly;
        },
        label: "seq_pol"
    },
    "seq_pmx": {
        func: (seq) => {
            let seqPoly = "g(x) = ";
            const maximum = Math.max(...seq);
            seq.forEach((a_n, index) => {
                seqPoly += String.raw`\left( \frac{${a_n}}{${maximum}}\right) \cdot x^{${index}} +`;
            })
            seqPoly = replace(seqPoly, seqPoly.length - 1, "");
            return seqPoly;
        },
        label: "seq_pmx",
    },
    "seq_rot": {
        func: (seq) => {
            let seqPoly = "h(x) = ";
            seq.forEach((a_n) => {
                seqPoly += String.raw`\left(x - ${a_n} \right)`;
            });
            return seqPoly;
        },
        label: "seq_rot",
    },
    "seq_nrt": {
        func: (seq) => {
            let seqPoly = "k(x) = ";
            seq.forEach((a_n) => {
                seqPoly += String.raw`\left(x/${a_n} - 1\right)`;
            });
            return seqPoly;
        },
        label: "seq_nrt",
    },
    "seq_dec": {
        func: (seq) => {
            let seqPoly = "p(x) = ";
            seq.forEach((a_n, index) => {
                seqPoly += String.raw`\left( \frac{${a_n}}{${index}!}\right) \cdot x^{${index}} +`;
            })
            seqPoly = replace(seqPoly, seqPoly.length - 1, "");
            return seqPoly;
        },
        label: "seq_dec",
    }
}
//using Allow CORS: Access-Control-Allow-Origin extension 
let combinedCounter = 0;
let elt = document.getElementById('calc');
let calc = Desmos.GraphingCalculator(elt, { folders: true, invertedColors: true, notes: true });
function bar() {
    console.log("asd");
}
const scriptToInject = `
const addToCalc = ({id, sequence, color}) => {
    window.parent.addToCalc({id, sequence, color})
};
`
const beginningScript = `
//main function used for generating sequences
function main() {
    let values = [1, 2, 3];
    const id = "myNewSequence", color = "#C0FFEE";
    const seqData = {id: id, sequence: values, color: color};

    //addToCalc adds our values onto graph,
    //they need to be in a format
    //{id:myId, sequence:mySequence, hex: myHex}
    //id needds to ba a valid string
    //sequence needs to be an array
    //color needs to be a valid hex code for a color
    addToCalc(seqData);
}
main();
`
let submitBtn = document.getElementById('seq-btn');
let combineSubBtn = document.getElementById('combine-submit-btn');
let transformBtn = document.getElementById('transforms-check');
let actionsBtn = document.getElementById('actions-check');
let seqListBtn = document.getElementById('sequences-list-check');
let addingSequence = document.getElementById('adding-sequence-check');
let combiningBtn = document.getElementById('combine-sequences-check');
let modeSwitch = document.getElementById('mode-switch');
let runBtn = document.getElementById('run-btn');
let addTransformBtn = document.getElementById("transform-btn");
let addRestyleBtn = document.getElementById("action-btn");


addRestyleBtn.onclick = (e) => {
    e.preventDefault(); 
    const id = document.getElementById('action-id').value;
    if(!id) {
        return;
    }
    const tableId = id.split("_")[0];
    for (const name in seqRestyleActions) {
        const check = document.getElementById(name).checked;
        if (check) {
            addRestyle(calc, tableId, seqRestyleActions[name]);
        } else {
            calc.removeExpression({ id: tableId + "_" + seqRestyleActions[name].label });
        }
    }
}
addTransformBtn.onclick = (e) => {
    e.preventDefault();
    const id = document.getElementById('trans-id').value;
    if(!id) {
        return;
    }
    const tableId = id.split("_")[0];
    for (const name in seqTransformActions) {
        const check = document.getElementById(name).checked;
        const exists = existInTable(calc, tableId, seqTransformActions[name].id);
        if (check) {
            if(!exists) 
                addTransform(calc, tableId, seqTransformActions[name]);
        } else { 
            if (seqTransformActions[name].coExpr) 
                calc.removeExpression({ id: tableId + seqTransformActions[name].coExpr });
            if(exists) {
                removeFromTable(calc, tableId, seqTransformActions[name].id);
            }
        }
    }
}
modeSwitch.onchange = (e) => {
    const isOnStyle = "text-green-400";
    const isOffStyle = "text-red-400"
    checkBoxHiding("mode-switch", "editor",
        () => {
            let editorTag = document.getElementById("mode-switch-on");
            let runBtn = document.getElementById("run-btn");
            editorTag.classList = null;
            editorTag.classList.add(isOnStyle);
            runBtn.style.display = "inline";

        }, () => {
            let editorTag = document.getElementById("mode-switch-on");
            let runBtn = document.getElementById("run-btn");
            editorTag.classList = null;
            editorTag.classList.add(isOffStyle);
            runBtn.style.display = "none";
        });
    checkBoxHiding("mode-switch", "math",
        () => {
            let mathTag = document.getElementById("mode-switch-off");
            mathTag.classList = null;
            mathTag.classList.add(isOnStyle);
        }, () => {
            let mathTag = document.getElementById("mode-switch-off");
            mathTag.classList = null;
            mathTag.classList.add(isOffStyle);
        }, true);
}
combiningBtn.onclick = (e) => {
    checkBoxHiding('combine-sequences-check', 'combine',
        () => { }, () => { });
}
addingSequence.onclick = (e) => {
    checkBoxHiding('adding-sequence-check', 'adding-sequence',
        () => { }, () => { });
}
transformBtn.onclick = (e) => {
    checkBoxHiding('transforms-check', 'transforms',
        () => { return }, () => {
            for (const name in seqTransformActions) {
                document.getElementById(name).checked = false;
            }
        });
}
actionsBtn.onclick = (e) => {
    checkBoxHiding('actions-check', 'actions',
        () => { return }, () => {
            for (const name in seqRestyleActions) {
                document.getElementById(name).checked = false;
            }
        });
}
seqListBtn.onclick = (e) => {
    checkBoxHiding('sequences-list-check', 'list',
        () => {
            let sequencesList = document.getElementById('sequencesList');
            listAllSeqs(calc).map(item => {
                let li = document.createElement("li");
                li.textContent = `id: ${item.id}`;
                sequencesList.appendChild(li);
            })
        }, () => {
            let sequencesList = document.getElementById('sequencesList');
            sequencesList.innerHTML = '';
        });
}
submitBtn.onclick = async (e) => {
    e.preventDefault();
    const id = document.getElementById('seq_id').value == 0 ? "27" : document.getElementById('seq_id').value;
    const min = document.getElementById('seq_min').value == 0 ? 0 : Number(document.getElementById('seq_min').value);
    const max = document.getElementById('seq_max').value == 0 ? 10 : Number(document.getElementById('seq_max').value);
    const colorHex = document.getElementById('seq_hex').value == 0 ? "#4B1D00" : document.getElementById('seq_hex').value;
    await makeFromOEIS(calc, id, min, max, colorHex);
    for (const name in seqRestyleActions) {
        const check = document.getElementById(name).checked;
        if (check) {
            addRestyle(calc, format(id), seqRestyleActions[name]);
        } else {
            calc.removeExpression({ id: format(id) + "_" + seqRestyleActions[name].label });
        }
    }
}
combineSubBtn.onclick = (e) => {
    e.preventDefault();
    const xId = document.getElementById('seq_x_id').value == 0 ? "A000027_a{n}" : document.getElementById('seq_x_id').value;
    const yId = document.getElementById('seq_y_id').value == 0 ? "A000040_a{n}" : document.getElementById('seq_y_id').value;
    const combinedHex = document.getElementById('comb_seq_hex').value == 0 ? "#dead00" : document.getElementById('comb_seq_hex').value;
    const combinedId = document.getElementById('comb_seq_id').value;

    if (!combinedId) {
        alert("Invalid id");
        return;
    }
    let xSeq = getSequence(calc, xId), ySeq = getSequence(calc, yId);
    if (!(xSeq && ySeq)) {
        alert("one of the sequences with given ids does not exist");
        return;
    } else {
        makeTable(calc, "x_{seq}", "y_{seq}", xSeq, ySeq, 'x', 'y', combinedId, combinedHex);
    }
}
let editor = ace.edit("editor");
editor.setOptions({
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    enableBasicAutocompletion: true,
    fontSize: 15
});
editor.setTheme("ace/theme/tomorrow_night_eighties");
editor.session.setMode("ace/mode/javascript");
editor.setValue(beginningScript);

function addToCalc({id, sequence, color}) {
    let nArr = [];
    for(let i = 0; i < sequence.length && i < 256; i++) {
        nArr.push(i + 1);
    }

    makeTable(calc, "n", "a_{n}", nArr, sequence, "_n", "a{n}", id, color);
}

window.parent.addToCalc = addToCalc;

runBtn.onclick = (e) => {
    let code = scriptToInject + editor.getValue();
    console.log(code);
    frames[0].window.eval(code.toString());
}

