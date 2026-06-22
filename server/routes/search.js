app.get("/search", (req, res) => {
  const file = req.query.file;

  const dependents = reverseGraph[file] || [];

  res.json({
    file,
    usedBy: dependents
  });
});