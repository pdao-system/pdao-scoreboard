import fetch from "node-fetch"
import { config } from "./config.mjs";
import { readFileSync, writeFileSync } from "fs";

export const updateContest = async () => {
    let contestData = {
        title: "2023 PDAO - Programming Design and Optimization",
        systemName: "PDOGS",
        systemVersion: "6",
        problems: [],
        teams: [],
    };
    const teamDataResponse = await fetchFromPdogs(config.teams_url)
    const teamDataPdogs = await teamDataResponse.json();
    const teams = []
    for (const [index, team] of teamDataPdogs.data.data.entries()) {
        if (team.label === "PDAO 2022" && team.is_deleted === false) {
            const members = [];
            const teamData = await (await fetchFromPdogs(`https://be.pdogs.ntu.im/team/${team.id}/member`)).json()
            teamData.data.forEach(member => {
                members.push(member.member_id);
            });
            teams.push({
                id: teams.length,
                name: team.name,
                pdogs_id: team.id,
                members: Array.from(members)
            })
        }
    }
    contestData.teams = Array.from(teams);

    const problemDataResponse = await fetchFromPdogs(config.task_url);
    const problemDataPdogs = await problemDataResponse.json();
    const problems = []
    for (const [index, problem] of problemDataPdogs.data.problem.entries()) {
        if (problem.is_deleted === false) {
            problems.push({
                id: problems.length,
                name: problem.challenge_label.slice[-1],
                pdogs_id: problem.id,
                title: problem.title
            })
        }
    }
    contestData.problems = Array.from(problems);
    writeFileSync(config.contest_json_path, JSON.stringify(contestData));
    return;
};

const fetchFromPdogs = async (endpoint_url) => {
    return fetch(endpoint_url,
        { headers: { "auth-token": config.jwt_token } })
};

const getTeamFromUser = (user_id, contestData) => {
    for (const team of contestData.teams) {
        if (team.members.includes(user_id)) {
            return team.id;
        }
    }
}

export const updateRuns = async () => {
    let runsData = {
        times: {
            contestTime: 18000,
            noMoreUpdate: false,
            timestamp: 0
        },
        runs: []
    };
    const submissionsData = await (await fetchFromPdogs(config.submissions_url)).json();
    const contestData = JSON.parse(readFileSync(config.contest_json_path))
    let runs = []
    console.log(submissionsData.data.data.length)
    for (const submission of submissionsData.data.data) {
        if (submission.challenge_title === "PDAO") {
            let problemId = -1;
            for (const problem of contestData.problems) {
                if (submission.problem_id === problem.pdogs_id) {
                    problemId = problem.id;
                    break;
                }
            }
            runs.push({
                id: runs.length,
                team: getTeamFromUser(submission.account_id, contestData),
                problem: problemId,
                result: submission.verdict,
                submissionTime: submission.submit_time
            });
        }
    }
    runsData.runs = Array.from(runs);
    writeFileSync(config.runs_json_path, JSON.stringify(runsData));
    return;
};