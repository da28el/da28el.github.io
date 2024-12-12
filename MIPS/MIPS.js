// 32 x 32bit registers
const R = new Uint32Array(32);
const LO = new Uint32Array(1);
const HI = new Uint32Array(1);
const PC = new Uint32Array(1);
const MEM = new Uint32Array(1024); // 1KB

function signExtend8(value) {
    return (value & 0x80) ? (value | 0xffffff00) : (value & 0xff);
}

function zeroExtend8(value) {
    return value & 0xff;
}

function signExtend16(value) {
    return (value & 0x8000) ? (value | 0xffff0000) : value;
}

function zeroExtend16(value) {
    return value & 0x0000ffff;
}

function toSigned32(value) {
    return (value & 0x80000000) ? value | ~0xffffffff : value;
}

function overflow32(a, b, c) {
    if ((a > 0 && b > 0 && c < 0) || (a < 0 && b < 0 && c > 0))
        throw new Error("Arithmetic Overflow.")
}

const ENCODING = {
    opcode: 63 << 26,
    rs: 31 << 21,
    rt: 31 << 16,
    rd: 31 << 11,
    shamt: 31 << 6,
    funct: 63,
    immediate: 65535,
    address: 67108863
}

const addWithOverlow = (a, b) => {
    const c = a + b;
    if (((a ^ b) >= 0) && ((a ^ c) < 0))
        throw new Error("Arithmetic Overflow.");
    return c; 
}

const subWithOverflow = (a, b) => addWithOverlow(a, -b);

const div = (a, b) => {
    if(b === 0)
        throw new Error("Division by 0.")
    LO[0] = Math.floor(a / b); 
    HI[0] = a % b;
}


const mult = (r64) => {
    LO[0] = Number(r64 & 0xffffffffn);
    HI[0] = Number((r64 >> 32n) & 0xffffffffn)
}

const load = (address, size, signed) => {
    const alignedAddress = address >>> 2;
    const offset = (address % 4) * 8;
    const mask = (1 << (size * 8)) - 1;
    let value = (MEM[alignedAddress] >> offset) & mask;
    if (signed && (value & (1 << ((size*8) - 1)))) {
        value |= ~mask;
    }
    return value;
}

const store = (address, value, size) => {
    const alignedAddress = address >>> 2;
    const offset = (address % 4) * 8;
    const mask = (1 << (size * 8)) - 1;
    MEM[alignedAddress] = (MEM[alignedAddress] & ~(mask << offset)) | ((value & mask) << offset);
}

const INSTRUCTION = {
    nop:    {type: "R", opcode: 0,          funct: 0,           handler: (rs, rt, rd, shamt) => null},
    add:    {type: "R", opcode: 0,          funct: 0b100000,    handler: (rs, rt, rd, shamt) => R[rd] = addWithOverlow(R[rs], R[rt])},
    addu:   {type: "R", opcode: 0,          funct: 0b100001,    handler: (rs, rt, rd, shamt) => R[rd] = (R[rs] + R[rt]) >>> 0},
    addi:   {type: "I", opcode: 0b001000,   funct: 0,           handler: (rs, rt, i)         => R[rt] = addWithOverlow(R[rs], signExtend16(i))},
    addiu:  {type: "I", opcode: 0b001001,   funct: 0,           handler: (rs, rt, i)         => R[rt] = (R[rs] + signExtend16(i)) >>> 0},
    and:    {type: "R", opcode: 0,          funct: 0b100100,    handler: (rs, rt, rd, shamt) => R[rd] = R[rs] & R[rt]},
    andi:   {type: "I", opcode: 0b001100,   funct: 0,           handler: (rs, rt, i)         => R[rt] = R[rs] & zeroExtend16(i)},
    div:    {type: "R", opcode: 0,          funct: 0b011010,    handler: (rs, rt, rd, shamt) => div(toSigned32(R[rs]), toSigned32(R[rt]))},
    divu:   {type: "R", opcode: 0,          funct: 0b011011,    handler: (rs, rt, rd, shamt) => div(R[rs], R[rt])},
    mult:   {type: "R", opcode: 0,          funct: 0b011000,    handler: (rs, rt, rd, shamt) => mult(BigInt(toSigned32(R[rs]) * toSigned32(R[rt])))},
    multu:  {type: "R", opcode: 0,          funct: 0b011001,    handler: (rs, rt, rd, shamt) => mult(BigInt(R[rs]) * BigInt(R[rt]))},
    nor:    {type: "R", opcode: 0,          funct: 0b100111,    handler: (rs, rt, rd, shamt) => R[rd] = ~(R[rs] | R[rt])},
    or:     {type: "R", opcode: 0,          funct: 0b100101,    handler: (rs, rt, rd, shamt) => R[rd] = R[rs] | R[rt]},
    ori:    {type: "I", opcode: 0b001101,   funct: 0,           handler: (rs, rt, i)         => R[rt] = R[rs] | zeroExtend16(i)},
    sll:    {type: "R", opcode: 0,          funct: 0b000000,    handler: (rs, rt, rd, shamt) => R[rd] = R[rt] << shamt},
    sllv:   {type: "R", opcode: 0,          funct: 0b000100,    handler: (rs, rt, rd, shamt) => R[rd] = R[rt] << (R[rs] & 0x1f)},
    sra:    {type: "R", opcode: 0,          funct: 0b000011,    handler: (rs, rt, rd, shamt) => R[rd] = R[rt] >> shamt},
    srav:   {type: "R", opcode: 0,          funct: 0b000111,    handler: (rs, rt, rd, shamt) => R[rd] = R[rt] >> (R[rs] & 0x1f)},
    srl:    {type: "R", opcode: 0,          funct: 0b000010,    handler: (rs, rt, rd, shamt) => R[rd] = R[rt] >>> shamt},
    srlv:   {type: "R", opcode: 0,          funct: 0b000110,    handler: (rs, rt, rd, shamt) => R[rd] = R[rt] >>> (R[rs] & 0x1f)},
    sub:    {type: "R", opcode: 0,          funct: 0b100010,    handler: (rs, rt, rd, shamt) => R[rd] = subWithOverlow(R[rs], R[rt])},
    subu:   {type: "R", opcode: 0,          funct: 0b100011,    handler: (rs, rt, rd, shamt) => R[rd] = (R[rs] - R[rt]) >>> 0},
    xor:    {type: "R", opcode: 0,          funct: 0b100110,    handler: (rs, rt, rd, shamt) => R[rd] = R[rs] ^ R[rt]},
    xori:   {type: "I", opcode: 0b001110,   funct: 0,           handler: (rs, rt, i)         => R[rt] = R[rs] ^ zeroExtend16(i)},
    lhi:    {type: "I", opcode: 0b011001,   funct: 0,           handler: (rs, rt, i)         => R[rt] = (signExtend16(i) << 16) & 0xffff0000},
    llo:    {type: "I", opcode: 0b011000,   funct: 0,           handler: (rs, rt, i)         => R[rt] = (R[rt] & 0xffff0000) | signExtend16(i) & 0xffff},
    slt:    {type: "R", opcode: 0,          funct: 0b101010,    handler: (rs, rt, rd, shamt) => R[rd] = R[rs] < R[rt]},
    sltu:   {type: "R", opcode: 0,          funct: 0b101001,    handler: (rs, rt, rd, shamt) => R[rd] = (R[rs] < R[rt]) >>> 0},
    slti:   {type: "I", opcode: 0b001010,   funct: 0,           handler: (rs, rt, i)         => R[rt] = (R[rs] < signExtend16(i))},
    sltiu:  {type: "I", opcode: 0b001001,   funct: 0,           handler: (rs, rt, i)         => R[rt] = (R[rs] < signExtend16(i)) >>> 0},
    beq:    {type: "I", opcode: 0b000100,   funct: 0,           handler: (rs, rt, i)         => (R[rs] === R[rt] ? PC[0] = PC[0] + (signExtend16(i) << 2) : null)},
    bgtz:   {type: "I", opcode: 0b000111,   funct: 0,           handler: (rs, rt, i)         => (R[rs] > 0 ? PC[0] = PC[0] + (signExtend16(i) << 2) : null)},
    blez:   {type: "I", opcode: 0b000110,   funct: 0,           handler: (rs, rt, i)         => (R[rs] <= 0 ? PC[0] = PC[0] + (signExtend16(i) << 2) : null)},
    bne:    {type: "I", opcode: 0b000101,   funct: 0,           handler: (rs, rt, i)         => (R[rs] !== R[rt] ? PC[0] = PC[0] + (signExtend16(i) << 2) : null)},
    j:      {type: "J", opcode: 0b000010,   funct: 0,           handler: (address)           => PC[0] += (address << 2)},
    jal:    {type: "J", opcode: 0b000011,   funct: 0,           handler: (address)           => {R[31] = PC[0] + 8; PC[0] = PC[0] + (signExtend16(i) << 2)}},
    jalr:   {type: "R", opcode: 0,          funct: 0b001001,    handler: (rs, rt, rd, shamt) => {R[31] = PC[0] + 8; PC[0] = R[rs]}},
    jr:     {type: "R", opcode: 0,          funct: 0b001000,    handler: (rs, rt, rd, shamt) => PC[0] = R[rs]},
    lb:     {type: "I", opcode: 0b100000,   funct: 0,           handler: (rs, rt, i)         => R[rt] = load(R[rs] + signExtend16(i), 1, true)},
    lbu:    {type: "I", opcode: 0b100100,   funct: 0,           handler: (rs, rt, i)         => R[rt] = load(R[rs] + signExtend16(i), 1, false)},
    lh:     {type: "I", opcode: 0b100001,   funct: 0,           handler: (rs, rt, i)         => R[rt] = load(R[rs] + signExtend16(i), 2, true)},
    lhu:    {type: "I", opcode: 0b100101,   funct: 0,           handler: (rs, rt, i)         => R[rt] = load(R[rs] + signExtend16(i), 2, false)},
    lw:     {type: "I", opcode: 0b100011,   funct: 0,           handler: (rs, rt, i)         => R[rt] = R[rt] = load(R[rs] + signExtend16(i), 4, false)},
    sb:     {type: "I", opcode: 0b101000,   funct: 0,           handler: (rs, rt, i)         => store(R[rs] + signExtend16(i), R[rt], 1)},
    sh:     {type: "I", opcode: 0b101001,   funct: 0,           handler: (rs, rt, i)         => store(R[rs] + signExtend16(i), R[rt], 2)},
    sw:     {type: "I", opcode: 0b101011,   funct: 0,           handler: (rs, rt, i)         => store(R[rs] + signExtend16(i), R[rt], 4)},
    mfhi:   {type: "R", opcode: 0,          funct: 0b010000,    handler: (rs, rt, rd, shamt) => R[rd] = HI[0]},
    mflo:   {type: "R", opcode: 0,          funct: 0b010010,    handler: (rs, rt, rd, shamt) => R[rd] = LO[0]},
    mthi:   {type: "R", opcode: 0,          funct: 0b010001,    handler: (rs, rt, rd, shamt) => HI[0] = R[rs]},
    mtlo:   {type: "R", opcode: 0,          funct: 0b010011,    handler: (rs, rt, rd, shamt) => LO[0] = R[rs]},
    trap:   {type: "J", opcode: 0b011010,   funct: 0,           handler: (address) => console.log("ITS A TRAP!", address)},
}

const REGISTER_MAP = {
    "$zero": 0, 
    "$at": 1,
    "$v0": 2, "$v1": 3,
    "$a0": 4, "$a1": 5, "$a2": 6, "$a3": 7,
    "$t0": 8, "$t1": 9, "$t2": 10, "$t3": 11, "$t4": 12, "$t5": 13, "$t6": 14, "$t7": 15,
    "$s0": 16, "$s1": 17, "$s2": 18, "$s3": 19, "$s4": 20, "$s5": 21, "$s6": 22, "$s7": 23,
    "$t8": 24, "$t9": 25,
    "$k0": 26, "$k1": 27,
    "$gp": 28, "$sp": 29, "$fp": 30, "$ra": 31
}

function registerMap(register) {
    if (REGISTER_MAP[register]) { // named register
        return REGISTER_MAP[register];
    }
    else if (/^\$\d+$/.test(register)) { // numerical indexing
        const index = parseInt(register.replace("$", ''), 10);
        if (index < 0 || index > 31) {
            return index;
        }
    }
    throw new Error("Invalid registry: " + index);
}

function demoa(instructions) {
    const lines = instructions
        .split("\n")
        .map(line => line.trim())
        .filter(line => line);

    const machineCode = [];

    lines.forEach(line => {
        const [mnemonic, ...args] = line.replaceAll(",", " ").split(/\s+/);
        console.log(mnemonic, args);
    });
}

demoa("addi $t0 $zero 10")
demoa("sw	$ra, 0($sp)")

function assembler(instructions) {
    const lines = instructions
        .split("\n")
        .map(line => line.trim())
        .filter(line => line);

    const machineCode = [];

    lines.forEach(line => {
        const [mnemonic, ...args] = line.replaceAll(",", " ").split(/\s+/);

        const instruction = INSTRUCTION[mnemonic];

        if (instruction) {
            if (instruction.type === "R") { // R-type
                const [rd, rs, rt] = args.map(registerMap);
                const funct = FUNCT[mnemonic];
                const instruction = (opcode << 26) | (rs << 21) | (rt << 16) | (rd << 11) | (0 << 6) | funct;
                machineCode.push(instruction);
            } else if (mnemonic.endsWith("i") || mnemonic.endsWith("iu")) { // i-type
                const [rt, rs, immediate] = args;
                const instruction = (opcode << 26) | (registerMap(rs) << 21) | (registerMap(rt) << 16) | (signExtend16(parseInt(immediate)) & ENCODING.immediate);
                machineCode.push(instruction);
            } else if (mnemonic === "j" || mnemonic == "jal") { // j-type
                const address = parseInt(args[0]);
                const instruction = (opcode << 26) | (address & ENCODING.address);
                machineCode.push(instruction);
            } else {
                throw new Error("Unsupported instruction: " + mnemonic);
            }
        } else {
            throw new Error("Unknown opcode: " + mnemonic);
        }
    });

    return machineCode;

}

function ALU(instruction) {
    const opcode = (ENCODING.opcode & instruction) >> 26;
    const rs = (ENCODING.rs & instruction) >> 21;
    const rt = (ENCODING.rt & instruction) >> 16;
    const rd = (ENCODING.rd & instruction) >> 11;
    const shamt = (ENCODING.shamt & instruction) >> 6;
    const funct = (ENCODING.funct & instruction);
    const immediate = (ENCODING.immediate & instruction);
    const address = (ENCODING.address & instruction);

    const mnemonic = Object.values(INSTRUCTION).find(i => (i.opcode === opcode && opcode !== 0) || (i.opcode === 0 && i.funct === funct));

    if (!mnemonic) throw new Error("Unknown instruction with opcode: " + opcode);

    if (mnemonic.type === "R") { // R-encoding
        mnemonic.handler(rs, rt, rd, shamt);
    } else 
    if (mnemonic.type === "I") { // I-encoding
        mnemonic.handler(rs, rt, immediate);
    } else
    if (mnemonic.type === "J") { // J-encoding
        mnemonic.handler(address);
    }
}


function printBits(v, width = 32) {
    let str = [];
    for (let i = width - 1; i >= 0; i--) {
        str.push((v & (1 << i)) ? 1 : 0);
    }
    console.log(str.join(" "));
}

R[0] = 1;
R[1] = 1;

// ALU((INSTRUCTION.add.opcode << 26) | (0 << 21) | (1 << 16) | (2 << 11) | (0 << 6) | INSTRUCTION.add.funct);

// printBits((INSTRUCTION.add.opcode << 26) | (0 << 21) | (1 << 16) | (2 << 11) | (0 << 6) | INSTRUCTION.add.funct);

// ALU(0b00000000000000010001000000100000)
// console.log(R[0], R[1], R[2]);

// const instructionString = `
//     addi $3, $2, -10
//     add $0, $3, $3
// `;
// // j 1024

// const machineCode = assembler(instructionString);
// console.log("Machine Code:");
// machineCode.forEach(code => {printBits(code); ALU(code)});

printBits(R[0])
console.log(R[0])
printBits(R[1])
console.log(R[1])
printBits(R[2])
console.log(R[2])
printBits(R[3])
console.log(R[3])
printBits(R[4])
console.log(R[4])


console.log()
printBits(0x90880000)
printBits(0x90080004)