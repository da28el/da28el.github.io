
const R = (p, q, r) => {
    const N = 2 ** (p + q + r);
    let TABLE = [];
    for (let i = 0; i < N; i++) {
        let row = [];
        for (let j = 0; j < N; j++) {
            for (let zero = 0; zero < r; zero++) {
                row.push()
            }
            for (let positive = 0; positive < p; positive++) {

            }
            for (let negative = 0; negative < q; negative++) {

            }
        }
        TABLE.push(row);
    }
    return TABLE;
};

const scalar = (s, signature) => {
    let result = Array(signature.length).fill(0);
    result[0] = s;
    return result;
}

const add = (mv1, mv2) => {
    let result = [];
    for (let i = 0; i < mv1.length; i++)
        result[i] = mv1[i] + mv2[i];
    return result;
}

const sub = (mv1, mv2) => {
    let result = [];
    for (let i = 0; i < mv1.length; i++)
        result[i] = mv1[i] - mv2[i];
    return result;
}

const geometric = (mv1, mv2, signature = [[1]]) => {
    let result = Array(signature.length).fill(0);
    for (let i = 0; i < signature.length; i++) {
        for (let j = 0; j < signature[i].length; j++) {
            const value = signature[i][j];
            if (value === 0) continue;
            const sign = Math.sign(value);
            const index = Math.abs(value) - 1;
            result[index] += sign * mv1[i] * mv2[j];
        }
    }

    return result;
}

const inner = (mv1, mv2, signature) => {
    return geometric(
        add(
            geometric(mv1, mv2, signature), 
            geometric(mv2, mv1, signature)
        ), 
        scalar(1/2, signature), 
        signature
    );
}

const outer = (mv1, mv2, signature) => {
    return geometric(
        sub(
            geometric(mv1, mv2, signature), 
            geometric(mv2, mv1, signature)
        ), 
        scalar(1/2, signature), 
        signature
    );
}

const R200 = function() {
    const e1 = 1 + 1, e2 = e1 + 1;
    const e12 = e2 + 1;
    const TABLE = [
        [  1,   e1,  e2, e12],
        [ e1,    1, e12,  e2],
        [ e2, -e12,   1, -e1],
        [e12,  -e2,  e1,  -1],
    ];
    return TABLE;
}();

const R201 = function() {
    const e0 = 1 + 1, e1 = e0 + 1, e2 = e1 + 1;
    const e01 = e2 + 1, e20 = e01 + 1, e12 = e20 + 1;
    const e012 = e12 + 1;
    const TABLE = [
        [   1,	 e0,   e1,   e2,  e01,	e20,  e12, e012],
        [  e0,	  0,  e01, -e20,	0,	  0, e012,    0],
        [  e1, -e01,	1,	e12,  -e0, e012,   e2,  e20],
        [  e2,	e20, -e12,	  1, e012,	 e0,  -e1,  e01],
        [ e01,	  0,   e0, e012,	0,    0, -e20,    0],
        [ e20,	  0, e012,	-e0,	0,    0,  e01,    0],
        [ e12, e012,  -e2,   e1,  e20, -e01,   -1,  -e0],
        [e012,	  0,  e20,	e01,	0,	  0,  -e0,    0],
    ];
    return TABLE;
}

console.log(geometric([0, 10, 3, 1], [0, 2, 7, 1], R200));