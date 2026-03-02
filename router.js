const PAGES        = new Set(['home', 'ttvmin', 'ttvedit', 'noiser', 'dwmrun', 'LMeXS']);
const DEFAULT_PAGE = 'home';
const SITE_TITLE   = 'n0xa.f5.si';

const mainContent = document.getElementById('mainContent');
const pageLoader  = document.getElementById('pageLoader');
const navLinks    = document.querySelectorAll('.nav-link');
const hamburger   = document.getElementById('navHamburger');
const navMenu     = document.getElementById('navLinks');

const cache = new Map();

function showLoader() {
    mainContent.innerHTML = '';
    pageLoader.classList.remove('hidden');
    mainContent.appendChild(pageLoader);
}

function hideLoader() {
    pageLoader.classList.add('hidden');
}

function setActiveNav(page) {
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === page));
}

async function loadPage(page) {
    if (!PAGES.has(page)) page = DEFAULT_PAGE;

    showLoader();
    setActiveNav(page);

    let mod;
    if (cache.has(page)) {
        mod = cache.get(page);
    } else {
        try {
            mod = (await import(`./content_${page}.js`)).default;
            cache.set(page, mod);
        } catch (e) {
            mod = { title: SITE_TITLE, html: `<div class="intro-container"><p>ページの読み込みに失敗しました。</p></div>` };
        }
    }

    document.title = mod.title ? `${SITE_TITLE} - ${mod.title}` : SITE_TITLE;
    hideLoader();
    mainContent.innerHTML = mod.html;
}

function getPage() {
    const hash = location.hash.replace('#', '').trim();
    return hash || DEFAULT_PAGE;
}

window.addEventListener('hashchange', () => loadPage(getPage()));

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(a => {
    a.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

loadPage(getPage());
