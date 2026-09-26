// ┌─┐┬ ┬┌─┐┌─┐┬  ┌─┐
// └─┐└┬┘└─┐└─┐│  ├─┤
// └─┘ ┴ └─┘└─┘┴─┘┴ ┴
// Syssla client: lists, tasks and subtasks, via the nginx proxy at /syssla/api.
// Free-text input uses Syssla's own parseArgs (syssla/parser.js).

const sysslaBlock = document.getElementById('syssla');

const sy = {
	lists: [],
	tasks: [],
	done: [],
	scopes: [],
	scope: localStorage.getItem('sysslaScope') || CONFIG.sysslaScope,
	showDone: localStorage.getItem('sysslaShowDone') === '1',
	expanded: new Set(), // Task ids with the editor open
	renaming: null, // List id being renamed
	confirming: null, // 'list:<id>' or 'task:<id>' awaiting a second click
	error: '',
	toast: null,
};

const esc = (s) =>
	String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ── API ─────────────────────────────────────────────────────────────

const api = async (method, path, body) => {
	const headers = { 'X-Bento': '1' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (sy.scope && sy.scope !== 'everything') headers['X-Syssla-Scope'] = sy.scope;
	const res = await fetch(`syssla/api/${path}`, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
		cache: 'no-store',
	});
	if (!res.ok) {
		let detail = `HTTP ${res.status}`;
		try {
			const data = await res.json();
			detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
		} catch {}
		throw new Error(detail);
	}
	return res.status === 204 ? null : res.json();
};

const load = async () => {
	const scope = encodeURIComponent(sy.scope);
	const [lists, tasks, scopes, done] = await Promise.all([
		api('GET', `lists?scope=${scope}`),
		api('GET', `tasks?scope=${scope}&completed=false&limit=1000`),
		api('GET', 'scopes'),
		sy.showDone ? api('GET', `tasks?scope=${scope}&completed=true&limit=500`) : [],
	]);
	Object.assign(sy, { lists, tasks, scopes, done });
};

// Run a mutation, then reload everything so the view always matches the server
const act = async (fn) => {
	try {
		sy.error = '';
		await fn();
		await load();
	} catch (err) {
		console.error('Syssla:', err);
		sy.error = err.message;
	}
	render();
};

const refresh = async () => {
	// Don't yank the DOM away while typing
	if (sysslaBlock.contains(document.activeElement) && document.activeElement.matches('input, textarea, select')) return;
	await act(() => {});
};

// ── Helpers ─────────────────────────────────────────────────────────

const findTask = (id, list = [...sy.tasks, ...sy.done]) => {
	for (const t of list) {
		if (t.id === id) return t;
		const sub = findTask(id, t.subtasks || []);
		if (sub) return sub;
	}
	return null;
};

const findListByTitle = (title) => sy.lists.find((l) => l.title.toLowerCase() === title.toLowerCase());

const visibleLists = () => {
	if (!CONFIG.sysslaLists.length) return sy.lists;
	return CONFIG.sysslaLists.map(findListByTitle).filter(Boolean);
};

const defaultList = () => (CONFIG.sysslaDefaultList && findListByTitle(CONFIG.sysslaDefaultList)) || visibleLists()[0];

const dueLabel = (task) => {
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
	const cls = task.completed ? '' : days < 0 ? 'overdue' : days === 0 ? 'today' : '';
	const recur = task.recurrence ? ' ↻' : '';
	return `<span class="sysslaDue ${cls}">${label}${task.deadline_time ? ' ' + task.deadline_time : ''}${recur}</span>`;
};

// Title + attributes via Syssla's parser. Returns { body, list }
const parseInput = (text) => {
	const { title, attrs } = parseArgs(text);
	if (!title) throw new Error('Tom titel');
	const body = { title };
	for (const k of ['priority', 'deadline_date', 'deadline_time', 'recurrence']) if (attrs[k] != null) body[k] = attrs[k];
	return { body, list: attrs.list };
};

const resolveList = async (title) => {
	if (!title) return defaultList();
	return findListByTitle(title) || (await api('POST', 'lists', { title }));
};

const showToast = (text, undo) => {
	clearTimeout(sy.toast?.timer);
	sy.toast = { text, undo, timer: setTimeout(() => ((sy.toast = null), render()), 6000) };
};

// ── Rendering ───────────────────────────────────────────────────────

const renderEditor = (t) => `
    <li class="sysslaEditor" data-task="${t.id}">
      <input name="title" value="${esc(t.title)}" placeholder="Titel" />
      <textarea name="description" rows="2" placeholder="Beskrivning">${esc(t.description)}</textarea>
      <div class="sysslaEditorRow">
        <label>Prio
          <select name="priority">
            ${['Ingen', 'Låg', 'Mellan', 'Hög'].map((n, i) => `<option value="${i}" ${(t.priority || 0) === i ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        </label>
        <label>Datum <input type="date" name="deadline_date" value="${t.deadline_date || ''}" /></label>
        <label>Tid <input type="time" name="deadline_time" value="${t.deadline_time || ''}" /></label>
        <label>Upprepa
          <select name="recurrence">
            ${[['', 'Nej'], ['daily', 'Dagligen'], ['weekly', 'Veckovis'], ['monthly', 'Månadsvis'], ['yearly', 'Årligen']]
				.map(([v, n]) => `<option value="${v}" ${(t.recurrence || '') === v ? 'selected' : ''}>${n}</option>`)
				.join('')}
          </select>
        </label>
        ${
			t.parent_id
				? ''
				: `<label>Lista
          <select name="list_id">
            ${sy.lists.map((l) => `<option value="${l.id}" ${l.id === t.list_id ? 'selected' : ''}>${esc(l.title)}</option>`).join('')}
          </select>
        </label>`
		}
      </div>
      ${t.parent_id ? '' : `<input class="sysslaSubAdd" data-task="${t.id}" placeholder="+ Subtask (Enter)" />`}
      <div class="sysslaEditorRow sysslaEditorActions">
        <button data-action="save">Spara</button>
        <button data-action="focus">${t.focus ? '☆ Ta bort fokus' : '★ Fokus'}</button>
        <button data-action="close">Stäng</button>
        <button data-action="delete-task" class="danger ${sy.confirming === 'task:' + t.id ? 'confirm' : ''}">
          ${sy.confirming === 'task:' + t.id ? 'Säker? Klicka igen' : 'Radera'}
        </button>
      </div>
    </li>`;

const renderTask = (t) => {
	const subs = (t.subtasks || []).filter((s) => sy.showDone || !s.completed);
	return `
    <li class="sysslaTask ${t.completed ? 'done' : ''}" data-task="${t.id}">
      <button class="sysslaCheck prio${t.priority || 0}" data-action="toggle" title="${t.completed ? 'Ångra' : 'Klar'}">${t.completed ? '✓' : ''}</button>
      <span class="sysslaTitle" data-action="expand" title="${esc(t.description || 'Klicka för att redigera')}">${t.focus ? '★ ' : ''}${esc(t.title)}</span>
      ${dueLabel(t)}
    </li>
    ${sy.expanded.has(t.id) ? renderEditor(t) : ''}
    ${subs.length ? `<ul class="sysslaSub">${subs.map(renderTask).join('')}</ul>` : ''}`;
};

const renderList = (list, i) => {
	const open = sy.tasks.filter((t) => t.list_id === list.id && !t.parent_id);
	const done = sy.done
		.filter((t) => t.list_id === list.id && !t.parent_id)
		.sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))
		.slice(0, CONFIG.sysslaMaxDone);
	const confirming = sy.confirming === 'list:' + list.id;
	const title =
		sy.renaming === list.id
			? `<input class="sysslaRename" data-list="${list.id}" value="${esc(list.title)}" />`
			: `<span class="sysslaListTitle" data-action="rename-list" title="Klicka för att byta namn">${esc(list.title)}</span>`;
	return `
    <div class="card sysslaList" data-list="${list.id}" style="--card-accent: ${cardColor(i)}">
      <div class="sysslaHeader">
        ${title}
        <span class="sysslaCount">${open.length}</span>
        <button class="sysslaIcon danger ${confirming ? 'confirm' : ''}" data-action="delete-list" title="Radera lista">${confirming ? 'Radera?' : '✕'}</button>
      </div>
      <ul>${open.map(renderTask).join('')}${done.map(renderTask).join('')}</ul>
      <input class="sysslaAdd" data-list="${list.id}" placeholder="+ Lägg till" />
    </div>`;
};

// Unsaved editor fields survive re-renders (e.g. after adding a subtask)
const captureDrafts = () => {
	const drafts = {};
	for (const ed of sysslaBlock.querySelectorAll('.sysslaEditor')) {
		drafts[ed.dataset.task] = [...ed.querySelectorAll('[name]')].map((f) => [f.name, f.value]);
	}
	return drafts;
};

const restoreDrafts = (drafts) => {
	for (const [id, fields] of Object.entries(drafts)) {
		const ed = sysslaBlock.querySelector(`.sysslaEditor[data-task="${id}"]`);
		if (ed) for (const [name, value] of fields) ed.querySelector(`[name="${name}"]`).value = value;
	}
};

const render = () => {
	const drafts = captureDrafts();
	const lists = visibleLists();
	const scopes = [{ id: 'everything', name: 'everything', label: 'Allt' }, ...sy.scopes];
	sysslaBlock.innerHTML = `
    <div class="sysslaBar">
      <input id="sysslaQuick" placeholder="Ny syssla…  due:fredag 14:00  prio:H  list:hobby  recur:weekly" />
      <select id="sysslaScope" title="Scope">
        ${scopes
			.map((s) => `<option value="${esc(s.name)}" ${[s.id, s.name].includes(sy.scope) ? 'selected' : ''}>${esc(s.label || s.name)}</option>`)
			.join('')}
      </select>
      <button data-action="toggle-done" class="${sy.showDone ? 'active' : ''}" title="Visa klara">✓ Klara</button>
      <button data-action="new-list" title="Ny lista">+ Lista</button>
      <a href="${CONFIG.sysslaUrl}" target="${CONFIG.openInNewTab ? '_blank' : ''}" title="Öppna Syssla">↗</a>
    </div>
    ${sy.error ? `<p class="sysslaError">${esc(sy.error)}</p>` : ''}
    <div class="sysslaLists">
      ${lists.length ? lists.map(renderList).join('') : '<p class="sysslaEmpty">Inga listor i det här scopet</p>'}
    </div>
    ${
		sy.toast
			? `<div class="sysslaToast">${esc(sy.toast.text)}${sy.toast.undo ? ' <button data-action="undo">Ångra</button>' : ''}</div>`
			: ''
	}`;
	restoreDrafts(drafts);
};

// ── Actions ─────────────────────────────────────────────────────────

const toggleTask = (t) =>
	act(async () => {
		await api('POST', `tasks/${t.id}/complete?completed=${!t.completed}`);
		if (!t.completed) showToast(`Klar: ${t.title}`, () => api('POST', `tasks/${t.id}/complete?completed=false`));
	});

const saveEditor = (li) => {
	const t = findTask(li.dataset.task);
	const f = (name) => li.querySelector(`[name="${name}"]`);
	const body = {
		title: f('title').value.trim(),
		description: f('description').value.trim() || null,
		priority: Number(f('priority').value),
		deadline_date: f('deadline_date').value || null,
		deadline_time: (f('deadline_date').value && f('deadline_time').value) || null,
		recurrence: f('recurrence').value || null,
	};
	if (f('list_id') && f('list_id').value !== t.list_id) body.list_id = f('list_id').value;
	return act(async () => {
		await api('PATCH', `tasks/${t.id}`, body);
		sy.expanded.delete(t.id);
	});
};

const focusRename = () => {
	const input = sysslaBlock.querySelector('.sysslaRename');
	input?.focus();
	input?.select();
};

const actions = {
	toggle: (el) => toggleTask(findTask(el.closest('[data-task]').dataset.task)),
	expand: (el) => {
		const id = el.closest('[data-task]').dataset.task;
		sy.expanded.has(id) ? sy.expanded.delete(id) : sy.expanded.add(id);
		sy.confirming = null;
		render();
		sysslaBlock.querySelector(`.sysslaEditor[data-task="${id}"] [name="title"]`)?.focus();
	},
	save: (el) => saveEditor(el.closest('.sysslaEditor')),
	close: (el) => {
		sy.expanded.delete(el.closest('[data-task]').dataset.task);
		render();
	},
	focus: (el) => {
		const t = findTask(el.closest('[data-task]').dataset.task);
		return act(() => api('PATCH', `tasks/${t.id}`, { focus: !t.focus }));
	},
	'delete-task': (el) => {
		const id = el.closest('[data-task]').dataset.task;
		if (sy.confirming !== 'task:' + id) {
			sy.confirming = 'task:' + id;
			return render();
		}
		sy.confirming = null;
		sy.expanded.delete(id);
		return act(() => api('DELETE', `tasks/${id}`));
	},
	'rename-list': (el) => {
		sy.renaming = el.closest('[data-list]').dataset.list;
		render();
		focusRename();
	},
	'delete-list': (el) => {
		const id = el.closest('[data-list]').dataset.list;
		if (sy.confirming !== 'list:' + id) {
			sy.confirming = 'list:' + id;
			return render();
		}
		sy.confirming = null;
		return act(() => api('DELETE', `lists/${id}`));
	},
	'new-list': () =>
		act(async () => {
			const list = await api('POST', 'lists', { title: 'Ny lista' });
			sy.renaming = list.id;
		}).then(focusRename),
	'toggle-done': () => {
		sy.showDone = !sy.showDone;
		localStorage.setItem('sysslaShowDone', sy.showDone ? '1' : '0');
		return act(() => {});
	},
	undo: () => {
		const undo = sy.toast?.undo;
		clearTimeout(sy.toast?.timer);
		sy.toast = null;
		return act(undo);
	},
};

sysslaBlock.addEventListener('click', (e) => {
	const el = e.target.closest('[data-action]');
	if (!el) return;
	e.preventDefault();
	actions[el.dataset.action]?.(el);
});

const inputError = (input, err) => {
	input.classList.add('invalid');
	input.title = err.message;
	sy.error = err.message;
	let box = sysslaBlock.querySelector('.sysslaError');
	if (!box) {
		box = document.createElement('p');
		box.className = 'sysslaError';
		sysslaBlock.querySelector('.sysslaBar').after(box);
	}
	box.textContent = err.message;
};

// Parse synchronously so parser errors (e.g. bad due:) stay on the input
const submitInput = async (input) => {
	if (input.id === 'sysslaQuick') {
		const { body, list: listTitle } = parseInput(input.value);
		await act(async () => {
			const list = await resolveList(listTitle);
			if (!list) throw new Error('Skapa en lista först');
			await api('POST', `lists/${list.id}/tasks`, body);
		});
		sysslaBlock.querySelector('#sysslaQuick')?.focus();
	} else if (input.classList.contains('sysslaAdd')) {
		const { body, list: listTitle } = parseInput(input.value);
		const listId = input.dataset.list;
		await act(async () => {
			const list = listTitle ? await resolveList(listTitle) : { id: listId };
			await api('POST', `lists/${list.id}/tasks`, body);
		});
		sysslaBlock.querySelector(`.sysslaAdd[data-list="${listId}"]`)?.focus();
	} else if (input.classList.contains('sysslaSubAdd')) {
		const { body } = parseInput(input.value);
		const parentId = input.dataset.task;
		await act(() => api('POST', `tasks/${parentId}/subtasks`, body));
		sysslaBlock.querySelector(`.sysslaSubAdd[data-task="${parentId}"]`)?.focus();
	} else if (input.classList.contains('sysslaRename')) {
		const id = input.dataset.list;
		await act(async () => {
			await api('PATCH', `lists/${id}`, { title: input.value.trim() });
			sy.renaming = null;
		});
	}
};

sysslaBlock.addEventListener('keydown', async (e) => {
	const input = e.target;
	if (e.key === 'Escape') {
		sy.renaming = null;
		sy.expanded.clear();
		return render();
	}
	if (e.key !== 'Enter' || e.shiftKey || input.tagName === 'TEXTAREA') return;

	if (input.closest('.sysslaEditor') && !input.classList.contains('sysslaSubAdd')) {
		e.preventDefault();
		return saveEditor(input.closest('.sysslaEditor'));
	}
	if (!input.value.trim()) return;

	try {
		await submitInput(input);
	} catch (err) {
		inputError(input, err);
	}
});

sysslaBlock.addEventListener('change', (e) => {
	if (e.target.id !== 'sysslaScope') return;
	sy.scope = e.target.value;
	localStorage.setItem('sysslaScope', sy.scope);
	sy.expanded.clear();
	act(() => {});
});

if (CONFIG.sysslaEnabled) {
	sysslaBlock.classList.add('active');
	refresh();
	setInterval(refresh, CONFIG.sysslaRefreshMinutes * 60000);
	window.addEventListener('focus', refresh);
}
