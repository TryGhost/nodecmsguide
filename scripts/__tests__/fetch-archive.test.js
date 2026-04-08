import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Hoisted mocks. `vi.hoisted` lets us define the shared stubs that
// `vi.mock` factories need without running into TDZ issues.
const { mockOctokitInstance, MockOctokit, mockFs } = vi.hoisted(() => {
  const instance = {
    rest: {
      repos: { get: vi.fn() },
      gists: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn() },
    },
    paginate: vi.fn(),
  };
  // Must be a regular function (not an arrow) so it can be used with `new`.
  // Returning an object from a constructor makes `new Ctor()` resolve to that
  // object, letting tests assert calls against a single shared instance.
  const Ctor = vi.fn(function MockOctokit() {
    return instance;
  });
  return {
    mockOctokitInstance: instance,
    MockOctokit: Ctor,
    mockFs: {
      readJson: vi.fn(),
      outputJson: vi.fn(),
    },
  };
});

vi.mock('@octokit/rest', () => ({ Octokit: MockOctokit }));
vi.mock('fs-extra', () => ({ default: mockFs, ...mockFs }));

// Import the module under test *after* the mocks are in place.
const fetchArchive = await import('../fetch-archive.js');
const {
  authenticate,
  _setOctokitForTesting,
  _resetCacheForTesting,
  getProjectGitHubData,
  getAllProjectGitHubData,
  getAllProjectData,
  getLocalArchive,
  updateLocalArchive,
  getArchive,
  createGist,
  editGist,
  removeOutdated,
  updateArchive,
  archiveExpired,
  run,
  default: defaultRun,
} = fetchArchive;

function resetAllMocks() {
  mockOctokitInstance.rest.repos.get.mockReset();
  mockOctokitInstance.rest.gists.list.mockReset();
  mockOctokitInstance.rest.gists.get.mockReset();
  mockOctokitInstance.rest.gists.create.mockReset();
  mockOctokitInstance.rest.gists.update.mockReset();
  mockOctokitInstance.paginate.mockReset();
  MockOctokit.mockClear();
  mockFs.readJson.mockReset();
  mockFs.outputJson.mockReset();
}

beforeEach(() => {
  resetAllMocks();
  _resetCacheForTesting();
  _setOctokitForTesting(mockOctokitInstance);
  delete process.env.NODE_CMS_USE_FIXTURE;
  process.env.NODE_CMS_GITHUB_TOKEN = 'test-token';
  // Silence console output from warn/log.
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('authenticate', () => {
  it('throws when NODE_CMS_GITHUB_TOKEN is not set', () => {
    delete process.env.NODE_CMS_GITHUB_TOKEN;
    expect(() => authenticate()).toThrow(/NODE_CMS_GITHUB_TOKEN/);
  });

  it('constructs an Octokit instance when token is set', () => {
    process.env.NODE_CMS_GITHUB_TOKEN = 'abc';
    const instance = authenticate();
    expect(MockOctokit).toHaveBeenCalledWith({ auth: 'abc' });
    expect(instance).toBe(mockOctokitInstance);
  });
});

describe('removeOutdated', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  it('returns an empty array when given an empty array', () => {
    expect(removeOutdated([], 30)).toEqual([]);
  });

  it('keeps entries exactly N days old (<= boundary)', () => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const data = [{ timestamp: now - thirtyDays }];
    expect(removeOutdated(data, 30)).toHaveLength(1);
  });

  it('drops entries older than N days', () => {
    const now = Date.now();
    const thirtyOneDays = 31 * 24 * 60 * 60 * 1000;
    const data = [{ timestamp: now - thirtyOneDays }];
    expect(removeOutdated(data, 30)).toHaveLength(0);
  });

  it('keeps recent entries', () => {
    const now = Date.now();
    const data = [{ timestamp: now }, { timestamp: now - 1000 }];
    expect(removeOutdated(data, 30)).toHaveLength(2);
  });
});

describe('archiveExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  it('returns false when archive is fresh', () => {
    expect(archiveExpired({ timestamp: Date.now() - 60 * 1000 })).toBe(false);
  });

  it('returns false exactly at the 1410 minute boundary', () => {
    const ts = Date.now() - 1410 * 60 * 1000;
    expect(archiveExpired({ timestamp: ts })).toBe(false);
  });

  it('returns true when older than 1410 minutes', () => {
    const ts = Date.now() - 1411 * 60 * 1000;
    expect(archiveExpired({ timestamp: ts })).toBe(true);
  });
});

describe('updateArchive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  it('creates a new gist when no archive exists', async () => {
    mockOctokitInstance.rest.gists.create.mockResolvedValue({ data: { id: 'new-id' } });
    const newData = {
      timestamp: Date.now(),
      data: { ghost: [{ timestamp: Date.now(), stars: 10, forks: 2, issues: 1 }] },
    };

    const result = await updateArchive(newData, undefined);

    expect(mockOctokitInstance.rest.gists.create).toHaveBeenCalledOnce();
    expect(mockOctokitInstance.rest.gists.update).not.toHaveBeenCalled();
    expect(result).toEqual(newData);
  });

  it('edits the existing gist when an archive is provided', async () => {
    mockOctokitInstance.rest.gists.update.mockResolvedValue({});
    const now = Date.now();
    const newData = {
      timestamp: now,
      data: { ghost: [{ timestamp: now, stars: 11, forks: 2, issues: 1 }] },
    };
    const archive = {
      id: 'existing-gist',
      timestamp: now - 24 * 60 * 60 * 1000,
      data: {
        ghost: [{ timestamp: now - 24 * 60 * 60 * 1000, stars: 10, forks: 2, issues: 1 }],
      },
    };

    await updateArchive(newData, archive);

    expect(mockOctokitInstance.rest.gists.update).toHaveBeenCalledOnce();
    expect(mockOctokitInstance.rest.gists.update.mock.calls[0][0].gist_id).toBe('existing-gist');
  });

  // REGRESSION TEST for PR #183: when only project A has new data, projects
  // B and C must remain in the merged archive instead of being wiped out.
  it('preserves archive entries for projects with no new data (PR #183 regression)', async () => {
    mockOctokitInstance.rest.gists.update.mockResolvedValue({});
    const now = Date.now();
    const yesterday = now - 24 * 60 * 60 * 1000;

    const newData = {
      timestamp: now,
      // Only project A has new data this run.
      data: { a: [{ timestamp: now, stars: 100, forks: 5, issues: 1 }] },
    };
    const archive = {
      id: 'gist-id',
      timestamp: yesterday,
      data: {
        a: [{ timestamp: yesterday, stars: 90, forks: 4, issues: 1 }],
        b: [{ timestamp: yesterday, stars: 200, forks: 20, issues: 2 }],
        c: [{ timestamp: yesterday, stars: 300, forks: 30, issues: 3 }],
      },
    };

    const result = await updateArchive(newData, archive);

    expect(Object.keys(result.data).sort()).toEqual(['a', 'b', 'c']);
    // A should have the new data point prepended, and the historical one retained.
    expect(result.data.a).toHaveLength(2);
    expect(result.data.a[0].stars).toBe(100);
    expect(result.data.a[1].stars).toBe(90);
    // B and C must still be present with their archived data.
    expect(result.data.b).toHaveLength(1);
    expect(result.data.b[0].stars).toBe(200);
    expect(result.data.c).toHaveLength(1);
    expect(result.data.c[0].stars).toBe(300);
  });

  it('prunes outdated entries beyond 30 days from archived projects', async () => {
    mockOctokitInstance.rest.gists.update.mockResolvedValue({});
    const now = Date.now();
    const fortyDays = 40 * 24 * 60 * 60 * 1000;
    const tenDays = 10 * 24 * 60 * 60 * 1000;

    const newData = {
      timestamp: now,
      data: { a: [{ timestamp: now, stars: 100 }] },
    };
    const archive = {
      id: 'gid',
      timestamp: now - tenDays,
      data: {
        a: [
          { timestamp: now - tenDays, stars: 95 },
          { timestamp: now - fortyDays, stars: 50 }, // too old — drop
        ],
        b: [
          { timestamp: now - tenDays, stars: 200 },
          { timestamp: now - fortyDays, stars: 100 }, // too old — drop
        ],
      },
    };

    const result = await updateArchive(newData, archive);
    // A: new point + 10-day-old archived point (40-day one pruned)
    expect(result.data.a).toHaveLength(2);
    expect(result.data.a.every((d) => d.stars !== 50)).toBe(true);
    // B: only the 10-day-old point remains (40-day pruned)
    expect(result.data.b).toHaveLength(1);
    expect(result.data.b[0].stars).toBe(200);
  });

  it('merges into archive.data[name] || [] when a new project appears with no archive history', async () => {
    mockOctokitInstance.rest.gists.update.mockResolvedValue({});
    const now = Date.now();
    const newData = {
      timestamp: now,
      data: { brandnew: [{ timestamp: now, stars: 5 }] },
    };
    const archive = {
      id: 'g',
      timestamp: now,
      data: { existing: [{ timestamp: now, stars: 1 }] },
    };

    const result = await updateArchive(newData, archive);
    expect(result.data.brandnew).toEqual([{ timestamp: now, stars: 5 }]);
    expect(result.data.existing).toEqual([{ timestamp: now, stars: 1 }]);
  });
});

describe('getProjectGitHubData', () => {
  it('returns stars/forks/issues on success', async () => {
    mockOctokitInstance.rest.repos.get.mockResolvedValue({
      data: { stargazers_count: 42, forks_count: 7, open_issues_count: 3 },
    });
    const result = await getProjectGitHubData('owner/repo');
    expect(result).toEqual({ stars: 42, forks: 7, issues: 3 });
    expect(mockOctokitInstance.rest.repos.get).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('returns {} on Error', async () => {
    mockOctokitInstance.rest.repos.get.mockRejectedValue(new Error('not found'));
    const result = await getProjectGitHubData('owner/missing');
    expect(result).toEqual({});
    expect(console.warn).toHaveBeenCalled();
  });

  it('returns {} on non-Error throw (unknown error branch)', async () => {
    mockOctokitInstance.rest.repos.get.mockRejectedValue('string error');
    const result = await getProjectGitHubData('owner/x');
    expect(result).toEqual({});
  });
});

describe('getAllProjectGitHubData', () => {
  it('maps each repo to its data', async () => {
    mockOctokitInstance.rest.repos.get.mockImplementation(async ({ repo }) => ({
      data: {
        stargazers_count: repo === 'one' ? 1 : 2,
        forks_count: 0,
        open_issues_count: 0,
      },
    }));
    const result = await getAllProjectGitHubData(['a/one', 'a/two']);
    expect(result).toEqual({
      'a/one': { stars: 1, forks: 0, issues: 0 },
      'a/two': { stars: 2, forks: 0, issues: 0 },
    });
  });
});

describe('getAllProjectData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  it('builds a timestamped payload for projects with repos', async () => {
    mockOctokitInstance.rest.repos.get.mockResolvedValue({
      data: { stargazers_count: 10, forks_count: 1, open_issues_count: 0 },
    });
    const result = await getAllProjectData([
      { slug: 'ghost', repo: 'TryGhost/Ghost' },
      { slug: 'closed', repo: undefined },
    ]);
    expect(result.timestamp).toBe(Date.now());
    expect(result.data.ghost).toEqual([
      { timestamp: Date.now(), stars: 10, forks: 1, issues: 0 },
    ]);
    // Projects without a repo get an entry with only a timestamp.
    expect(result.data.closed).toEqual([{ timestamp: Date.now() }]);
  });

  it('handles a repo that fails to fetch', async () => {
    mockOctokitInstance.rest.repos.get.mockRejectedValue(new Error('boom'));
    const result = await getAllProjectData([{ slug: 'x', repo: 'a/b' }]);
    expect(result.data.x).toEqual([{ timestamp: Date.now() }]);
  });
});

describe('getArchive', () => {
  it('returns parsed archive when gist is found', async () => {
    const archiveContent = { timestamp: 123, data: { ghost: [] } };
    mockOctokitInstance.paginate.mockResolvedValue([
      { id: 'gid', description: 'NODECMS.GUIDE DATA ARCHIVE' },
      { id: 'other', description: 'something else' },
    ]);
    mockOctokitInstance.rest.gists.get.mockResolvedValue({
      data: {
        files: {
          'node-cms-archive.json': { content: JSON.stringify(archiveContent) },
        },
      },
    });

    const result = await getArchive();
    expect(result).toEqual({ ...archiveContent, id: 'gid' });
    expect(mockOctokitInstance.rest.gists.get).toHaveBeenCalledWith({ gist_id: 'gid' });
  });

  it('returns undefined when no matching gist exists', async () => {
    mockOctokitInstance.paginate.mockResolvedValue([{ id: 'x', description: 'nope' }]);
    const result = await getArchive();
    expect(result).toBeUndefined();
    expect(mockOctokitInstance.rest.gists.get).not.toHaveBeenCalled();
  });
});

describe('createGist / editGist', () => {
  it('createGist forwards file content with the right description', async () => {
    mockOctokitInstance.rest.gists.create.mockResolvedValue({ data: {} });
    await createGist('{"a":1}');
    expect(mockOctokitInstance.rest.gists.create).toHaveBeenCalledWith({
      files: { 'node-cms-archive.json': { content: '{"a":1}' } },
      public: true,
      description: 'NODECMS.GUIDE DATA ARCHIVE',
    });
  });

  it('editGist forwards gist_id and new file content', async () => {
    mockOctokitInstance.rest.gists.update.mockResolvedValue({ data: {} });
    await editGist('{"b":2}', 'gid');
    expect(mockOctokitInstance.rest.gists.update).toHaveBeenCalledWith({
      gist_id: 'gid',
      files: { 'node-cms-archive.json': { content: '{"b":2}' } },
    });
  });
});

describe('getLocalArchive / updateLocalArchive', () => {
  it('getLocalArchive returns the JSON payload on success', async () => {
    const payload = { timestamp: 1, data: {} };
    mockFs.readJson.mockResolvedValue(payload);
    const result = await getLocalArchive();
    expect(result).toBe(payload);
  });

  it('getLocalArchive returns undefined when the file is missing', async () => {
    mockFs.readJson.mockRejectedValue(new Error('ENOENT'));
    const result = await getLocalArchive();
    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalled();
  });

  it('updateLocalArchive writes JSON via fs-extra', async () => {
    mockFs.outputJson.mockResolvedValue(undefined);
    await updateLocalArchive({ foo: 'bar' });
    expect(mockFs.outputJson).toHaveBeenCalledOnce();
    const [, data] = mockFs.outputJson.mock.calls[0];
    expect(data).toEqual({ foo: 'bar' });
  });
});

describe('run', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  it('is the default export', () => {
    expect(defaultRun).toBe(run);
  });

  it('fixture mode short-circuits without touching Octokit', async () => {
    process.env.NODE_CMS_USE_FIXTURE = '1';
    const fixture = {
      timestamp: 9999,
      data: { ghost: [{ timestamp: 9999, stars: 1, forks: 1, issues: 1 }] },
    };
    mockFs.readJson.mockResolvedValue(fixture);

    const result = await run([]);

    expect(result).toEqual(fixture.data);
    expect(mockOctokitInstance.paginate).not.toHaveBeenCalled();
    expect(mockOctokitInstance.rest.repos.get).not.toHaveBeenCalled();
    expect(mockOctokitInstance.rest.gists.create).not.toHaveBeenCalled();
    // Fixture mode reads the fixture file path.
    expect(mockFs.readJson.mock.calls[0][0]).toMatch(/test\/fixtures\/node-cms-archive\.json$/);
  });

  it('returns the in-memory cache on subsequent calls', async () => {
    // Prime the cache via a fresh local archive.
    mockFs.readJson.mockResolvedValue({
      timestamp: Date.now(),
      data: { cached: [{ timestamp: Date.now(), stars: 1 }] },
    });
    const first = await run([]);
    expect(first.cached).toBeDefined();

    // Reset mocks — if run() hits them, the test fails.
    mockFs.readJson.mockReset();
    mockOctokitInstance.paginate.mockReset();

    const second = await run([]);
    expect(second).toBe(first);
    expect(mockFs.readJson).not.toHaveBeenCalled();
  });

  it('returns local archive data when cache is fresh', async () => {
    const data = { ghost: [{ timestamp: Date.now(), stars: 5 }] };
    mockFs.readJson.mockResolvedValue({ timestamp: Date.now(), data });

    const result = await run([]);

    expect(result).toBe(data);
    expect(MockOctokit).not.toHaveBeenCalled();
  });

  it('falls through to gist archive when local is missing and gist is fresh', async () => {
    mockFs.readJson.mockRejectedValue(new Error('ENOENT'));
    mockFs.outputJson.mockResolvedValue(undefined);

    const gistData = { ghost: [{ timestamp: Date.now(), stars: 10 }] };
    mockOctokitInstance.paginate.mockResolvedValue([
      { id: 'gid', description: 'NODECMS.GUIDE DATA ARCHIVE' },
    ]);
    mockOctokitInstance.rest.gists.get.mockResolvedValue({
      data: {
        files: {
          'node-cms-archive.json': {
            content: JSON.stringify({ timestamp: Date.now(), data: gistData }),
          },
        },
      },
    });

    const result = await run([]);

    expect(result).toEqual(gistData);
    expect(mockFs.outputJson).toHaveBeenCalledOnce();
    expect(MockOctokit).toHaveBeenCalledWith({ auth: 'test-token' });
  });

  it('performs a full fetch when there is no fresh cache and no gist', async () => {
    mockFs.readJson.mockRejectedValue(new Error('ENOENT'));
    mockFs.outputJson.mockResolvedValue(undefined);
    mockOctokitInstance.paginate.mockResolvedValue([]); // no gist
    mockOctokitInstance.rest.repos.get.mockResolvedValue({
      data: { stargazers_count: 1, forks_count: 2, open_issues_count: 3 },
    });
    mockOctokitInstance.rest.gists.create.mockResolvedValue({ data: { id: 'new' } });

    const result = await run([{ slug: 'ghost', repo: 'TryGhost/Ghost' }]);

    expect(result.ghost).toHaveLength(1);
    expect(result.ghost[0]).toMatchObject({ stars: 1, forks: 2, issues: 3 });
    expect(mockOctokitInstance.rest.gists.create).toHaveBeenCalledOnce();
    expect(mockFs.outputJson).toHaveBeenCalledOnce();
  });

  it('refreshes when the local cache is expired', async () => {
    const staleTs = Date.now() - 2000 * 60 * 1000; // 2000 minutes ago — beyond 1410
    mockFs.readJson.mockResolvedValue({ timestamp: staleTs, data: { old: [] } });
    mockFs.outputJson.mockResolvedValue(undefined);

    // Gist is also stale, so we go to full fetch.
    mockOctokitInstance.paginate.mockResolvedValue([
      { id: 'gid', description: 'NODECMS.GUIDE DATA ARCHIVE' },
    ]);
    mockOctokitInstance.rest.gists.get.mockResolvedValue({
      data: {
        files: {
          'node-cms-archive.json': {
            content: JSON.stringify({ timestamp: staleTs, data: { old: [] } }),
          },
        },
      },
    });
    mockOctokitInstance.rest.repos.get.mockResolvedValue({
      data: { stargazers_count: 7, forks_count: 0, open_issues_count: 0 },
    });
    mockOctokitInstance.rest.gists.update.mockResolvedValue({ data: {} });

    const result = await run([{ slug: 'fresh', repo: 'a/b' }]);

    expect(result.fresh).toBeDefined();
    expect(mockOctokitInstance.rest.gists.update).toHaveBeenCalled();
  });
});
