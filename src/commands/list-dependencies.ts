import path from 'path';
import { DependencyGraph } from '../models/dependency-graph.ts';

export function listDependenciesCommand(options, { fs }) {
  const { specFiles } = options;
  const dependencies = new DependencyGraph();

  // If no spec files are specified, load all spec files
  if (!specFiles) {
    const specDir = path.join('..', 'specs');
    dependencies.loadSpecDependencies(specDir, { fs });
  }
  else {
    // Load specified spec files
    for (let specFile of specFiles) {
      const specDir = path.parse(specFile).dir;
      dependencies.loadSpecDependencies(specDir, { fs });
    }
  }

  const result = dependencies
    .getNextAvailableTasks(specFiles)
    .join('\n');
  console.log(result);
}
