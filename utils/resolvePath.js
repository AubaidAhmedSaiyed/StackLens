// Optimized O(1) path resolution
function resolveImport(importPath, filesSet, currentFile) {
  const cleanImport = importPath.replace(/^[./]+/, ""); 

  const parts = currentFile.split('/');
  parts.pop(); 
  
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
  
  if (filesSet.has(resolvedPath)) return resolvedPath;
  if (filesSet.has(resolvedPath + '.js')) return resolvedPath + '.js';
  if (filesSet.has(resolvedPath + '.ts')) return resolvedPath + '.ts';
  if (filesSet.has(resolvedPath + '/index.js')) return resolvedPath + '/index.js';
  
  return null;
}

module.exports = resolveImport;