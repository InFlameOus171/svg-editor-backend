import mongo, { Auth } from "mongodb";

export class MongoDBController {
  #url: string;
  #authCredentials: Auth;
  #mongoClient: typeof mongo.MongoClient;
  constructor(url: string, username?: string, password?: string) {
    this.#url = url;
    this.#authCredentials = { username, password };
    this.#mongoClient = mongo.MongoClient;
  }

  #connectToDB = async (
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
            resolve(!!result);
          });
        }
      });
    });
  };

  deleteShapes = async (roomId?: string, ids: string | string[] = []) => {
    const incomingChangedShapes = ids as string[];
    if (!roomId || !incomingChangedShapes || !incomingChangedShapes.length)
      return;
    let allShapes = await this.getShapes(roomId);
    allShapes = allShapes.filter((shape) => !ids.includes(shape.id));

    const updatePromise = new Promise<Record<string, any>[]>(
      (resolve, reject) => {
        const obj = { $set: { roomId, shapes: allShapes } };
        this.#connectToDB((error, db) => {
          if (error) throw error;
          if (db) {
            const dbo = db?.db("svgeditor");
            dbo
              .collection("rooms")
              .findOneAndUpdate({ roomId }, obj, (err, result) => {
                if (err) throw err;
                db.close();
                resolve(allShapes);
              });
          }
        });
      }
    );
    return updatePromise;
  };

  unlockAllById = async (roomId?: string, lockedById?: string) => {
    if (!roomId) return;
    const savedShapes = await this.getShapes(roomId);
    savedShapes.forEach((savedShape) => {
      if (savedShape.isLocked && savedShape.lockedById === lockedById) {
        savedShape.isLocked = false;
        savedShape.lockedById = "";
      }
    });
    const updatePromise = new Promise<Record<string, any>[]>(
      (resolve, reject) => {
        const obj = { $set: { roomId, shapes: savedShapes } };
        this.#connectToDB((error, db) => {
          if (error) throw error;
          if (db) {
            const dbo = db?.db("svgeditor");
            dbo
              .collection("rooms")
              .findOneAndUpdate({ roomId }, obj, (err, result) => {
                if (err) throw err;
                db.close();
                resolve(savedShapes);
              });
          }
        });
      }
    );
    return updatePromise;
  };

  updateRoom = async (
    roomId: string,
    incomingChanges: string[],
    lockedById?: string
  ) => {
    let savedShapes: Array<Record<string, any>> = await this.getShapes(roomId);
    const incomingShapes: Array<Record<string, any>> = incomingChanges.map(
      (shape) => JSON.parse(shape)
    );
    incomingShapes.forEach((incomingShape) => {
      if (typeof savedShapes === "string") {
        savedShapes = [incomingShape];
        return;
      }
      const existingShapeIndex = savedShapes.findIndex(
        (savedShape) => incomingShape.id === savedShape.id
      );
      if (existingShapeIndex >= 0) {
        savedShapes[existingShapeIndex] = incomingShape;
        return;
      }
      if (incomingShape.isLocked) {
        incomingShape.lockedById = lockedById;
      }
      savedShapes.push(incomingShape);
    });

    const updatePromise = new Promise<Record<string, any>[]>(
      (resolve, reject) => {
        const obj = { $set: { roomId, shapes: savedShapes } };
        this.#connectToDB((error, db) => {
          if (error) throw error;
          if (db) {
            const dbo = db?.db("svgeditor");
            dbo
              .collection("rooms")
              .findOneAndUpdate({ roomId }, obj, (err, result) => {
                if (err) throw err;
                db.close();
                resolve(savedShapes);
              });
          }
        });
      }
    );
    return updatePromise;
  };

  createRoom = async (roomId: string, shapes: string[]) => {
    const updatePromise = new Promise<void>((resolve, reject) => {
      const obj = { roomId, shapes };
      this.#connectToDB((error, db) => {
        if (error) throw error;
        if (db) {
          const dbo = db?.db("svgeditor");
          dbo.collection("rooms").insertOne(obj, (err, result) => {
            if (err) throw err;
            db.close();
            resolve();
          });
        }
      });
    });
    return updatePromise;
  };

  getShapes = async (roomId: string) => {
    return new Promise<Record<string, any>[]>((resolve, reject) => {
      const query = { roomId };
      this.#connectToDB((error, db) => {
        if (error) throw error;
        if (db) {
          const dbo = db?.db("svgeditor");
          dbo.collection("rooms").findOne(query, (err, result) => {
            if (err) throw err;

            db.close();
            if (result) {
              const parsedResult =
                typeof result.shapes === "string"
                  ? JSON.parse(result.shapes)
                  : result.shapes;
              resolve(parsedResult);
            } else {
              reject("");
            }
          });
        }
      });
    });
  };
}
