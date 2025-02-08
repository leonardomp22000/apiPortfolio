const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/start-hand-tracking", (req, res) => {
  // Ejecuta el script de Python
  const pythonProcess = exec(
    "python3 hand_tracking.py",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }
      res.json({ message: stdout });
    }
  );

  res.json({ message: "Hand tracking started" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
