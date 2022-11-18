import express from "express";
import util from "util";
import axios from "axios";
import { setTimeout } from "timers/promises";
import { mapSequentialAsync } from "js-array-map-sequential";

const { log } = console;

const app = express();
app.use(express.json());

const port = process.env.PORT || 8888;

app.post("/long-calculation", async (req, res) => {
  const { item } = req.body;
  const result = item * item;

  await setTimeout(1_000);
  res.json({ result });
});

await util.promisify(app.listen).call(app, port);
log(`Server is up and running at port ${port}`);

let index = 0;

const arrayLenght = Number(process.argv[2]) || 10_000;

const bigArray = Array(arrayLenght)
  .fill(null)
  .map((value, index) => index);

const mapFunction = async (item) => {
  console.log(++index);
  const { data } = await axios.post(`http://localhost:${port}/long-calculation`, { item });
  const { result } = data;
  return result;
};

log(`Sequential mapping, it's safe to call filesystem or remote api without flooding it`);
const newArrayModified = await mapSequentialAsync(bigArray, mapFunction);
log('newArrayModified', newArrayModified);

log(`Parallel mapping, you are going to have problems if your array is big enough, try with 10k`);
const promiseCollectionResult = await bigArray.map(mapFunction);
log('promiseCollectionResult', promiseCollectionResult);
log(await Promise.all(promiseCollectionResult));

process.exit(0);
