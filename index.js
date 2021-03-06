const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");

// use middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@kiron.ripcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("productsManager")
      .collection("products");

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.json(products);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.json(result);
    });

    app.post("/products", async (req, res) => {
      const brand = req.body.brand;
      const name = req.body.name;
      const price = req.body.price;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const product = {
        brand,
        name,
        price,
        image: imageBuffer,
      };
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });

    // update user
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          brand: updatedProduct.brand,
          name: updatedProduct.name,
          price: updatedProduct.price,
          image: updatedProduct.image,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.json(result);
    });

    // delete a user
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({
    products: {
      allProducts: "https://products-manager0.herokuapp.com/products",
      specificProduct: {
        pattern: "https://products-manager0.herokuapp.com/product/{_id}",
        example: "https://products-manager0.herokuapp.com/product/6263a3f86375db50d03bd09a",
      },
    },
    maintainer: "Toufiq Hasan Kiron <kiron@mygsuite.co>",
    source: "https://github.com/kiron0/products-manager-server",
  });
});

app.listen(port, () => {
  console.log("Products Manager Server is running");
});
