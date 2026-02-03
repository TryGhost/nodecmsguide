import path from 'path';
import fs from 'fs-extra';
import { map, find, fromPairs, mapValues } from 'lodash-es';
import { differenceInMinutes, differenceInDays } from 'date-fns';
import { Octokit } from '@octokit/rest';
import 'dotenv/config';

const GITHUB_TOKEN = process.env.NODE_CMS_GITHUB_TOKEN;
const ARCHIVE_FILENAME = 'node-cms-archive.json';
const LOCAL_ARCHIVE_PATH = `tmp/${ARCHIVE_FILENAME}`;
const GIST_ARCHIVE_DESCRIPTION = 'NODECMS.GUIDE DATA ARCHIVE';

let octokit;

function authenticate() {
  if (!GITHUB_TOKEN) {
    throw new Error(
      'Environment variable NODE_CMS_GITHUB_TOKEN is not set. Please provide a valid GitHub token.'
    );
  }
  octokit = new Octokit({ auth: GITHUB_TOKEN });
}

async function getProjectGitHubData(repo) {
  try {
    const [owner, repoName] = repo.split('/');
    const { data } = await octokit.rest.repos.get({ owner, repo: repoName });
    const { stargazers_count, forks_count, open_issues_count } = data;
    return { stars: stargazers_count, forks: forks_count, issues: open_issues_count };
  } catch (error) {
    console.warn(
      `Failed to fetch GitHub data for repository "${repo}":`,
      error?.message || error
    );
    return { stars: 0, forks: 0, issues: 0 };
  }
}

async function getAllProjectGitHubData(repos) {
  const data = await Promise.all(
    repos.map(async (repo) => {
      const repoData = await getProjectGitHubData(repo);
      return [repo, repoData];
    })
  );
  return fromPairs(data);
}

async function getAllProjectData(projects) {
  const timestamp = Date.now();
  const gitHubRepos = map(projects, 'repo').filter((val) => val);
  const gitHubReposData = await getAllProjectGitHubData(gitHubRepos);
  const data = projects.reduce((obj, { slug, repo }) => {
    const gitHubData = repo ? { ...gitHubReposData[repo] } : {};
    return { ...obj, [slug]: [{ timestamp, ...gitHubData }] };
  }, {});
  return { timestamp, data };
}

async function getLocalArchive() {
  try {
    return await fs.readJson(path.join(process.cwd(), LOCAL_ARCHIVE_PATH));
  } catch {
    console.log('Local archive not found, fetching new data.');
  }
}

function updateLocalArchive(data) {
  return fs.outputJson(path.join(process.cwd(), LOCAL_ARCHIVE_PATH), data);
}

async function getArchive() {
  const gists = await octokit.rest.gists.list({ per_page: 100 });
  const gistArchive = find(gists.data, { description: GIST_ARCHIVE_DESCRIPTION });
  if (!gistArchive) {
    return;
  }
  const gistArchiveContent = await octokit.rest.gists.get({ gist_id: gistArchive.id });
  const archive = JSON.parse(gistArchiveContent.data.files[ARCHIVE_FILENAME].content);
  return { ...archive, id: gistArchive.id };
}

function createGist(content) {
  return octokit.rest.gists.create({
    files: { [ARCHIVE_FILENAME]: { content } },
    public: true,
    description: GIST_ARCHIVE_DESCRIPTION,
  });
}

function editGist(content, id) {
  return octokit.rest.gists.update({ gist_id: id, files: { [ARCHIVE_FILENAME]: { content } } });
}

function removeOutdated(data, days) {
  return data.filter(({ timestamp }) => differenceInDays(Date.now(), timestamp) <= days);
}

async function updateArchive({ timestamp, data }, archive) {
  const preppedData = archive
    ? {
        timestamp,
        data: mapValues(data, (projectData, name) => {
          const projectArchive = removeOutdated(archive.data[name] || [], 30);
          return [...projectData, ...projectArchive];
        }),
      }
    : { timestamp, data };
  const content = JSON.stringify(preppedData);
  if (archive) {
    await editGist(content, archive.id);
  } else {
    await createGist(content);
  }
  return preppedData;
}

/**
 * Check if archive is expired. Currently set to 1410 minutes, which is 30
 * minutes short of 24 hours, just in case a daily refresh webhook gets called
 * a little early.
 */
function archiveExpired(archive) {
  return differenceInMinutes(Date.now(), archive.timestamp) > 1410;
}

async function run(projects) {
  const localArchive = await getLocalArchive();
  if (localArchive && !archiveExpired(localArchive)) {
    return localArchive.data;
  }

  // This is synchronous.
  authenticate();

  const archive = await getArchive();
  if (archive && !archiveExpired(archive)) {
    await updateLocalArchive(archive);
    return archive.data;
  }

  const projectData = await getAllProjectData(projects);
  const updatedArchive = await updateArchive(projectData, archive);
  await updateLocalArchive(updatedArchive);
  return updatedArchive.data;
}

export default run;
