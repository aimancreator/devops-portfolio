import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Terminal,
  GitBranch,
  Server,
  Layers,
  Search,
  Check,
  Copy,
  Cpu,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import snapshot from '@/lib/portfolio.json';

export default function PortfolioPage({
  page = 'home',
}: {
  page?: 'home' | 'projects' | 'approach' | 'about';
}) {
  const [apiBase, setApiBase] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    fetch('/config.json', { cache: 'no-store', signal: controller.signal }).then(r => { if (!r.ok) throw Error(); return r.json(); }).then((config: {apiUrl?: string}) => {
      const value = config.apiUrl || (import.meta.env.DEV ? import.meta.env.VITE_API_URL : '') || '';
      if (!value) { setApiBase(''); return; }
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw Error();
      setApiBase(value.replace(/\/+$/, ''));
    }).catch(() => setApiBase('')).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);
  const [filter, setFilter] = useState('All projects');
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState(snapshot.projects);
  const [status, setStatus] = useState('Checking API');
  const [skills, setSkills] = useState(snapshot.skills);
  const [skillsStatus, setSkillsStatus] = useState('Checking skills API');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const base = apiBase;
    if (base === null) return;
    if (!base) {
      setStatus('Repository snapshot');
      clearTimeout(timer);
      return;
    }
    fetch(`${base}/api/projects`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((raw) => {
        const data = raw as { projects: typeof snapshot.projects };
        if (
          !data ||
          !Array.isArray(data.projects) ||
          !data.projects.every(
            (p: (typeof snapshot.projects)[number]) =>
              p &&
              typeof p.id === 'string' &&
              typeof p.title === 'string' &&
              typeof p.description === 'string' &&
              typeof p.category === 'string' &&
              Array.isArray(p.tags) &&
              p.tags.every((t) => typeof t === 'string') &&
              Array.isArray(p.architecture) &&
              p.architecture.every((t) => typeof t === 'string') &&
              typeof p.details === 'string' &&
              typeof p.operations === 'string' &&
              typeof p.url === 'string' &&
              p.url.startsWith('https://github.com/aimancreator/'),
          )
        )
          throw Error();
        setProjects(data.projects);
        setStatus('API connected');
      })
      .catch(() => setStatus('Offline · repository snapshot'))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [apiBase]);
  useEffect(() => {
    const base = apiBase;
    if (base === null) return;
    if (!base) {
      setSkillsStatus('Repository snapshot');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetch(`${base}/api/skills`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((raw) => {
        const data = raw as { skills: typeof snapshot.skills };
        if (
          !data ||
          !Array.isArray(data.skills) ||
          !data.skills.every(
            (s) =>
              s &&
              typeof s.name === 'string' &&
              typeof s.category === 'string' &&
              typeof s.description === 'string',
          )
        )
          throw Error();
        setSkills(data.skills);
        setSkillsStatus('Skills from API');
      })
      .catch(() => setSkillsStatus('Offline · saved skills'))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [apiBase]);
  const visible = projects.filter(
    (p) =>
      (filter === 'All projects' || p.category === filter) &&
      `${p.title} ${p.description} ${p.tags.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText('https://github.com/aimancreator');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Terminal size={19} />
          </span>
          aiman<span className="muted"> / devops</span>
        </a>
        <nav aria-label="Main navigation">
          {[
            { path: '/', label: 'Home', id: 'home' },
            { path: '/projects', label: 'Projects', id: 'projects' },
            { path: '/approach', label: 'Approach', id: 'approach' },
            { path: '/about', label: 'About', id: 'about' },
          ].map((item) => (
            <a
              key={item.id}
              href={item.path}
              aria-current={page === item.id ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="github-link"
          href="https://github.com/aimancreator"
          target="_blank"
          rel="noreferrer"
        >
          <GitBranch size={17} />
          <span>GitHub</span>
          <ArrowUpRight size={15} />
        </a>
      </header>
      <main id="main">
        {page === 'home' && (
          <>
            <section className="hero">
              <div>
                <div className="eyebrow">
                  <span className="dot" /> CLOUD INFRASTRUCTURE & AUTOMATION
                </div>
                <h1>
                  From local ideas.
                  <br />
                  To <span>cloud execution.</span>
                </h1>
                <p className="hero-copy">
                  I’m Aiman. I build Python tools and cloud GPU workflows,
                  connecting useful interfaces to the infrastructure that runs
                  them.
                </p>
                <div className="hero-actions">
                  <a className="primary-link" href="/projects">
                    Explore my work <ArrowRight size={17} />
                  </a>
                  <a
                    className="text-link"
                    href="https://github.com/aimancreator"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View GitHub <ArrowUpRight size={16} />
                  </a>
                </div>
                <div className="hero-foot">
                  <span>Python-first</span>
                  <span>Cloud-connected</span>
                  <span>Built in public</span>
                </div>
              </div>
              <div className="terminal">
                <div className="terminal-bar">
                  <div className="window-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>aiman@workspace: ~</span>
                  <Terminal size={14} />
                </div>
                <div className="terminal-body">
                  <p>
                    <b>❯</b> cat engineering.yaml
                  </p>
                  <div className="code">
                    <p>
                      <span>engineer:</span> aimancreator
                    </p>
                    <p>
                      <span>focus:</span>
                    </p>
                    <p> - cloud_gpu_inference</p>
                    <p> - python_automation</p>
                    <p> - api_integration</p>
                    <br />
                    <p>
                      <span>principles:</span>
                    </p>
                    <p>
                      {' '}
                      source: <em>immutable_images</em>
                    </p>
                    <p>
                      {' '}
                      models: <em>persistent_volumes</em>
                    </p>
                    <p>
                      {' '}
                      idle: <em>scale_to_zero</em>
                    </p>
                  </div>
                  <p className="terminal-note">
                    # architecture from my public projects
                  </p>
                  <p>
                    <b>❯</b> <span className="cursor" />
                  </p>
                </div>
              </div>
            </section>
            <div className="stack-strip">
              <span>IN THE TOOLKIT</span>
              {skills
                .map((skill) => skill.name)
                .map((t) => (
                  <span key={t}>{t}</span>
                ))}
            </div>
          </>
        )}
        {page === 'projects' && (
          <section id="projects" className="section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">01 / SELECTED WORK</div>
                <h2>Built. Deployed. Documented.</h2>
                <p>
                  Real repositories. Practical systems. The decisions behind
                  them.
                </p>
              </div>
              <span className="source-status">
                <span
                  className={status === 'API connected' ? 'dot' : 'dot neutral'}
                />
                {status}
              </span>
            </div>
            <div className="project-controls">
              <div className="filters" aria-label="Project categories">
                {['All projects', 'GPU infrastructure', 'Automation'].map(
                  (f) => (
                    <Button
                      key={f}
                      variant="ghost"
                      className={filter === f ? 'filter active' : 'filter'}
                      aria-pressed={filter === f}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </Button>
                  ),
                )}
              </div>
              <div className="search">
                <Search size={16} />
                <Input
                  aria-label="Search projects"
                  placeholder="Search projects…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="project-grid">
              {visible.map((p) => (
                <article className="project-card" key={p.id}>
                  <div className="card-top">
                    <span className="project-icon">
                      {p.category === 'Automation' ? (
                        <Workflow size={22} />
                      ) : (
                        <Cpu size={22} />
                      )}
                    </span>
                    <span className="card-number">
                      PROJECT /{' '}
                      {String(projects.indexOf(p) + 1).padStart(2, '0')}
                    </span>
                    <a
                      aria-label={`View ${p.title} on GitHub`}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ArrowUpRight size={21} />
                    </a>
                  </div>
                  <div className="category">{p.category}</div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="card-bottom">
                    <Button
                      variant="ghost"
                      aria-expanded={expanded === p.id}
                      aria-controls={`details-${p.id}`}
                      onClick={() =>
                        setExpanded(expanded === p.id ? null : p.id)
                      }
                    >
                      {expanded === p.id ? 'Close notes' : 'Engineering notes'}
                      <ArrowRight size={15} />
                    </Button>
                    <span>PUBLIC REPO</span>
                  </div>
                  {expanded === p.id && (
                    <div className="details" id={`details-${p.id}`}>
                      <div className="flow">{p.architecture.join(' → ')}</div>
                      <h4>Architecture</h4>
                      <p>{p.details}</p>
                      <h4>Operations</h4>
                      <p>{p.operations}</p>
                      <a
                        className="text-link"
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read the source <ArrowUpRight size={14} />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
            {!visible.length && (
              <div className="empty">
                No projects match your search.{' '}
                <Button
                  variant="link"
                  onClick={() => {
                    setFilter('All projects');
                    setQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
            <p className="repository-note">
              Curated from public GitHub documentation · reviewed{' '}
              {snapshot.reviewedAt}
            </p>
          </section>
        )}
        {page === 'approach' && (
          <section id="approach" className="section approach">
            <div className="eyebrow">02 / ENGINEERING APPROACH</div>
            <h2>The work behind the interface.</h2>
            <div className="principles">
              {[
                {
                  icon: <Layers />,
                  title: 'Separate the concerns',
                  text: 'Keep the interface close to the user and compute where it belongs. My GPU studios use local UIs with independently deployed inference services.',
                },
                {
                  icon: <Server />,
                  title: 'Make deployments repeatable',
                  text: 'ReconViaGen pins source inside immutable images and stores model weights in persistent volumes. Code and data have different lifecycles.',
                },
                {
                  icon: <Terminal />,
                  title: 'Design for operations',
                  text: 'Scale idle compute to zero, record generation events, and stop failed batches for investigation. Operational behavior is part of the application.',
                },
              ].map((p) => (
                <div key={p.title}>
                  {p.icon}
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {page === 'about' && (
          <>
            <section id="about" className="section about">
              <div>
                <div className="eyebrow">03 / ABOUT ME</div>
                <h2>
                  Curious by default.
                  <br />
                  Hands-on by choice.
                </h2>
              </div>
              <div>
                <p>
                  I’m Aiman, the builder behind{' '}
                  <a href="https://github.com/aimancreator">@aimancreator</a>.
                  My public work explores Python automation, APIs, and cloud GPU
                  infrastructure.
                </p>
                <p>
                  This portfolio documents the systems I’m building and the
                  engineering choices behind them. Browse the source, follow the
                  experiments, and see how the pieces fit together.
                </p>
                <div className="about-links">
                  <a
                    className="primary-link"
                    href="https://github.com/aimancreator"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Find me on GitHub <ArrowUpRight size={17} />
                  </a>
                  <Button
                    variant="outline"
                    onClick={copy}
                    aria-label="Copy GitHub profile URL"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
                    {copied ? 'Copied' : 'Copy profile'}
                  </Button>
                </div>
              </div>
            </section>
            <section className="section" aria-labelledby="skills-heading">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">MY TOOLKIT</div>
                  <h2 id="skills-heading">Skills in practice.</h2>
                  <p>Tools and technologies behind my projects.</p>
                </div>
                <span className="source-status">
                  <span
                    className={
                      skillsStatus === 'Skills from API' ? 'dot' : 'dot neutral'
                    }
                  />
                  {skillsStatus}
                </span>
              </div>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <article key={`${skill.name}-${index}`}>
                    <span className="category">{skill.category}</span>
                    <h3>{skill.name}</h3>
                    <p>{skill.description}</p>
                  </article>
                ))}
              </div>
              {!skills.length && (
                <p className="repository-note">
                  Skills will appear here when added to the API.
                </p>
              )}
            </section>
          </>
        )}
        {page === 'home' && (
          <section className="section home-index">
            <div>
              <div className="eyebrow">EXPLORE THE PORTFOLIO</div>
              <h2>Inside the workspace.</h2>
            </div>
            <div className="home-links">
              {[
                {
                  href: '/projects',
                  number: '01',
                  title: 'Selected projects',
                  text: 'Explore five public projects, their architecture, and operational decisions.',
                },
                {
                  href: '/approach',
                  number: '02',
                  title: 'Engineering approach',
                  text: 'How I separate services, manage model storage, and design for operations.',
                },
                {
                  href: '/about',
                  number: '03',
                  title: 'About Aiman',
                  text: 'Meet the builder and find my work on GitHub.',
                },
              ].map((item) => (
                <a key={item.href} href={item.href}>
                  <span>{item.number} /</span>
                  <h3>
                    {item.title}
                    <ArrowUpRight size={20} />
                  </h3>
                  <p>{item.text}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer>
        <a className="brand" href="/">
          <Terminal size={18} /> aiman<span className="muted"> / devops</span>
        </a>
        <span>Built with intention. Shared with source.</span>
        <a href="#main">Back to top ↑</a>
      </footer>
    </>
  );
}
