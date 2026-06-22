const getImpact = require("../analysis/impact");

app.get("/impact", (req, res) => {
  const file = req.query.file;

  const impacted = getImpact(file, reverseGraph);

  res.json({
    file,
    impacted
  });
});