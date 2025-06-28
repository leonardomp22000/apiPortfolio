const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:5001"; // http://127.0.0.1:5001

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("frame", async (imageData) => {
    if (typeof imageData === "string" && imageData.startsWith("data:image")) {
      try {
        const response = await axios.post(`${PYTHON_API_URL}/process`, {
          image: imageData,
        });

        if (response.data.processed_frame) {
          socket.emit("processed_frame", response.data.processed_frame);
        } else {
          console.error("Error en la imagen procesada:", response.data.error);
        }
      } catch (error) {
        console.error(
          "Error al enviar la imagen al servicio Python:",
          error.message
        );
      }
    } else {
      console.error("Formato de imagen no válido");
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
