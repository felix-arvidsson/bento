// ┌─┐┬ ┬┌─┐┌─┐┬  ┌─┐
// └─┐└┬┘└─┐└─┐│  ├─┤
// └─┘ ┴ └─┘└─┘┴─┘┴ ┴
// Open tasks per list from Syssla, via the read-only nginx proxy.

const sysslaBlock = document.getElementById('syssla');

const sysslaEscape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const sysslaDeadline = (task) => {
	if (!task.deadline_date) return '';
	const [y, m, d] = task.deadline_date.split('-').map(Number);
	const date = new Date(y, m - 1, d);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const days = Math.round((date - today) / 86400000);
	const label =
		days === 0
			? 'Idag'
			: days === 1
			? 'Imorgon'
			: date.toLocaleDateString(CONFIG.calendarLocale, { day: 'numeric', month: 'short' });
	const cls = days < 0 ? 'overdue' : days === 0 ? 'today' : '';
	return `<span class="sysslaDue ${cls}">${label}${task.deadline_time ? ' ' + task.deadline_time : ''}</span>`;
};

const sysslaFetch = async (path) => {
	const res = await fetch(`syssla/api/${path}`, { cache: 'no-store' });
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	return res.json();
};

const renderSyssla = (lists, tasks) => {
	const byList = {};
	for (const task of tasks) {
		if (task.parent_id) continue;
		(byList[task.list_id] ||= []).push(task);
	}

	let shown = lists.filter((l) => byList[l.id]?.length);
	if (CONFIG.sysslaLists.length) {
		shown = CONFIG.sysslaLists.map((title) => lists.find((l) => l.title === title)).filter(Boolean);
	}

	if (!shown.length) {
		sysslaBlock.innerHTML = '<p class="sysslaEmpty">Inga öppna sysslor 🎉</p>';
		return;
	}

	const target = CONFIG.openInNewTab ? '_blank' : '';
	sysslaBlock.innerHTML = shown
		.map((list) => {
			const open = byList[list.id] || [];
			const rows = open
				.slice(0, CONFIG.sysslaMaxTasks)
				.map(
					(t) => `
            <li class="sysslaTask">
              <span class="sysslaPrio prio${t.priority || 0}"></span>
              <span class="sysslaTitle">${t.focus ? '★ ' : ''}${sysslaEscape(t.title)}</span>
              ${sysslaDeadline(t)}
            </li>`
				)
				.join('');
			const more = open.length > CONFIG.sysslaMaxTasks ? `<li class="sysslaMore">+${open.length - CONFIG.sysslaMaxTasks} till</li>` : '';
			return `
        <a class="card sysslaList" href="${CONFIG.sysslaUrl}" target="${target}">
          <div class="sysslaHeader">
            <span>${sysslaEscape(list.title)}</span>
            <span class="sysslaCount">${open.length}</span>
          </div>
          <ul>${rows || '<li class="sysslaMore">Tomt</li>'}${more}</ul>
        </a>`;
		})
		.join('');
};

const loadSyssla = async () => {
	try {
		const scope = encodeURIComponent(CONFIG.sysslaScope);
		const [lists, tasks] = await Promise.all([
			sysslaFetch(`lists?scope=${scope}`),
			sysslaFetch(`tasks?scope=${scope}&completed=false&limit=1000`),
		]);
		renderSyssla(lists, tasks);
	} catch (err) {
		console.error('Syssla:', err);
		sysslaBlock.innerHTML = '<p class="sysslaEmpty">Kunde inte hämta Syssla</p>';
	}
};

if (CONFIG.sysslaEnabled) {
	sysslaBlock.style.display = 'grid';
	loadSyssla();
	setInterval(loadSyssla, CONFIG.sysslaRefreshMinutes * 60000);
}
