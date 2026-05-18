// ====== CONFIGURATION ======
const ENABLE_LOCAL_TRAFFIC_LOG = true; // Set to true for local development logging

// ====== TRAFFIC LOGGING ======
function logTraffic() {
  if (!ENABLE_LOCAL_TRAFFIC_LOG) return;
  
  const now = new Date().toISOString();
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const referrer = document.referrer ? new URL(document.referrer).hostname : 'direct';
  
  console.log(`[PORTFOLIO TRAFFIC] ${now} | PAGE_VIEW | /${path} | referrer: ${referrer}`);
}

// Analytics Placeholder (e.g., Plausible, GoatCounter)
// GitHub Pages cannot generate real server-side traffic logs.
// Browser console logs (above) are only for local development.
// Real visitor analytics require a third-party analytics service.
/*
  If using Plausible, uncomment and add to HTML <head>:
  <script defer data-domain="YOUR_DOMAIN" src="https://plausible.io/js/script.js"></script>
  
  If using GoatCounter, uncomment and add to HTML body:
  <script data-goatcounter="https://YOUR_ANALYTICS_ID_HERE.goatcounter.com/count"
          async src="//gc.zgo.at/count.js"></script>
*/

// ====== THEME TOGGLE ======
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');
  
  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.textContent = '☾';
  }

  themeToggle.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀' : '☾';
  });
}

// ====== PROJECT LOADING & RENDERING ======

// Fetch projects data
async function fetchProjects() {
  try {
    const response = await fetch('./assets/data/projects.json?t=' + new Date().getTime());
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Render a single project card
function createProjectCard(project, index) {
  const isReverse = index % 2 !== 0 ? 'reverse' : '';
  
  const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  
  let linksHtml = '';
  if (project.links.github) linksHtml += `<a href="${project.links.github}" class="project-link" target="_blank" rel="noopener noreferrer">GitHub</a>`;
  if (project.links.caseStudy) linksHtml += `<a href="${project.links.caseStudy}" class="project-link" target="_blank" rel="noopener noreferrer">Case Study</a>`;
  if (project.links.demo) linksHtml += `<a href="${project.links.demo}" class="project-link" target="_blank" rel="noopener noreferrer">Demo</a>`;
  if (!linksHtml) linksHtml = `<span class="project-link" style="color:var(--border-color); border:none;">Details pending</span>`;

  // Determine placeholder if image fails or is missing
  const imgSrc = project.image || 'assets/images/placeholder.jpg';
  // inline SVG for reliable placeholder
  const fallbackSvg = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22 viewBox=%220 0 100 100%22 preserveAspectRatio=%22none%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23dddddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22sans-serif%22 font-size=%228%22 fill=%22%23111111%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage Placeholder%3C/text%3E%3C/svg%3E`;

  const imageLink = project.links.github || project.links.caseStudy || project.links.demo || '#';

  return `
    <article class="project-card ${isReverse}">
      <a href="${imageLink}" target="_blank" rel="noopener noreferrer" class="project-image">
        <img src="${imgSrc}" alt="${project.title} screenshot" onerror="this.src='${fallbackSvg}'">
      </a>
      <div class="project-info">
        <h3>${project.title}</h3>
        <div class="tags">${tagsHtml} <span class="tag" style="border-style:dashed;">${project.status}</span></div>
        <p>${project.description}</p>
        <div class="project-links">
          ${linksHtml}
        </div>
      </div>
    </article>
  `;
}

// Initialize Featured Projects on Homepage
async function initFeaturedProjects() {
  const featuredContainer = document.getElementById('featured-projects');
  if (!featuredContainer) return;

  const projects = await fetchProjects();
  const featured = projects.filter(p => p.featured);
  
  if (featured.length === 0) {
    featuredContainer.innerHTML = '<p class="js-disabled-message">No featured projects found.</p>';
    return;
  }

  featuredContainer.innerHTML = featured.map((p, i) => createProjectCard(p, i)).join('');
}

// Initialize All Projects on Projects Page
async function initAllProjects() {
  const projectsContainer = document.getElementById('all-projects');
  const searchInput = document.getElementById('project-search');
  if (!projectsContainer || !searchInput) return;

  let projects = await fetchProjects();
  
  const renderProjects = (filteredProjects) => {
    if (filteredProjects.length === 0) {
      projectsContainer.innerHTML = '<p class="js-disabled-message">No projects match your search criteria.</p>';
      return;
    }
    projectsContainer.innerHTML = filteredProjects.map((p, i) => createProjectCard(p, i)).join('');
  };

  // Initial render
  renderProjects(projects);

  // Search logic
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = projects.filter(p => {
      return p.title.toLowerCase().includes(term) ||
             p.description.toLowerCase().includes(term) ||
             p.tags.some(tag => tag.toLowerCase().includes(term));
    });
    renderProjects(filtered);
  });
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  logTraffic();
  initFeaturedProjects();
  initAllProjects();
});
