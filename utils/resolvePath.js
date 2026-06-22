function resolveImport(importPath, allFiles, currentFile) {
  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];

    // very simple match logic
    if (file.includes(importPath.replace("./", ""))) {
      return file;
    }
  }

  return importPath; // fallback if not found
}

module.exports = resolveImport;