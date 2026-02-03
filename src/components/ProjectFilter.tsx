import { useState, useMemo } from 'react';
import { sortBy, reverse, find, difference, filter as lodashFilter, get, isString } from 'lodash-es';

interface Project {
  title: string;
  slug: string;
  openSource: boolean;
  type: string;
  generators: string[];
  description: string;
  stars?: number;
  starsPrevious?: number;
  forks?: number;
  forksPrevious?: number;
  issues?: number;
  issuesPrevious?: number;
  images?: { path: string }[];
  dataAgeInDays?: number;
  homepage: string;
  repo?: string;
}

interface ProjectFilterProps {
  projects: Project[];
  types: string[];
  generators: string[];
}

interface SortOption {
  name: string;
  label: string;
  group?: string;
  reverse?: boolean;
  filterBy?: string;
  compute?: (p: Project) => number;
}

const SORT_GROUPS = [
  { name: 'trending', label: 'Trending' },
  { name: 'total', label: 'Total' },
];

const SORTS: SortOption[] = [
  { name: 'title', label: 'Title' },
  { name: 'stars', label: 'GitHub stars', group: 'total', reverse: true },
  {
    name: 'starsTrending',
    label: 'GitHub stars (7 days)',
    group: 'trending',
    reverse: true,
    filterBy: 'stars',
    compute: (p: Project) => (p.stars || 0) - (p.starsPrevious || 0),
  },
];

const LICENSES = ['Open source', 'Closed source'];

interface DropdownProps {
  emptyLabel?: string;
  options: (string | SortOption)[];
  groups?: { name: string; label: string }[];
  selection: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function Dropdown({ emptyLabel, options, groups, selection, onChange }: DropdownProps) {
  return (
    <div className="dropdown">
      <select value={selection} className="dropdown-select" onChange={onChange}>
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {options
          .filter((opt) => isString(opt) || !(opt as SortOption).group)
          .map((value, key) =>
            isString(value) ? (
              <option key={key} value={value}>
                {value}
              </option>
            ) : (
              <option key={key} value={(value as SortOption).name}>
                {(value as SortOption).label}
              </option>
            )
          )}
        {groups &&
          groups.map((group, idx) => (
            <optgroup key={idx} label={group.label}>
              {options
                .filter((opt) => get(opt, 'group') === group.name)
                .map((value, key) => (
                  <option key={key} value={(value as SortOption).name}>
                    {(value as SortOption).label}
                  </option>
                ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
}

function formatNumber(num: number | undefined): string {
  if (typeof num !== 'number') return 'N/A';
  return num.toLocaleString('en-US');
}

function getChange(current: number | undefined, previous: number): string {
  if (typeof current !== 'number') return '';
  const diff = current - previous;
  if (diff === 0) return '--';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const {
    title,
    slug,
    openSource,
    type,
    generators = [],
    description,
    stars,
    starsPrevious = 0,
    forks,
    forksPrevious = 0,
    issues,
    issuesPrevious = 0,
    images,
    dataAgeInDays = 0,
  } = project;

  const starsChange = getChange(stars, starsPrevious);
  const forksChange = getChange(forks, forksPrevious);
  const issuesChange = getChange(issues, issuesPrevious);
  const hasStats = typeof stars === 'number' || typeof forks === 'number' || typeof issues === 'number';

  return (
    <a href={`/projects/${slug}`} className="card">
      {openSource && <div className="tag">open source</div>}
      {images && images.length > 0 && <img alt="" className="photos-inside" src="/images/photos.svg" />}
      <h4 className={`title ${title.length > 14 ? 'title-small' : ''}`}>{title}</h4>

      {hasStats && (
        <div className="open-source-stats">
          <div className={`stat-item ${typeof stars !== 'number' ? 'disabled' : ''}`} title="GitHub stars">
            <span className="stat-icon">
              <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
              </svg>
            </span>
            {typeof stars === 'number' ? (
              <div>
                <strong>{formatNumber(stars)}</strong>
                {dataAgeInDays >= 1 && (
                  <span
                    className={`change ${Number(starsChange) > 0 ? 'up' : ''} ${Number(starsChange) < 0 ? 'down' : ''}`}
                    title={`Stars in the last ${dataAgeInDays} day${dataAgeInDays === 1 ? '' : 's'}`}
                  >
                    {starsChange}
                  </span>
                )}
              </div>
            ) : (
              <div>N/A</div>
            )}
          </div>

          <div className={`stat-item ${typeof issues !== 'number' ? 'disabled' : ''}`} title="GitHub open issues">
            <span className="stat-icon">
              <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                <path
                  fillRule="evenodd"
                  d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"
                ></path>
              </svg>
            </span>
            {typeof issues === 'number' ? (
              <div>
                <strong>{formatNumber(issues)}</strong>
                {dataAgeInDays >= 1 && (
                  <span className="change" title={`Issues in the last ${dataAgeInDays} day${dataAgeInDays === 1 ? '' : 's'}`}>
                    {issuesChange}
                  </span>
                )}
              </div>
            ) : (
              <div>N/A</div>
            )}
          </div>

          <div className={`stat-item ${typeof forks !== 'number' ? 'disabled' : ''}`} title="GitHub forks">
            <span className="stat-icon">
              <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
                ></path>
              </svg>
            </span>
            {typeof forks === 'number' ? (
              <div>
                <strong>{formatNumber(forks)}</strong>
                {dataAgeInDays >= 1 && (
                  <span
                    className={`change ${Number(forksChange) > 0 ? 'up' : ''} ${Number(forksChange) < 0 ? 'down' : ''}`}
                    title={`Forks in the last ${dataAgeInDays} day${dataAgeInDays === 1 ? '' : 's'}`}
                  >
                    {forksChange}
                  </span>
                )}
              </div>
            ) : (
              <div>N/A</div>
            )}
          </div>
        </div>
      )}

      <div className="description">{description}</div>

      <div className="data-point">
        <h6 className="data-point-title">Type:</h6>
        <p className="type">{type || 'Unknown'}</p>
      </div>

      <div className="data-point">
        <h6 className="data-point-title">Supported Site Generators:</h6>
        <p>{generators.join(', ')}</p>
      </div>

    </a>
  );
}

function StaticGenPromo() {
  return (
    <li className="project staticgen-promo">
      <h3>
        Also visit{' '}
        <a href="https://www.headlesscms.org" rel="noopener noreferrer" target="_blank">
          headlesscms.org
        </a>{' '}
        for a ranked list of headless content management systems!
      </h3>
    </li>
  );
}

export default function ProjectFilter({ projects, types, generators }: ProjectFilterProps) {
  const [filter, setFilter] = useState<{ type?: string; ssg?: string; license?: string }>({});
  const [sort, setSort] = useState('stars');

  const visibleProjects = useMemo(() => {
    const canShow = (project: Project) => {
      const { license, ssg, type } = filter;
      const shouldHide =
        (license === 'Open source' && !project.openSource) ||
        (license === 'Closed source' && project.openSource) ||
        (ssg && !project.generators.includes(ssg) && !project.generators.includes('All')) ||
        (type && project.type !== type);
      return !shouldHide;
    };

    const sortProjects = (projectList: Project[]) => {
      const sortObj = find(SORTS, { name: sort }) || ({} as SortOption);
      const sorted = sortBy(projectList, sortObj.compute || sortObj.name);

      if (sortObj.reverse) {
        const withSort = lodashFilter(sorted, sortObj.filterBy || sortObj.name);
        const withoutSort = difference(sorted, withSort);
        return [...reverse(withSort), ...withoutSort];
      }

      return sorted;
    };

    return sortProjects(projects.filter(canShow));
  }, [projects, filter, sort]);

  const handleFilterChange = (filterName: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({
      ...filter,
      [filterName]: event.target.value,
    });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
  };

  const shouldUseLicenseSections = !filter.license && sort.startsWith('stars');

  const renderProjects = () => {
    if (shouldUseLicenseSections) {
      const openSourceProjects = visibleProjects.filter(({ openSource }) => openSource);
      const closedSourceProjects = visibleProjects.filter(({ openSource }) => !openSource);

      return (
        <div>
          <div className="clearfix">
            <h2 className="license-section-header">Open source</h2>
            <ul className="projects">
              {openSourceProjects.slice(0, 3).map((project) => (
                <li key={project.slug} className="project">
                  <ProjectCard project={project} />
                </li>
              ))}
              <StaticGenPromo />
              {openSourceProjects.slice(3).map((project) => (
                <li key={project.slug} className="project">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
          <div className="clearfix">
            <h2 className="license-section-header">Closed source</h2>
            <ul className="projects">
              {closedSourceProjects.map((project) => (
                <li key={project.slug} className="project">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div>
        <ul className="projects">
          {visibleProjects.slice(0, 3).map((project) => (
            <li key={project.slug} className="project">
              <ProjectCard project={project} />
            </li>
          ))}
          <StaticGenPromo />
          {visibleProjects.slice(3).map((project) => (
            <li key={project.slug} className="project">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="main landing">
      <div className="projects-sort-filter-toolbar">
        <div className="projects-filters">
          <div className="control-label">Filter</div>
          <Dropdown
            emptyLabel="Any CMS Type"
            options={types}
            selection={filter.type || ''}
            onChange={handleFilterChange('type')}
          />
          <Dropdown
            emptyLabel="Any SSG"
            options={generators}
            selection={filter.ssg || ''}
            onChange={handleFilterChange('ssg')}
          />
          <Dropdown
            emptyLabel="Any License"
            options={LICENSES}
            selection={filter.license || ''}
            onChange={handleFilterChange('license')}
          />
        </div>
        <div className="projects-sort">
          <div className="control-label">Sort</div>
          <Dropdown options={SORTS} groups={SORT_GROUPS} selection={sort} onChange={handleSortChange} />
        </div>
      </div>

      {renderProjects()}
    </div>
  );
}
