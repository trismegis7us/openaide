import matter from 'gray-matter';
import path from 'path';

export class DependencyGraph {
  private blockedByGraph: Record<string, string[]> = {};
  private blocksGraph: Record<string, string[]> = {};
  private visited = new Set<string>();

  getNextAvailableTasks(tasks: string[]): string[] {
    return this._getNextAvailableTasks(tasks, new Set());
  }

  private _getNextAvailableTasks(tasks: string[], visited: Set<string>): string[] {
    const result: string[] = [];
    // If tasks is not defined analize the whole graph
    for (let task of tasks ?? Object.keys(this.blockedByGraph)) {
      if (visited.has(task)) continue;
      visited.add(task);

      // If the task has nothing blocking it, add it to the result and continue
      if (this.blockedByGraph[task]?.length === 0) {
        result.push(task);
        continue;
      }
      // For each blocking task, run recursively
      for (let blockingTask of this.blockedByGraph[task] ?? []) {
        result.push(...this._getNextAvailableTasks([blockingTask], visited));
      }
    }
    return result;
  }

  private loadFileDependencies(filePath: string, { fs }) {
    // Avoid cycles
    if (this.visited.has(filePath)) return;
    this.visited.add(filePath);

    // Prepare adjacency lists
    if (!this.blockedByGraph[filePath]) this.blockedByGraph[filePath] = [];
    if (!this.blocksGraph[filePath]) this.blocksGraph[filePath] = [];

    // Get dependencies from file frontmatter
    const fileContents = fs.readFile(filePath, 'utf8');
    const fileFrontmatter = matter(fileContents);

    const blocks = (fileFrontmatter.data.blocks ?? [])
      .map((blocksPath: string) => path.join('..', 'specs', blocksPath));

    const blockedBy = (fileFrontmatter.data.blockedBy ?? [])
      .map((blockedByPath: string) => path.join('..', 'specs', blockedByPath));

    // Explore all files that this blocks
    for (let file of blocks) {
      // Prepare adjacency list
      if (!this.blockedByGraph[file]) this.blockedByGraph[file] = [];

      // Add the relationships to the graphs
      this.blocksGraph[filePath].push(file);
      this.blockedByGraph[file].push(filePath);
      this.loadFileDependencies(file, { fs });
    }

    // Explore all files that this is blocked by
    for (let file of blockedBy) {
      // Prepare adjacency list
      if (!this.blockedByGraph[file]) this.blockedByGraph[file] = [];

      // Add the relationships to the graphs
      this.blocksGraph[file].push(filePath);
      this.blockedByGraph[filePath].push(file);

      // Explore the files that block this file
      this.loadFileDependencies(file, { fs });
    }
  };

  loadSpecDependencies(specFilePath, { fs }) {
    // Load all spec dependencies
    const files = fs.readdir(specFilePath.toString());
    for (const file of files) {
      if (path.extname(file.name) === '.md') {
        const fullPath = path.join(specFilePath, file.name);
        this.loadFileDependencies(fullPath, { fs });
      }
    }
  }

}
