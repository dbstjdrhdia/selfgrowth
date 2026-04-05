import express from "express";
const app = express();
app.get("*", (req, res) => {
  res.status(404).send("Not found");
});
app.listen(3001, () => console.log("Test server running"));
