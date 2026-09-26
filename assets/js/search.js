// ┌─┐┌─┐┌─┐┬─┐┌─┐┬ ┬
// └─┐├┤ ├─┤├┬┘│  ├─┤
// └─┘└─┘┴ ┴┴└─└─┘┴ ┴
// fzf-style fuzzy search over every bookmark: the visible lists/buttons plus
// hidden ones in CONFIG.bookmarks. Press / (or Ctrl+K) to focus.

const searchInput = document.getElementById('search');
const searchResults = document.getElementById('searchResults');
const searchCount = document.getElementById('searchCount');

const searchItems = [
	...[...CONFIG.firstlistsContainer, ...CONFIG.secondListsContainer].flatMap((l) =>
		l.links.map((x) => ({ name: x.name, url: x.link, tags: [] }))
	),
	...[...CONFIG.firstButtonsContainer, ...CONFIG.secondButtonsContainer].map((b) => ({ name: b.name, url: b.link, tags: [] })),
	...(CONFIG.bookmarks || []).map((b) => ({ name: b.name, url: b.url, tags: b.tags || [] })),
].filter((item, i, all) => all.findIndex((o) => o.url === item.url) === i);

let searchMatches = [];
let searchSelected = 0;

const searchEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Subsequence match with fzf-ish bonuses: word starts and consecutive chars
// score higher, gaps cost a little. Returns { score, positions } or null.
const fuzzy = (term, text) => {
	const t = text.toLowerCase();
	const positions = [];
	let score = 0;
	let from = 0;
	for (const ch of term) {
		const i = t.indexOf(ch, from);
		if (i === -1) return null;
		const prev = positions[positions.length - 1];
		if (prev !== undefined && i === prev + 1) score += 8;
		if (i === 0 || /[\s\-_./:]/.test(t[i - 1])) score += 10;
		if (prev !== undefined) score -= Math.min(i - prev - 1, 5);
		score += 1;
		positions.push(i);
		from = i + 1;
	}
	return { score, positions };
};

const highlight = (text, positions) => {
	const set = new Set(positions);
	return [...text].map((c, i) => (set.has(i) ? `<mark>${searchEsc(c)}</mark>` : searchEsc(c))).join('');
};

const hostOf = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Every space-separated term must match (like fzf's extended mode).
// Matches in the name are preferred and highlighted; tags/url also count.
const matchItem = (item, terms) => {
	let score = 0;
	const namePos = [];
	const urlPos = [];
	const host = hostOf(item.url);
	for (const term of terms) {
		const inName = fuzzy(term, item.name);
		if (inName) {
			score += inName.score * 2;
			namePos.push(...inName.positions);
			continue;
		}
		const inUrl = fuzzy(term, host);
		if (inUrl) {
			score += inUrl.score;
			urlPos.push(...inUrl.positions);
			continue;
		}
		const inTags = item.tags.map((tag) => fuzzy(term, tag)).find(Boolean);
		if (!inTags) return null;
		score += inTags.score;
	}
	return { item, score, namePos, urlPos };
};

const renderSearch = () => {
	const query = searchInput.value.trim().toLowerCase();
	const terms = query.split(/\s+/).filter(Boolean);
	searchMatches = terms.length
		? searchItems
				.map((item) => matchItem(item, terms))
				.filter(Boolean)
				.sort((a, b) => b.score - a.score)
		: searchItems.map((item) => ({ item, score: 0, namePos: [], urlPos: [] }));
	searchSelected = Math.min(searchSelected, Math.max(searchMatches.length - 1, 0));
	searchCount.textContent = `${searchMatches.length}/${searchItems.length}`;

	const target = CONFIG.openInNewTab ? '_blank' : '';
	let html = searchMatches
		.map(
			(m, i) => `
        <li><a class="searchResult ${i === searchSelected ? 'selected' : ''}" href="${searchEsc(m.item.url)}" target="${target}" data-index="${i}">
          <span class="searchName">${highlight(m.item.name, m.namePos)}</span>
          <span class="searchUrl">${highlight(hostOf(m.item.url), m.urlPos)}</span>
          ${m.item.tags.map((t) => `<span class="searchTag">#${searchEsc(t)}</span>`).join('')}
        </a></li>`
		)
		.join('');
	if (!searchMatches.length && query) {
		html = `<li><a class="searchResult selected" href="${searchEsc(webTarget(searchInput.value.trim()))}" target="${target}">
          <span class="searchName">Sök på webben:</span><span class="searchUrl">${searchEsc(searchInput.value.trim())}</span>
        </a></li>`;
	}
	searchResults.innerHTML = document.activeElement === searchInput ? html : '';
	searchResults.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
};

// Something that looks like a domain opens directly, anything else is searched
const webTarget = (q) => {
	if (/^\S+\.\S+$/.test(q)) return /^https?:\/\//.test(q) ? q : `https://${q}`;
	return CONFIG.searchEngine + encodeURIComponent(q);
};

const openSelected = (newTab) => {
	const q = searchInput.value.trim();
	const url = searchMatches[searchSelected]?.item.url || (q && webTarget(q));
	if (!url) return;
	if (newTab || CONFIG.openInNewTab) window.open(url, '_blank');
	else window.location.href = url;
	searchInput.value = '';
	searchInput.blur();
};

const moveSelection = (delta) => {
	if (!searchMatches.length) return;
	searchSelected = (searchSelected + delta + searchMatches.length) % searchMatches.length;
	renderSearch();
};

searchInput.addEventListener('input', () => {
	searchSelected = 0;
	renderSearch();
});
searchInput.addEventListener('focus', renderSearch);
searchInput.addEventListener('blur', () => setTimeout(() => (searchResults.innerHTML = ''), 150));

searchInput.addEventListener('keydown', (e) => {
	const ctrl = e.ctrlKey;
	if (e.key === 'ArrowDown' || (ctrl && ['j', 'n'].includes(e.key))) {
		e.preventDefault();
		moveSelection(1);
	} else if (e.key === 'ArrowUp' || (ctrl && ['k', 'p'].includes(e.key))) {
		e.preventDefault();
		moveSelection(-1);
	} else if (e.key === 'Enter') {
		e.preventDefault();
		openSelected(ctrl || e.metaKey);
	} else if (e.key === 'Escape') {
		searchInput.value = '';
		searchInput.blur();
	}
});

searchResults.addEventListener('mousemove', (e) => {
	const a = e.target.closest('[data-index]');
	if (a && +a.dataset.index !== searchSelected) {
		searchSelected = +a.dataset.index;
		searchResults.querySelectorAll('.searchResult').forEach((el, i) => el.classList.toggle('selected', i === searchSelected));
	}
});

document.addEventListener('keydown', (e) => {
	const typing = document.activeElement.matches('input, textarea, select');
	if ((e.key === '/' && !typing) || (e.ctrlKey && e.key === 'k' && document.activeElement !== searchInput)) {
		e.preventDefault();
		searchInput.focus();
	}
});
