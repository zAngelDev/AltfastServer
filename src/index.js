import app from "./app";
import "./handlers/database";

const host = process.env.HOST;
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log(
    `Altfast Server has been successfully started on http://${host}:${port}`
  );
});
