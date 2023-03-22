
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require("fs")
app.use(cors())

// const updateRuns =  async ()=>{
//     url = "pdogs.backend";
//     res = await fetch(url);
//     result = process(res);
//     fs.writeFileSync(result, "./runs.json")
// }

const updateRuns = async ()=>{
    url = 'pdogs/backend'
    
}

app.get('/', (req, res) => {
    
    res.send('Hello World!');
})


function getTeam(account_id) {
    //TODO: find team with account_id 
    return "team id"
}




function SubmissionToRuns({data, subCnt}){
    
    const submissions = data.data; //An array storing the submission
    const runs = [];
    for(let i = 0; i < submissions.length; i++){
        const id = i;
        const {problem_id, verdict, account_id} = submissions[i];
        subCnt[problem_id][account_id]++;
        runs.push({
            "id": id,
            "team": getTeam(account_id),
            "problem": problem_id,
            "results": verdict === "ACCEPTED" ? "Yes": "No - Wrong Answer"
        })
    }
    const results = {
        "success": true,
        "data": {
            "time": {
                "contestTime": 18000,
                "noMoreUpdate": true,
                "timestamp": 0
            },
            "runs": runs,
        
        },
        "errors": null
    };
    return results
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





app.get('/get', async function (req, res) {
    //fetch data from pdogs
await fetch("https://be.pdogs.ntu.im/class/42/view/submission",{
    method: 'GET',
    headers: {
        'auth-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X2lkIjo0MTM4LCJleHBpcmUiOiIyMDIzLTAzLTI5VDE0OjQ2OjQwLjYyOTI1NyIsImNhY2hlZF91c2VybmFtZSI6Ilx1ODQ0OVx1NTNjOFx1OTI5OCJ9.R311TOAsS3A2_hMqFo8jHUUHeZgvBu_fpMdE0UlA-rM',
        'Accept': 'application/json'
    }}).then((response)=>{
        
        return response.json()
    }).then((data)=>{
        const result = SubmissionToRuns({...data, subCnt})
        console.log(result)
        
        
        fs.writeFile('./src/runs.json', JSON.stringify(result), function(err){
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
            
        
        res.json(result)
    })

})


const port = 4000;
app.listen(port, (req, res) => {
    console.log('listening on port ' + port);
});