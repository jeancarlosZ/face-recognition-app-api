const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const PAT = process.env.CLARIFAI_PAT;
const USER_ID = "clarifai";
const APP_ID = "main";
const MODEL_ID = "face-detection";
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();

metadata.set("authorization", "Key " + PAT);

const handleApiCall = (req, res) => {
  const { imageUrlEntry } = req.body;

  if (!imageUrlEntry || imageUrlEntry.trim() === "") {
    return res.status(400).json({ message: "Field cannot be empty" });
  }

  stub.PostModelOutputs(
    {
      user_app_id: {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      model_id: MODEL_ID,
      inputs: [
        {
          data: {
            image: {
              url: imageUrlEntry,
              allow_duplicate_url: true
            }
          }
        }
      ]
    },
    metadata,
    (err, response) => {
      if (err) {
        return res.status(400).json({ message: `Unable to work with Clarifai API: ${err}` });
      }

      if (response.status.code !== 10000) {
        return res.status(400).json({ message: `Unable to work with Clarifai API: Post model outputs failed, status: ${response.status.description}` });
      }

      const regions = response.outputs[0].data.regions;
      const faceBoxes = [];

      regions.forEach(region => {
        const boundingBox = region.region_info.bounding_box;
        const topRow = boundingBox.top_row.toFixed(3);
        const leftCol = boundingBox.left_col.toFixed(3);
        const bottomRow = boundingBox.bottom_row.toFixed(3);
        const rightCol = boundingBox.right_col.toFixed(3);
        const faceBox = {};

        faceBox.topRow = topRow;
        faceBox.leftCol = leftCol;
        faceBox.bottomRow = bottomRow;
        faceBox.rightCol = rightCol;

        console.log(`BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`);
        faceBoxes.push(faceBox);
      });

      res.json(faceBoxes)
    }
  );
}

const handleImage = (req, res, db) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Id cannot be empty" });
  }

  db.select("*")
    .from("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => res.json(entries[0].entries))
    .catch(err => res.status(400).json({ message: "Unable to get entries" }));
}

module.exports = {
  handleApiCall,
  handleImage
};