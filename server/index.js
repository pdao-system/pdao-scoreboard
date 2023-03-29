import express from 'express'
import { updateContest } from '../server/lib';
const app = express();
/*
app.use(cors());

// const updateRuns =  async ()=>{
//     url = "pdogs.backend";
//     res = await fetch(url);
//     result = process(res);
//     fs.writeFileSync(result, "./runs.json")
// }

const updateRuns = async () => {
  url = "pdogs/backend";
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function getTeam(account_id) {
  //TODO: find team with account_id
  return "team id";
}
*/
function SubmissionToRuns({ data, subCnt }) {
  const submissions = data.data; //An array storing the submission
  const runs = [];
  for (let i = 0; i < submissions.length; i++) {
    const id = i;
    const { problem_id, verdict, account_id } = submissions[i];
    subCnt[problem_id][account_id]++;
    runs.push({
      id: id,
      team: getTeam(account_id),
      problem: problem_id,
      results: verdict === "ACCEPTED" ? "Yes" : "No - Wrong Answer",
    });
  }
  const results = {
    success: true,
    data: {
      time: {
        contestTime: 18000,
        noMoreUpdate: true,
        timestamp: 0,
      },
      runs: runs,
    },
    errors: null,
  };
  return results;
}

//runs.json form
/*
{
    "success": true,
    "data": {
        "time": {
            "contestTime": 18000,
            "noMoreUpdate": true,
            "timestamp": 0
        },
        "runs": [
            {
                "id": 0, 1, 2...
                "team": number
                "problem": number
                "results": status
                "submissionTime": number
            }
            ...
        ]
    }
    "error": null;
}
*/

app.get("/update-contest", async (req, res) => {
  try {
    await updateContest();
    res.send("Successfully updated contest.json")
  }
  catch (err) {
    res.status(500).send(`Internal Error: ${error}`)
  }
})

app.get("/update-runs", async function (req, res) {
  try {
    res.send("Successfully updated runs.json")
  }
  catch (err) {
    res.status(500).send(`Internal Error: ${error}`)
  }
  /*
  //fetch data from pdogs
  await fetch("https://be.pdogs.ntu.im/class/42/view/submission", {
    method: "GET",
    headers: {
      "auth-token":
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X2lkIjo0MTM4LCJleHBpcmUiOiIyMDIzLTAzLTI5VDE0OjQ2OjQwLjYyOTI1NyIsImNhY2hlZF91c2VybmFtZSI6Ilx1ODQ0OVx1NTNjOFx1OTI5OCJ9.R311TOAsS3A2_hMqFo8jHUUHeZgvBu_fpMdE0UlA-rM",
      Accept: "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const result = SubmissionToRuns({ ...data, subCnt });
      console.log(result);

      fs.writeFileSync("./tmp/runs.json", JSON.stringify(result));
      //res.json(result);
    });
    res.send("Successfully updated runs.json")
    */
});
/*
app.use(express.static('dist'))
*/

app.get('/', (req, res) => {
  res.send('Hello from PDAO system group!');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
