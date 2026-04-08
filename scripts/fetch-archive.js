import path from 'path';
import fs from 'fs-extra';
import { map, find, fromPairs, mapValues } from 'lodash-es';
import { differenceInMinutes, differenceInDays } from 'date-fns';
import { Octokit } from '@octokit/rest';
import 'dotenv/config';

const ARCHIVE_FILENAME = 'node-cms-archive.json';
const LOCAL_ARCHIVE_PATH = `tmp/${ARCHIVE_FILENAME}`;
const GIST_ARCHIVE_DESCRIPTION = 'NODECMS.GUIDE DATA ARCHIVE';
const FIXTURE_PATH = 'test/fixtures/node-cms-archive.json';

let octokit;

// In-memory cache to avoid redundant fetches during the same build process
let memoryCache = null;

export function authenticate() {
  const token = process.env.NODE_CMS_GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'Environment variable NODE_CMS_GITHUB_TOKEN is not set. Please provide a valid GitHub token.'
    );
  }
  octokit = new Octokit({ auth: token });
  return octokit;
}

export function _setOctokitForTesting(instance) {
  octokit = instance;
}

export function _resetCacheForTesting() {
  memoryCache = null;
  octokit = undefined;
}

export async function getProjectGitHubData(repo) {
  try {
    const [owner, repoName] = repo.split('/');
    const { data } = await octokit.rest.repos.get({ owner, repo: repoName });
    const { stargazers_count, forks_count, open_issues_count } = data;
    return { stars: stargazers_count, forks: forks_count, issues: open_issues_count };
  } catch (error) {
    console.warn(
      `Failed to fetch GitHub data for repository "${repo}":`,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {};
  }
}

export async function getAllProjectGitHubData(repos) {
  const data = await Promise.all(
    repos.map(async (repo) => {
      const repoData = await getProjectGitHubData(repo);
      return [repo, repoData];
    })
  );
  return fromPairs(data);
}

export async function getAllProjectData(projects) {
  const timestamp = Date.now();
  const gitHubRepos = map(projects, 'repo').filter((val) => val);
  const gitHubReposData = await getAllProjectGitHubData(gitHubRepos);
  const data = projects.reduce((obj, { slug, repo }) => {
    const gitHubData = repo ? { ...gitHubReposData[repo] } : {};
    return { ...obj, [slug]: [{ timestamp, ...gitHubData }] };
  }, {});
  return { timestamp, data };
}

export async function getLocalArchive() {
  try {
    return await fs.readJson(path.join(process.cwd(), LOCAL_ARCHIVE_PATH));
  } catch {
    console.log('Local archive not found, fetching new data.');
  }
}

export function updateLocalArchive(data) {
  return fs.outputJson(path.join(process.cwd(), LOCAL_ARCHIVE_PATH), data);
}

export async function getArchive() {
  const gists = await octokit.paginate(octokit.rest.gists.list, { per_page: 100 });
  const gistArchive = find(gists, { description: GIST_ARCHIVE_DESCRIPTION });
  if (!gistArchive) {
    return;
  }
  const gistArchiveContent = await octokit.rest.gists.get({ gist_id: gistArchive.id });
  const archive = JSON.parse(gistArchiveContent.data.files[ARCHIVE_FILENAME].content);
  return { ...archive, id: gistArchive.id };
}

export function createGist(content) {
  return octokit.rest.gists.create({
    files: { [ARCHIVE_FILENAME]: { content } },
    public: true,
    description: GIST_ARCHIVE_DESCRIPTION,
  });
}

export function editGist(content, id) {
  return octokit.rest.gists.update({ gist_id: id, files: { [ARCHIVE_FILENAME]: { content } } });
}

export function removeOutdated(data, days) {
  return data.filter(({ timestamp }) => differenceInDays(Date.now(), timestamp) <= days);
}

export async function updateArchive({ timestamp, data }, archive) {
  const preppedData = archive
    ? {
        timestamp,
        data: mapValues({ ...archive.data, ...data }, (projectData, name) => {
          if (data[name]) {
            const projectArchive = removeOutdated(archive.data[name] || [], 30);
            return [...data[name], ...projectArchive];
          }
          return removeOutdated(projectData, 30);
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
export function archiveExpired(archive) {
  return differenceInMinutes(Date.now(), archive.timestamp) > 1410;
}

export async function run(projects) {
  // Fixture mode short-circuit for CI / tests — never touches Octokit.
  if (process.env.NODE_CMS_USE_FIXTURE === '1') {
    const fixture = await fs.readJson(path.join(process.cwd(), FIXTURE_PATH));
    return fixture.data;
  }

  // Return cached data if available (avoids redundant fetches during build)
  if (memoryCache) {
    return memoryCache;
  }

  const localArchive = await getLocalArchive();
  if (localArchive && !archiveExpired(localArchive)) {
    memoryCache = localArchive.data;
    return memoryCache;
  }

  // This is synchronous.
  authenticate();

  const archive = await getArchive();
  if (archive && !archiveExpired(archive)) {
    await updateLocalArchive(archive);
    memoryCache = archive.data;
    return memoryCache;
  }

  const projectData = await getAllProjectData(projects);
  const updatedArchive = await updateArchive(projectData, archive);
  await updateLocalArchive(updatedArchive);
  memoryCache = updatedArchive.data;
  return memoryCache;
}

export default run;
