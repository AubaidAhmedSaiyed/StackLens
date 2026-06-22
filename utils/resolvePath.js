// Optimized O(1) path resolution
function resolveImport(importPath, filesSet, currentFile) {
  // Simple heuristic: check if any file in our Set ends with the import path
  // Since importPath could be relative like './utils' or '../utils/math'
  
  const cleanImport = importPath.replace(/^[./]+/, ""); // Remove leading ./ or ../

  // Fast O(1) exact matches if possible, but since we don't have absolute directory resolution
  // We'll iterate the Set. 
  // Wait, if we iterate the Set, it's still O(N)!
  // To make it O(1), we should normalize `importPath` against `currentFile`'s directory
  // and check the Set directly.

  const parts = currentFile.split('/');
  parts.pop(); // remove filename to get dir
  
  let importParts = importPath.split('/');
  for (let p of importParts) {
    if (p === '.') continue;
    if (p === '..') {
      parts.pop();
    } else {
      parts.push(p);
    }
  }

  let resolvedPath = parts.join('/');
  
  // Try adding extensions
  if (filesSet.has(resolvedPath)) return resolvedPath;
  if (filesSet.has(resolvedPath + '.js')) return resolvedPath + '.js';
  if (filesSet.has(resolvedPath + '.ts')) return resolvedPath + '.ts';
  if (filesSet.has(resolvedPath + '/index.js')) return resolvedPath + '/index.js';
  
  return null; // not found in repo
}

module.exports = resolveImport;