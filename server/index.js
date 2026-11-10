require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const uniswapRoutes = require("./routes/UniswapRoutes");

app.use("/api", uniswapRoutes);



app.listen(3001, () => {
  console.log("Express server running on port 3001");
});