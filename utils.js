export function format(n) {
    let res = n.toString();
    while (res.length < 6) {
        res = "0" + res;
    }
    return "A" + res;
}

export function replace(str, index, chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

export async function getDataFromOEIS(idNum) {
    const url = `https://oeis.org/search?q=id:${format(idNum)}&fmt=json`;
    let data = await(fetch(url)
        .then(response => {return response.json()})
        .then(data => {return data}));
    data = data.results[0];
    const sequence = data.data.split(',').map( num => Number(num));
    return {
        sequence: sequence,
        formulas: data.formula,
        examples: data.example,
        link:`https://oeis.org/${format(idNum)}`,
    };
}

export function checkBoxHiding(btnId, divId, onCheckCallback, onUncheckCallback, negate = false) {
    const btn = document.getElementById(btnId);
    let div = document.getElementById(divId);

    if(btn.checked == !negate) {
        div.style.display = "block";
        onCheckCallback();
    } else {
        div.style.display = "none";
        onUncheckCallback();
    }
}