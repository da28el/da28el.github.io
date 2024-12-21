const I = a => a;

console.log('I a:', I('a'));

const K = a => b => a;

console.log('K a b:', K('a')('b'));

const KI = K(I); // : a => b => b

console.log('KI a b:', KI('a')('b'));

const C = f => a => b => f(b)(a);

console.log('C K a b:', C(K)('a')('b'));
console.log('C KI a b:', C(KI)('a')('b'));

const M = a => a(a);

console.log('M I a:', M(I)('a'));

const TRUE = K;
const FALSE = KI;

const NOT = C;

console.log('NOT TRUE:', NOT(TRUE)('true')('false'));
console.log('NOT FALSE:', NOT(FALSE)('true')('false'));

const IF = I; // IF (expr) (then) (else)

console.log('IF TRUE:', IF(TRUE)('true')('false'));
console.log('IF (NOT FALSE):', IF(NOT(FALSE))('true')('false'));

const OR = M;

console.log('IF ( (NOT TRUE) OR (TRUE) ):', IF( OR( NOT(TRUE) )( TRUE ))('true')('false'));
console.log('IF ( FALSE OR (NOT TRUE) ):', IF( OR( FALSE )( NOT(TRUE) ) )('true')('false'));

const AND = p => q => p(q)(p);

console.log('IF ( (NOT FALSE) AND TRUE ):', IF( AND( NOT(FALSE) )(TRUE))('true')('false'));
console.log('IF ( FALSE AND TRUE ):', IF( AND( FALSE )( TRUE ) )('true')('false'));

console.log('IF ( TRUE AND (NOT FALSE) AND TRUE ):', IF( AND( AND( TRUE )( NOT(FALSE) ))(TRUE) )('true')('false'));

const EQ = p => q => p(q)(NOT(q));

console.log('TRUE EQ FALSE:', EQ(TRUE)(FALSE)('true')('false'));
console.log('TRUE EQ TRUE:', EQ(TRUE)(TRUE)('true')('false'));
console.log('FALSE EQ FALSE:', EQ(FALSE)(FALSE)('true')('false'));

const B = f => g => a => f(g(a));

console.log('B (++) (*2) 5:', B(x=>x+1)(x=>2*x)(5));

const TH = a => f => f(a);

console.log('TH 5 (*2):', TH(5)(x=>2*x));

const V = a => b => f => f(a)(b);
const FST = a => a(K);
const SND = a => a(KI);

console.log('V 2 5', V(2)(5));
console.log('FST (V 2 5)', FST(V(2)(5)));
console.log('SND (V 2 5)', SND(V(2)(5)));

const N0 = f => a => a;
const N1 = f => a => f(a);
const N2 = f => a => f(f(a));

const SUCC = n => f => f(n(f))

// console.log('\x1b[36m%s\x1b[0m', 'I am cyan');
// console.log('\x1b[33m%s\x1b[0m', 'I am yellow');

// for (var i in this) {
//     if((typeof this[i]).toString() == "function"&&this[i].toString().indexOf("native")==-1)
//         console.log(this[i].name)
// }


