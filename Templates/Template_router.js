const PAGES = [
    { id: 'Template' },
    { id: 'page2' },
];

const DEFAULT_PAGE = 'Template';
const SITE_TITLE   = 'n0xa.f5.si - TemplateHost';

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

async function setHtmlWithScripts(element, html) {
    element.innerHTML = html;

    const scripts = [...element.querySelectorAll('script')];

    for (const oldScript of scripts) {
        const newScript = document.createElement('script');

        for (const attr of oldScript.attributes)
            newScript.setAttribute(attr.name, attr.value);

        if (oldScript.src) {
            await new Promise((resolve, reject) => {
                newScript.onload = resolve;
                newScript.onerror = reject;
                oldScript.replaceWith(newScript);
            });
        } else {
            newScript.textContent = oldScript.textContent;
            oldScript.replaceWith(newScript);
        }
    }
}

function getPageInfo(id) {
    return PAGES.find(p => p.id === id);
}

async function loadPage(page) {
    let pageInfo = getPageInfo(page);

    if (!pageInfo) {
        location.hash = `#${DEFAULT_PAGE}`;
        pageInfo = getPageInfo(DEFAULT_PAGE);
    }

    showLoader();
    setActiveNav(pageInfo.id);

    if (pageInfo.jump) {
        window.location.replace(pageInfo.jump);
        return;
    }

    let mod;

    if (cache.has(pageInfo.id)) {
        mod = cache.get(pageInfo.id);
    } else {
        try {
            mod = (await import(`./content_${pageInfo.id}.js`)).default;
            cache.set(pageInfo.id, mod);
        } catch (e) {
            mod = {
                title: '',
                html: `<div class="intro-container"><p>ページの読み込みに失敗しました。</p></div>`
            };
        }
    }

    document.title = mod.title ? `${SITE_TITLE} - ${mod.title}` : SITE_TITLE;
    hideLoader();

    await setHtmlWithScripts(mainContent, mod.html);
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
