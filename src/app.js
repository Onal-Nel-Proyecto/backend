import express from "express";
const app = express();

// 👇 IMPORTANTE
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Backend funcionando ando");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
