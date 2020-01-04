// Importo MongoDB y Express

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const express = require("express");

const url = "mongodb://localhost:27017/BlogDB";

// Creo la aplicación express
const app = express();
// y la configuro para que express me parsee automáticamente bodys a json
app.use(express.json());

//let conn; // esto representa mi base de datos
let blogEntries; // esto representa la colección de las entradas del blog

//sustituye el id que me pone mongo: le quita el _id que nos pone mongo, por el id que está esperando el API rest
function toResponse(doc) {
  if (doc instanceof Array) {
    toResponse;
    return doc.map(elem => toResponse(elem));
  } else {
    let { _id, ...ret } = doc;
    ret.id = doc._id.toString();
    return ret;
  }
}

/** Métodos que definen el comportamiento de la API */

//insertar una entrada de blog
app.post("/blogEntries", async (req, res) => {
  const blogEntry = req.body;
  //valido que la entrada del blog es correcta
  if (
    typeof blogEntry.name != "string" ||
    typeof blogEntry.postText != "string"
  ) {
    res.sendStatus(400);
  } else {
    const newBlogEntry = {
      name: blogEntry.name,
      lastName: blogEntry.lastName,
      nickname: blogEntry.nickname,
      postTitle: blogEntry.postTitle,
      postText: blogEntry.postText,
      postComments: blogEntry.postComments
    };

    //inserto el anuncio nuevo en la colección de la base de datos
    await blogEntries.insertOne(newBlogEntry);
    res.json(toResponse(newBlogEntry));
  }
  console.log("Post inserted");
});

//listar todos los posts
app.get("/blogEntries", async (req, res) => {
  const allBlogEntries = await blogEntries.find().toArray();
  res.json(toResponse(allBlogEntries));
});

//listar un post concreto mediante su id
app.get("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  //cuando queremos hacer una búsqueda por id, necesitamos el ObjectId
  const blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    res.json(toResponse(blogEntry));
  }
});

//borrar un post concreto
app.delete("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    await blogEntries.deleteOne({ _id: new ObjectId(id) });
    res.json(toResponse(blogEntry));
  }
});

// editar un post en concreto
app.put("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    const updatedBlogEntry = req.body;
    //Validation
    if (
      typeof updatedBlogEntry.name != "string" ||
      typeof updatedBlogEntry.postText != "string"
    ) {
      res.sendStatus(400);
    } else {
      //Create object with needed fields and assign id
      const newBlogEntry = {
        name: updatedBlogEntry.name,
        lastName: updatedBlogEntry.lastName,
        nickname: updatedBlogEntry.nickname,
        postTitle: updatedBlogEntry.postTitle,
        postText: updatedBlogEntry.postText
      };
      //Update resource
      await blogEntries.updateOne(
        { _id: new ObjectId(id) },
        { $set: newBlogEntry }
      );
      //Return new resource
      newBlogEntry.id = id;
      res.json(newBlogEntry);
    }
  }
});

// insertar un comentario --> NO FUNCIONA
app.put("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    const newComment = req.body;
    //Validation
    if (
      // typeof newComment.nickName != "string" ||
      // typeof newComment.text != "string"
      false
    ) {
      res.sendStatus(400);
    } else {
      debugger;
      //Create object with updated fields
      // const newBlogEntry = {
      //   postComments: {
      //     ...blogEntry.postComments,
      //     newComment
      //   }
      // };
      blogEntry.postComments.push(newComment);
      //Update resource
      await blogEntries.updateOne(
        { _id: new ObjectId(id) },
        { $set: blogEntry }
        // { $set: newblogEntry }
      );
      //Return new resource
      newBlogEntry.id = id;
      res.json(newBlogEntry);
    }
  }
});

async function dbConnect() {
  //creo la conexión a la base de datos (la arranco)
  let conn = await MongoClient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });

  console.log("Connected to Mongo");
  //Justo después que se conecte la base de datos, inicializo esta variable: la colección de anuncios de la conexión a la base de datos (conn)
  //esto lo tengo que hacer antes de que ads se use en cualquiera de los métodos, para poder guardar o borrar o editar o consultar cualquier cosa de esa colección.
  blogEntries = conn.db().collection("blogEntries");
  //si yo necesitara acceder a otra colección , podría hacerlo de la misma manera de arriba ¿??¿?
}
async function main() {
  await dbConnect(); //espera a que se conecte la base de datos
  //y luego levana express
  app.listen(3021, () => console.log("Server started in port 3021"));
}

main();
