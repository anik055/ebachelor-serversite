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
  res.send("Blood Donar App");
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
  const bloodDetails = client.db("blood-donation").collection("bloodDetails");
  const userDetails = client.db("blood-donation").collection("userDetails");

    app.get("/AvailableDonars", (req, res) => {
      if (req?.query?.groupId && req?.query?.locationId) {
        // console.log(typeof req.query.groupId)
        userDetails
          .find({
            groupId: parseInt(req.query.groupId),
            locationId: parseInt(req.query.locationId),
            status: true,
          })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else if (req?.query?.groupId && !req?.query?.locationId) {
        userDetails
          .find({ groupId: parseInt(req.query.groupId), status: true })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else if (!req?.query?.groupId && req?.query?.locationId) {
        userDetails
          .find({ locationId: parseInt(req.query.locationId), status: true })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else {
        userDetails.find({ status: true }).toArray((err, documents) => {
          res.send(documents);
        });
      }
    });

    app.post("/AddUserDetails", (req, res) => {
      const order = req.body;
      userDetails.insertOne(order).then((result) => {
        console.log(result);
        res.send(result.insertedCount > 0);
      });
    });

    app.put("/UpdateUserDetails", (req, res) => {
      const {
        email,
        name,
        group,
        groupId,
        location,
        locationId,
        phone,
        status,
      } = req.body;
      console.log(req.body);
      userDetails
        .updateOne(
          { email: email },
          {
            $set: {
              name: name,
              group: group,
              groupId: groupId,
              locationId: locationId,
              location: location,
              phone: phone,
              status: status,
            },
          }
        )
        .then((result) => {
          res.send(result);
        });
    });

    app.post("/GetUserDetails", (req, res) => {
      console.log(req?.body?.email);
      userDetails.find({ email: req.body.email }).toArray((err, documents) => {
        res.send(documents);
      });
    });

    app.post("/AddBloodDetails", (req, res) => {
      const order = req.body;
      bloodDetails.insertOne(order).then((result) => {
        console.log(result);
        res.send(result.insertedCount > 0);
      });
    });
    app.get("/FilterBloodDetails", (req, res) => {
      bloodDetails
        .find({ groupId: parseInt(req?.query?.groupId) })
        .toArray((err, documents) => {
          res.send(documents);
        });
    });

    app.get("/AllBloodDetails", (req, res) => {
      if (req?.query?.groupId && req?.query?.locationId) {
        bloodDetails
          .find({
            groupId: parseInt(req.query.groupId),
            locationId: parseInt(req.query.locationId),
          })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else if (req?.query?.groupId && !req?.query?.locationId) {
        bloodDetails
          .find({ groupId: parseInt(req.query.groupId) })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else if (!req?.query?.groupId && req?.query?.locationId) {
        bloodDetails
          .find({ locationId: parseInt(req.query.locationId) })
          .toArray((err, documents) => {
            res.send(documents);
          });
      } else {
        bloodDetails.find().toArray((err, documents) => {
          res.send(documents);
        });
      }
    });
});

app.listen(process.env.PORT || port);
