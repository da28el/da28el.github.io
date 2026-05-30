// neat.js

let innov = 1;
let nPopulation = 150;
let c1 = 1.0, 
    c2 = 1.0, 
    c3 = 0.4;
let compatabilityThreshold = 3.0;
let stagnationLimit = 15;
let championSpeciesLimit = 5;
let pMutateWeight = 0.8;
let pMutateWeightRandom = 0.1;
let pInheritDisabled = 0.75;
let interSpeciesMatingRate = 0.001;
let pMutateConnection = 0.05;
let pMutateNode = nPopulation < 500 ? 0.03 : 0.3;

let activation = (x) => Math.tanh(x); //Math.max(0, x); //1 / (1 + Math.exp(-4.9*x));
let outputActivation = (x) => Math.tanh(x); //1 / (1 + Math.exp(-4.9*x));
const rand = () => 2 * Math.random() - 1;
const randInt = (x) => Math.floor(x * Math.random());

const NODE_TYPE = {
   SENSOR: "sensor",
   HIDDEN: "hidden",
   OUTPUT: "output",
};

const NodeGene = (node, type) => ({
    node: node, type: type
})

const ConnectionGene = (input, output, weight, enabled, innov) => ({
    input: input, output: output, weight: weight, enabled: enabled, innov: innov
})

const Genome = (nInput, nOutput) => {
    let nodeGenes = [];
    for (let i = 0; i < nInput + nOutput; i++) {
        nodeGenes.push(NodeGene(i + 1, i < nInput ? NODE_TYPE.SENSOR : NODE_TYPE.OUTPUT));
    }
    let localInnov = 1;
    let connectionGenes = [];
    for (let i = 0; i < nInput + nOutput; i++) {
        let node1 = nodeGenes[i];
        if (node1.type == NODE_TYPE.OUTPUT) {
            for (let j = 0; j < nInput + nOutput; j++) {
                let node2 = nodeGenes[j];
                if (node2.type == NODE_TYPE.SENSOR) {
                    connectionGenes.push(
                        ConnectionGene(node2.node, node1.node, rand(), true, localInnov++)
                    );
                }
            }
        }
    }

    return {
        nodeGenes: nodeGenes, connectionGenes: connectionGenes
    }
}

const clone = (genome) => {
    return {
        nodeGenes: genome.nodeGenes.map((v) => NodeGene(v.node, v.type)),
        connectionGenes: genome.connectionGenes.map((v) => ConnectionGene(v.input, v.output, v.weight, v.enabled, v.innov))
    }
}

const mutateAddConnection = (genome) => {
    const nNodes = genome.nodeGenes.length;
    let inputs = [];
    let outputs = [];
    for (let i = 0; i < genome.nodeGenes.length; i++) {
        let node = genome.nodeGenes[i];
        if (node.type === NODE_TYPE.SENSOR) inputs.push(node.node);
        if (node.type === NODE_TYPE.OUTPUT) outputs.push(node.node);
    }

    let possibleConnections = [];

    for (let n1 of genome.nodeGenes) {
        if (inputs.includes(n1.node)) continue;
        for (let n2 of genome.nodeGenes) {
            if (n1 === n2) continue;
            let exists = false;
            for (let connection of genome.connectionGenes) {
                if (connection.input === n2.node && connection.output === n1.node) exists = true; 
            }
            if (exists) continue;
            let connection = ConnectionGene(n2.node, n1.node, rand(), true, innov + 1);
            possibleConnections.push(connection);
        }
    }

    if (!possibleConnections.length) return genome;
    
    innov++;
    genome.connectionGenes.push(
        possibleConnections[
            randInt(possibleConnections.length)
        ]
    );

    return genome;
}

const mutateAddNode = (genome) => {
    const node = genome.nodeGenes.length + 1;
    let gene = NodeGene(node, NODE_TYPE.HIDDEN);
    genome.nodeGenes.push(gene);
    let nConnections = genome.connectionGenes.length;
    let connection = null;
    do {
        connection = genome.connectionGenes[randInt(nConnections)];
    } while (!connection.enabled);

    let connection1 = ConnectionGene(connection.input, node, rand(), true, innov + 1);
    let connection2 = ConnectionGene(node, connection.output, rand(), true, innov + 2);

    connection.enabled = false;

    genome.connectionGenes.push(connection1, connection2);
    innov += 2;

    return genome;
}

const mutation = (genome) => {
    if (Math.random() < pMutateWeight) {
        for (cg of genome.connectionGenes){
            if (Math.random() < pMutateWeightRandom) {
                cg.weight = rand();
            } else {
                cg.weight += rand() / 10;
            }
        }
    }
    if (Math.random() < pMutateNode) {
        mutateAddNode(genome);
    } else
    if (Math.random() < pMutateConnection + pMutateNode) {
        mutateAddConnection(genome);
    }
}

const crossover = (g1, g2) => {
    let offspring = Genome(0, 0);
    
    const parentNodes = g1.nodeGenes.length > g2.nodeGenes.length ? g1.nodeGenes : g2.nodeGenes;
    offspring.nodeGenes = parentNodes.map((ng, i) => NodeGene(i + 1, ng.type));


    const nConnections1 = g1.connectionGenes.length;
    const nConnections2 = g2.connectionGenes.length;

    const geneMap = new Map();
    g1.connectionGenes.forEach(cg => geneMap.set(cg.innov, [cg, null]));
    g2.connectionGenes.forEach(cg => geneMap.has(cg.innov) ? 
        geneMap.get(cg.innov)[1] = cg :
        geneMap.set(cg.innov, [null, cg])
    );
    
    const sortedInnovs = Array.from(geneMap.keys()).sort((a, b) => a - b);

    for (let innov of sortedInnovs) {
        const [gene1, gene2] = geneMap.get(innov);
        let selected;

        if (gene1 && gene2) {
            if (gene1.enabled && !gene2.enabled)
                selected = Math.random() > pInheritDisabled ? gene1 : gene2
            else if (!gene1.enabled && gene2.enabled)
                selected = Math.random() < pInheritDisabled ? gene1 : gene2
            else
                selected = Math.random() < 0.5 ? gene1 : gene2;

        } else {
            selected = gene1 || gene2;
        }

        offspring.connectionGenes.push(
            ConnectionGene(selected.input, selected.output, selected.weight, selected.enabled, selected.innov)
        );
    }

    return offspring;
}

const distance = (g1, g2) => {
    
    const geneMap = new Map();
    g1.connectionGenes.forEach(cg => geneMap.set(cg.innov, [cg, null]));
    g2.connectionGenes.forEach(cg => geneMap.has(cg.innov) ? 
        geneMap.get(cg.innov)[1] = cg :
        geneMap.set(cg.innov, [null, cg])
    );

    const sortedInnovs = Array.from(geneMap.keys()).sort((a, b) => a - b);

    const maxInnov1 = g1.connectionGenes.reduce((p, c) => p = Math.max(p || 0, c.innov));
    const maxInnov2 = g2.connectionGenes.reduce((p, c) => p = Math.max(p || 0, c.innov));

    let E = 0, D = 0, W = 0, N = 1;
    let Wn = 0;

    for (let innov of sortedInnovs) {
        let [gene1, gene2] = geneMap.get(innov);
        if (gene1 && gene2) {
            W += Math.abs(gene1.weight - gene2.weight);
            Wn++;
        } else {
            if (gene1) innov > maxInnov2 ? E++ : D++;
            else 
            if (gene2) innov > maxInnov1 ? E++ : D++;            
        }
    }
    if (Wn > 0) W /= Wn;

    const nGenes1 = g1.connectionGenes.length;
    const nGenes2 = g2.connectionGenes.length;
    const maxNGenes = Math.max(nGenes1, nGenes2);

    // N can be set to 1 if both genomes are small, i.e., consists of fewer than 20 genes.
    N = (nGenes1 < 20 && nGenes2 < 20) ? 1 : maxNGenes;

    return (c1*E + c2*D)/N + c3*W;
}

const sh = (g1, g2) => distance(g1, g2) < compatabilityThreshold ? 1 : 0;

const adjustedFitness = (fi, genome, population) => {
    let denom = 1;
    for (let j = 0; j < population.length; j++) {
        if (genome === population[j]) continue;
        denom += sh(genome, population[j]);
    }
    return fi / denom;
}

const printGenome = (g) => {
    console.log("Genome (Genotype)");
    let line1 = "Node\t|";
    let line2 = "Genes\t|";
    for (let ng of g.nodeGenes) {
        line1 += "Node " + ng.node + "\t|";
        line2 += ng.type + "\t|";
    }
    console.log(line1);
    console.log(line2);
    console.log();
    line1 = "Connect.|";
    line2 = "Genes\t|";
    line3 = "\t|";
    line4 = "\t|";
    line5 = "\t|";

    for (let cg of g.connectionGenes) {
        line1 += "In " + cg.input + "       |";
        line2 += "Out " + cg.output + "      |";
        line3 += "Weight" + (cg.weight > 0 ? " " : "") + cg.weight.toFixed(1) + " |";
        line4 += (cg.enabled ? "Enabled " : "DISABLED") + "   |";
        line5 += "Innov " + cg.innov + "    |";
    }
    console.log(line1);
    console.log(line2);
    console.log(line3);
    console.log(line4);
    console.log(line5);

}

const Neuron = () => ({
    value: 0, nextValue: 0, weights: [], inputs: []
});

const incubate = (genome) => {
    let inputs = [];
    let outputs = [];
    let neurons = [];
    for (let ng of genome.nodeGenes) {
        let n = Neuron();
        neurons.push(n);
        if (ng.type === NODE_TYPE.SENSOR) inputs.push(n)
        if (ng.type === NODE_TYPE.OUTPUT) outputs.push(n); 
    }
        
    for (let cg of genome.connectionGenes) {
        if (!cg.enabled) continue;
        let n_out = neurons[cg.output - 1];
        let n_in = neurons[cg.input - 1];
        n_out.inputs.push(n_in);
        n_out.weights.push(cg.weight);
    }

    return {
        inputs: inputs,
        outputs: outputs,
        neurons: neurons
    };
}

const forward = (network, inputs) => {
    
    network.inputs.map((v, i) => v.value = inputs[i]);

    for (let neuron of network.neurons) {
        let sum = 0;
        for (let i = 0; i < neuron.inputs.length; i++) {
            sum += neuron.inputs[i].value * neuron.weights[i];
        }

        neuron.nextValue = network.outputs.includes(neuron) ? outputActivation(sum) : activation(sum);
    }

    for (let neuron of network.neurons) {
        if (network.inputs.includes(neuron)) continue;
        neuron.value = neuron.nextValue;
    }
    return network.outputs.map(out => out.value);
}

const speciatePopulation = (specimens, speciesList, nextSpeciesId) => {

    // reset members
    for (let s of speciesList) {
        s.members = [];
    }

    // speciate
    for (let specimen of specimens) {
        let assigned = false;

        for (let s of speciesList) {
            if (distance(specimen.genome, s.representative) < compatabilityThreshold) {
                s.members.push(specimen);
                assigned = true;
                break;
            }
        }

        // new species
        if (!assigned) {
            speciesList.push({
                id: nextSpeciesId++,
                representative: clone(specimen.genome),
                members: [specimen],
                age: 0,
                bestFitness: 0,
                stagnationCounter: 0
            });
        }

    }

    // clear extinct species
    speciesList = speciesList.filter((v) => v.members.length > 0);

    for (let s of speciesList) {
        let speciesBest = 0;

        for (let specimen of s.members) {
            specimen.adjustedFitness = specimen.fitness / s.members.length;
            speciesBest = Math.max(specimen.fitness, speciesBest);
        }

        if (speciesBest > s.bestFitness) {
            s.bestFitness = speciesBest;
            s.stagnationCounter = 0;
        } else {
            s.stagnationCounter++;
        }
        s.age++;
    }

    // kill stagnant species unless only species
    if (speciesList.length > 1) {
        speciesList = speciesList.filter((v) => v.stagnationCounter < stagnationLimit);
    }

    return [speciesList, nextSpeciesId];
}

const reproducePopulation = (speciesList) => {
    let totalAdjustedFitness = 0;
    for (let s of speciesList) {
        for (let specimen of s.members) {
            totalAdjustedFitness += specimen.adjustedFitness;
        }
    }

    let nextGeneration = [];
    for (let s of speciesList) {
        // allowed number of offspring based on performance
        let speciesAdjustedFitness = s.members.reduce((sum, m) => sum + m.adjustedFitness, 0);
        let offspringCount = Math.floor(nPopulation * speciesAdjustedFitness / totalAdjustedFitness)
        
        // extinction
        if (offspringCount === 0) continue;
            
        s.members.sort((a, b) => b.fitness - a.fitness);

        // elitism: champion of larger species passes down unchanged
        if (s.members.length >= championSpeciesLimit) {
            nextGeneration.push(clone(s.members[0].genome))
            offspringCount--;
        }

        // top half gets to reproduce
        const poolSize = Math.max(1, Math.ceil(s.members.length * 0.5));
        const breedingPool = s.members.slice(0, poolSize);

        // sexytime
        for (let i = 0; i < offspringCount; i++) {
            let child;

            if (breedingPool.length > 1 && Math.random() > 0.25) {
                // sexual reproduction
                let p1 = breedingPool[randInt(breedingPool.length)].genome;
                let p2 = breedingPool[randInt(breedingPool.length)].genome;
                child = crossover(p1, p2);
            } else {
                // asexual reproduction
                child = clone(breedingPool[randInt(breedingPool.length)].genome);
            }

            mutation(child);
            nextGeneration.push(child);
        }
    }

    while (nextGeneration.length < nPopulation) {
        nextGeneration.push(clone(speciesList[0].members[0].genome));
    }

    return nextGeneration.slice(0, nPopulation);
}

const simulate = (nSensors, nOutputs, taskCallback, generations = 1000) => {
    let population = Array(nPopulation).fill(null).map(() => Genome(nSensors, nOutputs));
    innov = nSensors * nOutputs;

    let speciesList = [];
    let nextSpeciesId = 1;

    for (let gen = 0; gen < generations; gen++) {
        // forward
        
        const specimens = population.map(genome => {
            const network = incubate(genome);
            const cost = taskCallback(network);
            const fitness = 1 / (cost + 1);
            return {genome, fitness, adjustedFitness: fitness};
        });
        
        specimens.sort((a, b) => b.fitness - a.fitness);

        const lowestCost = 1 / (specimens[0].fitness) - 1;
        if (gen % (generations / 10) === 0){
            console.log("Generation:", gen, "| best cost:", lowestCost, "| #species:", speciesList.length);
        } 

        if (lowestCost < 0.001) {
            console.log("solution found at generation:", gen);
            population = specimens.map(s => s.genome);
            break;
        }

        [speciesList, nextSpeciesId] = speciatePopulation(specimens, speciesList, nextSpeciesId);
        population = reproducePopulation(speciesList);
    }

    // console.log("best genome:") 
    // printGenome(population[0])
    console.log("evaluation:", taskCallback(incubate(population[0]), true));
    return population[0];
}
