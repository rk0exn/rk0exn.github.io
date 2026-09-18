const userLang = navigator.language || navigator.userLanguage || '';
const isJapanese = userLang.toLowerCase().startsWith('ja');
const DEFAULT_PAGE = isJapanese ? 'home' : 'home-en';
const PAGES = [
    { id: DEFAULT_PAGE },
    { id: 'noiser' },
    { id: 'BinEdit' },
    { id: 'BinEdit-en' },
    { id: 'template', jump: '/Templates/TemplateHost' },
    { id: 'bsodMaker', jump: 'https://youtu.be/dQw4w9WgXcQ' },
];
const SITE_TITLE = 'Profile of (rk0exn / n0xa)';

const mainContent = document.getElementById('mainContent');
const pageLoader = document.getElementById('pageLoader');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.getElementById('navHamburger');
const navMenu = document.getElementById('navLinks');

const cache = new Map();
let loadVersion = 0;

if (!isJapanese) {
    let home = document.getElementById('home');
    document.getElementById('brandLink').href = home.href = `#${DEFAULT_PAGE}`;
    home.textContent = 'Profile';
    home.dataset.page = DEFAULT_PAGE;
}

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

async function setHtmlWithScripts(element, html, version) {
    element.innerHTML = html;

    let scripts = [...element.querySelectorAll('script')];

    for (let oldScript of scripts) {
        if (version !== loadVersion)
            return;

        let newScript = document.createElement('script');

        for (let attr of oldScript.attributes)
            newScript.setAttribute(attr.name, attr.value);

        if (oldScript.src) {
            await new Promise((resolve, reject) => {
                newScript.onload = resolve;
                newScript.onerror = reject;
                oldScript.replaceWith(newScript);
            });

            if (version !== loadVersion) return;
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
    let version = ++loadVersion;
    let pageInfo = getPageInfo(page);

    if (!pageInfo) {
        location.replace(`#${DEFAULT_PAGE}`);
        return;
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
            if (version !== loadVersion) return;
            cache.set(pageInfo.id, mod);
        } catch (e) {
            if (version !== loadVersion) return;
            console.error(`Failed to load page "${pageInfo.id}":`, e);
            mod = {
                title: SITE_TITLE,
                html: `<div class="intro-container"><p>${isJapanese ? 'ページの読み込みに失敗しました。' : 'Failed to load page :('}</p></div>`
            };
        }
    }

    if (version !== loadVersion) return;
    document.title = mod.title ? `${SITE_TITLE} - ${mod.title}` : SITE_TITLE;
    hideLoader();
    try {
        await setHtmlWithScripts(mainContent, mod.html, version);
    } catch (e) {
        if (version === loadVersion)
            console.error('Failed to execute page scripts:', e);
    }
}

function getPage() {
    let hash = location.hash.replace(/^#/, '').trim();
    return hash || DEFAULT_PAGE;
}

window.addEventListener('hashchange', () => loadPage(getPage()));

hamburger.addEventListener('click', () => {
    let isOpen = navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(a => {
    a.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

loadPage(getPage());
