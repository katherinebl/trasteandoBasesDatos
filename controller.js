const express = require("express");
//const insertBlogEntry = require("./repository").insertBlogEntry;
const repository = require("./repository.js");

// Creo la aplicación express
const app = express();
// y la configuro para que express me parsee automáticamente bodys a json
app.use(express.json());

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

/***************** BLOGENTRIES COLLECTION *********************/

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
    repository.insertBlogEntry(newBlogEntry);
    res.json(toResponse(newBlogEntry));
  }
  console.log("Post inserted");
});

//listar todos los posts sin los comentarios
app.get("/blogEntries", async (req, res) => {
  const allBlogEntries = await repository.listBlogEntries();
  res.json(toResponse(allBlogEntries));
});

//listar un post concreto mediante su id
app.get("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  //cuando queremos hacer una búsqueda por id, necesitamos el ObjectId
  const blogEntry = await repository.findPost(id);
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    res.json(toResponse(blogEntry));
  }
});

//borrar un post concreto
app.delete("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await repository.findPost(id);
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    // await blogEntries.deleteOne({ _id: new ObjectId(id) });
    await repository.deletePost(id);
    res.json(toResponse(blogEntry));
  }
});

// editar un post en concreto
app.put("/blogEntries/:id", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await repository.findPost(id);
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
        name: updatedBlogEntry.name || blogEntry.name,
        lastName: updatedBlogEntry.lastName || blogEntry.lastName,
        nickname: updatedBlogEntry.nickname || blogEntry.nickname,
        postTitle: updatedBlogEntry.postTitle || blogEntry.postTitle,
        postText: updatedBlogEntry.postText || blogEntry.postText
      };

      //Update resource
      await repository.updatePost(id, newBlogEntry);
      //Return new resource
      newBlogEntry.id = id;
      res.json(newBlogEntry);
    }
  }
});

// insertar un comentario con su id en un post
app.post("/blogEntries/:id/comments", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await repository.findPost(id);
  if (!blogEntry) {
    res.sendStatus(404);
  } else {
    const newComment = req.body;
    //Validation
    if (
      typeof newComment.nickname != "string" ||
      typeof newComment.text != "string"
    ) {
      console.log("no se hace bien la validacion");
      res.sendStatus(400);
    } else {
      await repository.addNewComment(id, blogEntry, newComment);

      //Return new resource
      blogEntry.id = id;
      res.json(blogEntry);
    }
  }
});

// editar un comentario: usamos la id del post y la id del comentario.
app.put("/blogEntries/:id/comments/:commentId", async (req, res) => {
  const id = req.params.id;
  const blogEntry = await repository.findPost(id);
  if (!blogEntry) {
    console.log("No existe el post");
    res.sendStatus(404);
  } else {
    const updatedCommentInfo = req.body;
    //Sacamos la id del comentario a editar
    const commentForUpdatingId = req.params.commentId;

    //Selecciono el comentario a editar
    const oldComment = blogEntry.postComments.find(
      element => element.commentId == commentForUpdatingId
    );
    console.log("old comment", oldComment);

    //Aquí construyo un objeto nuevo con la info del comentario: si tengo algo nuevo que añadir, pongo lo nuevo, sino, pongo lo que había antes
    const newCommentInfo = {
      nickname: updatedCommentInfo.nickname || oldComment.nickname,
      text: updatedCommentInfo.text || oldComment.text,
      commentId: updatedCommentInfo.commentId || oldComment.commentId,
      date: updatedCommentInfo.date || oldComment.date
    };

    const commentForUpdating = await repository.updateComment(
      id,
      commentForUpdatingId,
      newCommentInfo
    );

    //Validacion del comentario a editar
    if (!commentForUpdating) {
      console.log("No existe el comentario a editar");
      res.sendStatus(404);
    } else {
      //blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
      const blogEntry = await repository.findPost(id);
      res.json(toResponse(blogEntry));
      console.log("todo ha ido ok");
    }
  }
});

//borra el comentario de un post, según su id
app.delete("/blogEntries/:id/comments/:commentId", async (req, res) => {
  const id = req.params.id;
  let blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
  console.log("El post que quiero editar es el: ", blogEntry);
  if (!blogEntry) {
    console.log("No existe el post");
    res.sendStatus(404);
  } else {
    //Sacamos la id del comentario a borrar
    const commentForUpdatingId = req.params.commentId;
    console.log("La ide del comentario a borrar es", commentForUpdatingId);

    const query = {
      _id: new ObjectId(id),
      "postComments.commentId": new ObjectId(commentForUpdatingId)
    };

    const itemToDelete = {
      $pull: {
        postComments: { commentId: new ObjectId(commentForUpdatingId) }
      }
    };

    const commentForUpdating = await blogEntries.updateOne(query, itemToDelete);

    console.log("El cometario editado es este", commentForUpdating);
    //Validacion del comentario a editar
    if (!commentForUpdating) {
      console.log("No existe el comentario a editar");
      res.sendStatus(404);
    } else {
      blogEntry = await blogEntries.findOne({ _id: new ObjectId(id) });
      res.json(toResponse(blogEntry));
      console.log("todo ha ido ok");
    }
  }
});

/***************** END OF BLOGENTRIES COLLECTION *********************/

/***************** WORDS COLLECTION *********************/
//insertar una entrada de blog
app.post("/words", async (req, res) => {
  const word = req.body;
  //valido que el insulto es correct
  if (typeof word.name != "string" || typeof word.level != "number") {
    res.sendStatus(400);
  } else {
    const newWord = {
      name: word.name,
      lastName: word.lastName,
      level: word.level
    };

    //inserto el anuncio nuevo en la colección de la base de datos
    await words.insertOne(newWord);
    res.json(toResponse(newWord));
  }
  console.log("Word inserted");
});

/***************** END OF WORDS COLLECTION **************/

/*
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
  words = conn.db().collection("words");
  //si yo necesitara acceder a otra colección , podría hacerlo de la misma manera de arriba ¿??¿?
}
async function main() {
  await dbConnect(); //espera a que se conecte la base de datos
  //y luego levanta express
  //   app.listen(3000, () => console.log("Server started in port 3000"));
}

main();
*/
module.exports = app;
