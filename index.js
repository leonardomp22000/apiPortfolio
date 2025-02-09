// const express = require("express");
// const cors = require("cors");
// const { exec } = require("child_process");

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.get("/start-hand-tracking", (req, res) => {
//   // Ejecuta el script de Python
//   const pythonProcess = exec(
//     "python3 hand_tracking.py",
//     (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error: ${error.message}`);
//         return res.status(500).json({ error: error.message });
//       }
//       if (stderr) {
//         console.error(`stderr: ${stderr}`);
//         return res.status(500).json({ error: stderr });
//       }
//       res.json({ message: stdout });
//     }
//   );

//   res.json({ message: "Hand tracking started" });
// });

// app.listen(5000, () => console.log("Server running on port 5000"));

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { spawn } = require("child_process");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  const pythonProcess = spawn("python3", ["hand_tracking.py"]);

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error en Python: ${data.toString()}`);
  });

  socket.on("frame", (imageData) => {
    if (typeof imageData === "string" && imageData.startsWith("data:image")) {
      pythonProcess.stdin.write(imageData + "\n");
    } else {
      console.error("Formato de imagen no válido");
    }
  });

  let buffer = ""; // Acumulador de datos

  pythonProcess.stdout.on("data", (data) => {
    buffer += data.toString(); // Acumular los datos entrantes

    try {
      // Intentar parsear JSON solo cuando está completo
      while (buffer.includes("\n")) {
        const index = buffer.indexOf("\n");
        const jsonString = buffer.slice(0, index).trim(); // Extraer una línea completa de JSON
        buffer = buffer.slice(index + 1); // Eliminar la parte procesada del buffer

        const parsedData = JSON.parse(jsonString); // Parsear JSON completo
        if (parsedData.processed_frame) {
          socket.emit("processed_frame", parsedData.processed_frame);
        } else {
          console.error("Error en la imagen procesada:", parsedData.error);
        }
      }
    } catch (err) {
      console.error("Error al parsear JSON:", err);
      buffer = ""; // Reiniciar el buffer en caso de error para evitar datos corruptos
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
    pythonProcess.kill();
  });
});

server.listen(5000, () => {
  console.log("Servidor corriendo en http://localhost:5000");
});
