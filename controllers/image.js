const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const USER_ID = "clarifai";
const APP_ID = "main";
const MODEL_ID = "face-detection";
const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();

const handleApiCall = (req, res, CLARIFAI_PAT) => {
  const PAT = CLARIFAI_PAT;

  metadata.set("authorization", "Key " + PAT);

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
              url: req.body.input,
              allow_duplicate_url: true
            }
          }
        }
      ]
    },
    metadata,
    (err, response) => {
      if (err) {
        res.status(400).json("unable to work with API");
        throw new Error(err);
      }

      if (response.status.code !== 10000) {
        res.status(400).json("unable to work with API");
        throw new Error("Post model outputs failed, status: " + response.status.description);
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

  db.select("*")
    .from("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => res.json(entries[0].entries))
    .catch(err => res.status(400).json("Unable to get entries"));
}

module.exports = {
  handleApiCall,
  handleImage
};