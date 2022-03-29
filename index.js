const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

// const uri =
//   "mongodb+srv://eBachelor:3ApXHf3IoUtd5zGI@cluster0.rzm4j.mongodb.net/bachelorCommerce?retryWrites=true&w=majority";

const app = express();

// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

const uri =
  "mongodb+srv://eBachelor:3ApXHf3IoUtd5zGI@cluster0.rzm4j.mongodb.net/bachelorCommerce?retryWrites=true&w=majority";

// const app = express();
// app.use((req, res, next) => {
//   res.setHeader("Acces-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Acces-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
//   res.setHeader("Acces-Contorl-Allow-Methods", "Content-Type", "Authorization");
//   next();
// });

// const corsOptions = {
//   origin: "*",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(cors());

const port = 5050;

// app.get("/", (req, res) => {
//   res.send("hello from db it's working working");
// });

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productCollection = client.db("eBachelor").collection("products");
  const ordersCollection = client.db("eBachelor").collection("orders");
  const cartCollection = client.db("eBachelor").collection("cart");
  const adminCollection = client.db("eBachelor").collection("admin");

  app.patch("/update/:id", (req, res) => {
    productCollection
      .updateOne(
        { _id: ObjectID(req.params.id) },
        {
          $set: {
            price: req.body.price,
            description: req.body.description,
          },
        }
      )
      .then((result) => {});
  });
  app.patch("/updateStatus/:id", (req, res) => {
    ordersCollection
      .updateOne(
        { _id: ObjectID(req.params.id) },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {});
  });

  app.patch("/updateCart/:id", (req, res) => {
    cartCollection
      .replaceOne({ _id: req.params.id }, req.body)
      .then((result) => {});
  });

  app.get("/orders", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/ordersByUser", (req, res) => {
    const email = req.body.email;
    ordersCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/cart", (req, res) => {
    const email = req.body.email;
    cartCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/products/:category", (req, res) => {
    const category = req.params.category;
    productCollection.find({ category: category }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    console.log("email",req.body);
    adminCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents.length > 0);
      // console.log("doc", documents);
      // console.log(err);
    });
  });

  app.post("/addProduct", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const category = req.body.category;
    const description = req.body.description;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    productCollection
      .insertOne({ name, price, category, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/products", (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/deleteWholeCart", (req, res) => {
    cartCollection.deleteMany({}).then((documents) => {
      res.send(!!documents.value);
    });
  });

  app.post("/addNewOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addToCart", (req, res) => {
    const order = req.body;

    cartCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });



  app.delete("/delete/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    productCollection.findOneAndDelete({ _id: id }).then((documents) => {
      res.send(!!documents.value);
    });
  });
  app.delete("/deleteCart/:id", (req, res) => {
    const id = req.params.id;

    cartCollection.findOneAndDelete({ _id: id }).then((documents) => {
      res.send(!!documents.value);
    });
  });
});

app.listen(process.env.PORT || port);
