/**
 * Improved Evolutionary Algorithm Implementation
 * 
 * This demonstrates proper genetic algorithm principles:
 * - Safe expression evaluation (no eval)
 * - Proper chromosome encoding
 * - Crossover and mutation operators
 * - Fitness-based selection
 * - Population management with elitism
 */

// Safe expression evaluator - using expr-eval library
// Note: expr-eval is a CommonJS module, so we use require
// @ts-ignore - expr-eval doesn't have TypeScript definitions
const { Parser } = require('expr-eval');

// ============================================================================
// Types & Configuration
// ============================================================================

interface Agent {
  chromosome: string;  // Encoded equation string
  fitness: number;     // Fitness score (higher = better)
  solution: number;    // Evaluated result
  equation: string;    // Human-readable equation
}

interface Config {
  populationSize: number;
  target: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  tournamentSize: number;
  maxEquationLength: number;
}

const DEFAULT_CONFIG: Config = {
  populationSize: 50,
  target: 42,
  maxGenerations: 1000,
  mutationRate: 0.1,
  crossoverRate: 0.7,
  elitismCount: 5,  // Keep top 5 agents each generation
  tournamentSize: 3,
  maxEquationLength: 20
};

// ============================================================================
// Safe Expression Evaluator
// ============================================================================

class SafeEvaluator {
  private parser: any; // expr-eval Parser instance

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Safely evaluates a mathematical expression
   * Returns null if expression is invalid
   */
  evaluate(expression: string): number | null {
    try {
      // Clean and validate expression
      const cleaned = this.cleanExpression(expression);
      if (!this.isValidExpression(cleaned)) {
        return null;
      }

      // Parse and evaluate
      const expr = this.parser.parse(cleaned);
      const result = expr.evaluate({});

      // Check for valid number result
      if (typeof result !== 'number' || !isFinite(result)) {
        return null;
      }

      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cleans expression string (removes invalid characters, fixes syntax)
   */
  private cleanExpression(expr: string): string {
    // Remove invalid characters, keep only valid math operators and digits
    return expr
      .replace(/[^0-9+\-*/().\s]/g, '')
      .replace(/\s+/g, '')
      .trim();
  }

  /**
   * Basic validation: checks parentheses balance and operator placement
   */
  private isValidExpression(expr: string): boolean {
    if (!expr || expr.length === 0) return false;

    // Check parentheses balance
    let balance = 0;
    for (const char of expr) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) return false;
    }
    if (balance !== 0) return false;

    // Check for consecutive operators (basic check)
    if (/[+\-*/]{2,}/.test(expr)) return false;

    return true;
  }
}

// ============================================================================
// Genetic Algorithm Implementation
// ============================================================================

class GeneticAlgorithm {
  private config: Config;
  private population: Agent[];
  private evaluator: SafeEvaluator;
  private generation: number;
  private bestFitnessHistory: number[];

  constructor(config: Partial<Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.evaluator = new SafeEvaluator();
    this.population = [];
    this.generation = 0;
    this.bestFitnessHistory = [];
  }

  /**
   * Main evolution loop
   */
  evolve(): Agent | null {
    this.initializePopulation();
    this.evaluateFitness();

    for (this.generation = 0; this.generation < this.config.maxGenerations; this.generation++) {
      // Check for convergence
      const best = this.getBestAgent();
      if (best && best.fitness >= 0.99) {
        console.log(`\n✅ Solution found at generation ${this.generation}!`);
        return best;
      }

      // Create new generation
      const newPopulation: Agent[] = [];

      // Elitism: Keep best agents
      const elite = this.selectElite();
      newPopulation.push(...elite);

      // Generate offspring
      while (newPopulation.length < this.config.populationSize) {
        const parent1 = this.tournamentSelection();
        const parent2 = this.tournamentSelection();

        let offspring: Agent;
        if (Math.random() < this.config.crossoverRate) {
          offspring = this.crossover(parent1, parent2);
        } else {
          // Clone parent if no crossover
          offspring = this.cloneAgent(parent1);
        }

        // Mutate offspring
        if (Math.random() < this.config.mutationRate) {
          this.mutate(offspring);
        }

        newPopulation.push(offspring);
      }

      this.population = newPopulation;
      this.evaluateFitness();

      // Log progress
      if (this.generation % 10 === 0) {
        this.logProgress();
      }
    }

    return this.getBestAgent();
  }

  /**
   * Initialize random population
   */
  private initializePopulation(): void {
    this.population = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      this.population.push(this.createRandomAgent());
    }
  }

  /**
   * Create a random agent with valid equation
   */
  private createRandomAgent(): Agent {
    const chromosome = this.generateRandomEquation();
    return this.createAgentFromChromosome(chromosome);
  }

  /**
   * Generate random equation string
   */
  private generateRandomEquation(): string {
    const operators = ['+', '-', '*', '/'];
    const digits = '0123456789';
    const length = Math.floor(Math.random() * (this.config.maxEquationLength - 3)) + 3;

    let equation = '';
    let expectingOperator = false;

    for (let i = 0; i < length; i++) {
      if (expectingOperator && Math.random() > 0.3) {
        equation += operators[Math.floor(Math.random() * operators.length)];
        expectingOperator = false;
      } else {
        equation += digits[Math.floor(Math.random() * digits.length)];
        expectingOperator = true;
      }
    }

    // Ensure it ends with a digit
    if (expectingOperator) {
      equation += digits[Math.floor(Math.random() * digits.length)];
    }

    return equation;
  }

  /**
   * Create agent from chromosome and evaluate fitness
   */
  private createAgentFromChromosome(chromosome: string): Agent {
    const solution = this.evaluator.evaluate(chromosome) ?? 0;
    const fitness = this.calculateFitness(solution);
    
    return {
      chromosome,
      fitness,
      solution,
      equation: chromosome
    };
  }

  /**
   * Calculate fitness score (higher = better)
   * Fitness is inverse of error, normalized to 0-1
   */
  private calculateFitness(solution: number): number {
    const error = Math.abs(solution - this.config.target);
    
    // Avoid division by zero
    if (error === 0) return 1.0;
    
    // Inverse error with scaling
    return 1 / (1 + error);
  }

  /**
   * Evaluate fitness for all agents
   */
  private evaluateFitness(): void {
    for (const agent of this.population) {
      const solution = this.evaluator.evaluate(agent.chromosome) ?? 0;
      agent.solution = solution;
      agent.fitness = this.calculateFitness(solution);
    }

    // Sort by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);

    // Track best fitness
    const best = this.population[0];
    this.bestFitnessHistory.push(best.fitness);
  }

  /**
   * Tournament selection: pick best from random subset
   */
  private tournamentSelection(): Agent {
    const tournament: Agent[] = [];
    
    for (let i = 0; i < this.config.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }

    // Return best from tournament
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  /**
   * Select elite agents (top performers)
   */
  private selectElite(): Agent[] {
    return this.population
      .slice(0, this.config.elitismCount)
      .map(agent => this.cloneAgent(agent));
  }

  /**
   * Single-point crossover
   */
  private crossover(parent1: Agent, parent2: Agent): Agent {
    const point1 = Math.floor(Math.random() * parent1.chromosome.length);
    const point2 = Math.floor(Math.random() * parent2.chromosome.length);

    // Create two possible offspring
    const child1Chromosome = 
      parent1.chromosome.substring(0, point1) + 
      parent2.chromosome.substring(point2);
    
    const child2Chromosome = 
      parent2.chromosome.substring(0, point2) + 
      parent1.chromosome.substring(point1);

    // Return the better one
    const child1 = this.createAgentFromChromosome(child1Chromosome);
    const child2 = this.createAgentFromChromosome(child2Chromosome);

    return child1.fitness > child2.fitness ? child1 : child2;
  }

  /**
   * Mutate agent's chromosome
   */
  private mutate(agent: Agent): void {
    const chromosome = agent.chromosome.split('');
    const mutationType = Math.random();

    if (mutationType < 0.33) {
      // Replace random character
      const index = Math.floor(Math.random() * chromosome.length);
      const operators = ['+', '-', '*', '/'];
      const digits = '0123456789';
      const charSet = Math.random() > 0.5 ? operators : digits;
      chromosome[index] = charSet[Math.floor(Math.random() * charSet.length)];
    } else if (mutationType < 0.66) {
      // Insert random character
      const index = Math.floor(Math.random() * chromosome.length);
      const operators = ['+', '-', '*', '/'];
      const digits = '0123456789';
      const charSet = Math.random() > 0.5 ? operators : digits;
      chromosome.splice(index, 0, charSet[Math.floor(Math.random() * charSet.length)]);
    } else {
      // Delete random character (if length > 3)
      if (chromosome.length > 3) {
        const index = Math.floor(Math.random() * chromosome.length);
        chromosome.splice(index, 1);
      }
    }

    // Update agent
    const newChromosome = chromosome.join('');
    const solution = this.evaluator.evaluate(newChromosome) ?? 0;
    agent.chromosome = newChromosome;
    agent.equation = newChromosome;
    agent.solution = solution;
    agent.fitness = this.calculateFitness(solution);
  }

  /**
   * Clone an agent
   */
  private cloneAgent(agent: Agent): Agent {
    return {
      chromosome: agent.chromosome,
      fitness: agent.fitness,
      solution: agent.solution,
      equation: agent.equation
    };
  }

  /**
   * Get best agent from current population
   */
  private getBestAgent(): Agent | null {
    if (this.population.length === 0) return null;
    return this.population[0];
  }

  /**
   * Log progress to console
   */
  private logProgress(): void {
    const best = this.getBestAgent();
    if (!best) return;

    const avgFitness = this.population.reduce((sum, a) => sum + a.fitness, 0) / this.population.length;
    
    console.log(`\nGeneration ${this.generation}:`);
    console.log(`  Best: ${best.equation} = ${best.solution} (fitness: ${best.fitness.toFixed(4)})`);
    console.log(`  Avg Fitness: ${avgFitness.toFixed(4)}`);
    console.log(`  Error: ${Math.abs(best.solution - this.config.target).toFixed(2)}`);
  }

  /**
   * Get fitness history for analysis
   */
  getFitnessHistory(): number[] {
    return [...this.bestFitnessHistory];
  }
}

// ============================================================================
// Usage Example
// ============================================================================

// Run example if executed directly
function runExample() {
  console.log('🧬 Starting Genetic Algorithm Evolution...\n');
  console.log('Target: 42\n');

  const ga = new GeneticAlgorithm({
    populationSize: 50,
    target: 42,
    maxGenerations: 500,
    mutationRate: 0.15,
    crossoverRate: 0.7,
    elitismCount: 5
  });

  const result = ga.evolve();

  if (result) {
    console.log(`\n🎉 Final Solution:`);
    console.log(`   Equation: ${result.equation}`);
    console.log(`   Result: ${result.solution}`);
    console.log(`   Fitness: ${result.fitness.toFixed(4)}`);
    console.log(`   Error: ${Math.abs(result.solution - 42)}`);
  } else {
    console.log('\n❌ No solution found within generation limit');
  }
}

// Export for use as module, or run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runExample();
}

// CommonJS export (since we're using require for expr-eval)
module.exports = { GeneticAlgorithm };
// Note: Agent and Config are TypeScript interfaces/types, not runtime values
// They're available for TypeScript type checking but not exported at runtime

