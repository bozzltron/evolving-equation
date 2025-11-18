# Evolving Equation - Evolutionary Algorithm

A genetic algorithm implementation that evolves mathematical equations to match a target value.

## Overview

This project demonstrates evolutionary algorithms (genetic algorithms) in JavaScript/TypeScript. The algorithm evolves a population of mathematical equations, using selection, crossover, and mutation to find equations that evaluate to a target value (default: 42).

## Project Structure

- `index.ts` - TypeScript implementation with proper genetic algorithm operators
- `CRITIQUE.md` - Detailed code critique and recommendations
- `COMPARISON.md` - Side-by-side comparison of original vs improved
- `WHAT_WENT_WRONG.md` - Educational guide explaining the issues
- `STEP_BY_STEP_EXAMPLE.md` - Step-by-step walkthrough of the algorithm

## Quick Start

```bash
# Install dependencies
npm install

# Run with ts-node (development)
npm run dev

# Or compile and run (production)
npm run build
npm start
```

## Features

1. ✅ **Security**: Safe expression parser (no `eval()`)
2. ✅ **Proper GA**: Implements crossover, mutation, and selection
3. ✅ **TypeScript**: Type-safe implementation
4. ✅ **Configuration**: All parameters configurable
5. ✅ **Elitism**: Preserves best solutions
6. ✅ **Termination**: Multiple termination criteria

## Algorithm Parameters

Default configuration:
- Population Size: 50
- Target Value: 42
- Max Generations: 1000
- Mutation Rate: 0.1 (10%)
- Crossover Rate: 0.7 (70%)
- Elitism Count: 5 (top 5 preserved)

## Example Output

```
🧬 Starting Genetic Algorithm Evolution...

Target: 42

Generation 0:
  Best: 6*7 = 42 (fitness: 1.0000)
  Avg Fitness: 0.0234
  Error: 0.00

✅ Solution found at generation 0!

🎉 Final Solution:
   Equation: 6*7
   Result: 42
   Fitness: 1.0000
   Error: 0
```

## Learning Resources

- [CRITIQUE.md](./CRITIQUE.md) - Detailed analysis of original code
- [COMPARISON.md](./COMPARISON.md) - Side-by-side code comparison
- [Genetic Algorithms Tutorial](https://www.tutorialspoint.com/genetic_algorithms/)
- [Introduction to Evolutionary Algorithms](https://www.cs.cmu.edu/~awm/251/)

## License

MIT

