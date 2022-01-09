import mongo, { Auth } from "mongodb";

export class Database {
  #url: string;
  #authCredentials: Auth;
  #mongoClient: typeof mongo.MongoClient;
  constructor(url: string, username?: string, password?: string) {
    this.#url = url;
    this.#authCredentials = { username, password };
    this.#mongoClient = mongo.MongoClient;
  }

  #connectToDB = (
    callbackFunction: (
      error: mongo.AnyError | undefined,
      db: mongo.MongoClient | undefined
    ) => void
  ) => {
    this.#mongoClient.connect(
      this.#url,
      { auth: this.#authCredentials },
      callbackFunction
    );
  };

  initDB = () => {
    this.#connectToDB((error, db) => {
      if (error) throw error;
      console.log("Connected with database!");
      if (db) {
        const dbo = db?.db("svgeditor");
        if (!dbo.collection("rooms")) {
          dbo.createCollection("rooms", (err, res) => {
            if (err) throw err;
            console.log("Collection created!");
            db.close();
          });
        } else {
          console.log(
            'Did not create collection "rooms", because it already exists!'
          );
        }
      }
    });
    return this;
  };

  doesRoomExist = async (roomId: string) => {
    return new Promise<boolean>((resolve, reject) => {
      this.#connectToDB((error, db) => {
        if (error) throw error;
        if (db) {
          const dbo = db?.db("svgeditor");
          dbo.collection("rooms").findOne({ roomId }, (err, result) => {
            console.log("roomid: %s, result: %s", roomId, result);
            resolve(!!result);
          });
        }
      });
    });
  };

  updateRoom = async (roomId: string, shapes: string) => {
    const updatePromise = new Promise<void>((resolve, reject) => {
      const obj = { roomId, shapes };
      this.#connectToDB((error, db) => {
        if (error) throw error;
        console.log("Connected with database!");
        if (db) {
          // let shapes = {};
          const dbo = db?.db("svgeditor");
          dbo.collection("rooms").insertOne(obj, (err, result) => {
            if (err) throw err;
            console.log("insert result: ", result);
            db.close();
            resolve();
          });
        }
      });
    });
    return updatePromise;
  };

  getShapes = (roomId: string) => {
    return new Promise<string>((resolve, reject) => {
      const query = { roomId };
      this.#connectToDB((error, db) => {
        if (error) throw error;
        console.log("Connected with database!");
        if (db) {
          const dbo = db?.db("svgeditor");
          dbo.collection("rooms").findOne(query, (err, result) => {
            if (err) throw err;

            db.close();
            if (result) {
              resolve(result.shapes);
            } else {
              reject("");
            }
          });
        }
      });
    });
  };
}
