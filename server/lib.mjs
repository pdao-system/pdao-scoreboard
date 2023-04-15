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
    let pdogsTeams = []
    let newRead = 0;
    do {
        const teamDataPdogs = await (await fetchFromPdogs(`${config.teams_url}?offset=${pdogsTeams.length}`)).json();
        const newTeams = Array.from(teamDataPdogs.data.data);
        pdogsTeams.push(...newTeams);
        newRead = newTeams.length;
    } while (newRead != 0)
    const teams = [];
    for (const [index, team] of pdogsTeams.entries()) {
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
    const pdogsProblems = Array.from(problemDataPdogs.data.problem);
    pdogsProblems.sort((l, r) => { return l.challenge_label.localeCompare(r.challenge_label) })
    //console.log(problems)
    const problems = []
    for (const [index, problem] of pdogsProblems.entries()) {
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
    const submissionsData = await (await fetchFromPdogs(config.submissions_url)).json();
    const contestData = JSON.parse(readFileSync(config.contest_json_path))
    let runsData = {
        times: {
            contestTime: submissionsData.data.time.contestTime,
            noMoreUpdate: submissionsData.data.time.noMoreUpdate,
            timestamp: submissionsData.data.time.timestamp
        },
        runs: []
    };
    let runs = []
    console.log(submissionsData)
    for (const submission of submissionsData.data.runs) {
        let problemId = -1;
        for (const problem of contestData.problems) {
            if (submission.problem === problem.pdogs_id) {
                problemId = problem.id;
                break;
            }
        }
        let teamId = -1;
        for (const team of contestData.teams) {
            if (submission.team === team.pdogs_id) {
                teamId = team.id;
                break;
            }
        }
        runs.push({
            id: runs.length,
            team: teamId,
            problem: problemId,
            result: submission.result,
            submissionTime: submission.submissionTime
        });
    }
    runsData.runs = Array.from(runs);
    writeFileSync(config.runs_json_path, JSON.stringify(runsData));
    return;
};