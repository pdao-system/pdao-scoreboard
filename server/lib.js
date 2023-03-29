import fetch from "node-fetch"
import { config } from "./config";
import { writeFileSync } from "fs";

export const updateContest = async () => {
    let contestData = {
        title: "2023 PDAO - Programming Design and Optimization",
        systemName: "PDOGS",
        systemVersion: "6",
        problems: [],
        teams: [],
    };
    const teamDataResponse = await fetchFromPdogs(config.teams_url);
    const teamDataPdogs = await teamDataResponse.json();
    const teams = []
    for (const [index, team] of teamDataPdogs.data.entries()) {
        if (team.label === "PDAO 2023 Spring" && team.is_deleted === false)
            teams.push({
                id: teams.length,
                name: team.name,
                pdogs_id: team.id
            })
    }
    contestData.teams = Array.from(teams);

    const problemDataResponse = await fetchFromPdogs(config.task_url);
    const problemDataPdogs = await problemDataResponse.json();
    const problems = []
    for (const [index, problem] of problemDataPdogs.data.problem.entries()) {
        if (problem.is_deleted === false) {
            problems.push({
                id: problems.length,
                name: problem.challenge_label,
                pdogs_id: problem.id
            })
        }
    }
    contestData.problems = Array.from(problems);
    writeFileSync(config.contest_json_path, contestData);
    return;
}

const fetchFromPdogs = async (endpoint_url) => {
    return fetch(url = endpoint_url,
        { headers: { "auth-token": config.jwt_token } })
}