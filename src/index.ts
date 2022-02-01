import dotenv from "dotenv";
import { SVGEditorBackEnd } from "./apps/SVGEditorBackEnd/SVGEditorBackEnd.js";
import { DBConfig } from "./apps/SVGEditorBackEnd/SVGEditorBackEnd.types";

dotenv.config();
{
  try {
    const {
      DB_USERNAME: userNameDB,
      DB_PASSWORD: passWordDB,
      DB_INITDB: initialNameDB,
      DB_PORT: portDB,
      DB_ADDRESS: addressDB,
      BACKEND_PORT,
    } = process.env;
    const port = parseInt(BACKEND_PORT ?? "8080");
    const dbConfiguration = {
      userNameDB,
      passWordDB,
      initialNameDB,
      portDB,
      addressDB,
    };
    if (!(userNameDB && passWordDB && initialNameDB && portDB && addressDB)) {
      const errorMessage =
        "Error while reading environment variables! Missing variables: ".concat(
          Object.entries(dbConfiguration)
            .filter(([, value]) => !value)
            .reduce((acc, [key]) => acc.concat(" ", key), " ")
            .trim()
            .replace(" ", ",")
        );
      throw new Error(errorMessage);
    } else {
      new SVGEditorBackEnd(dbConfiguration as DBConfig, port);
    }
  } catch (error) {
    console.error(error);
  }
}
