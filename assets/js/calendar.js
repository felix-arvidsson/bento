// ┌─┐┌─┐┬  ┌─┐┌┐┌┌┬┐┌─┐┬─┐
// │  ├─┤│  ├┤ │││ ││├─┤├┬┘
// └─┘┴ ┴┴─┘└─┘┘└┘─┴┘┴ ┴┴└─
// Upcoming events from the proxied Google Calendar iCal feed.

const calendarBlock = document.getElementById('calendar');

const sameDay = (a, b) => a.toDateString() === b.toDateString();

const formatDay = (date) => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	if (sameDay(date, today)) return 'Idag';
	if (sameDay(date, tomorrow)) return 'Imorgon';
	return date.toLocaleDateString(CONFIG.calendarLocale, { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatTime = (date) =>
	date.toLocaleTimeString(CONFIG.calendarLocale, { hour: '2-digit', minute: '2-digit', hour12: CONFIG.twelveHourFormat });

const collectEvents = (ics) => {
	const vcal = new ICAL.Component(ICAL.parse(ics));
	// Multiple feeds can ship the same timezone definition; re-registering is fine
	for (const tz of vcal.getAllSubcomponents('vtimezone')) {
		try { ICAL.TimezoneService.register(tz); } catch { /* already registered */ }
	}

	const now = new Date();
	const until = new Date(now.getTime() + CONFIG.calendarDays * 86400000);
	const vevents = vcal.getAllSubcomponents('vevent');
	// Moved/cancelled occurrences of recurring events are separate VEVENTs with RECURRENCE-ID
	const exceptions = vevents.filter((v) => v.hasProperty('recurrence-id'));
	const events = [];

	for (const vevent of vevents) {
		if (vevent.hasProperty('recurrence-id')) continue;
		const event = new ICAL.Event(vevent);
		for (const ex of exceptions) if (ex.getFirstPropertyValue('uid') === event.uid) event.relateException(ex);

		const push = (details) => {
			if (details.item.component.getFirstPropertyValue('status') === 'CANCELLED') return;
			const start = details.startDate.toJSDate();
			const end = details.endDate.toJSDate();
			if (end > now && start < until)
				events.push({ title: details.item.summary, start, allDay: details.startDate.isDate });
		};

		if (event.isRecurring()) {
			const it = event.iterator();
			let next;
			while ((next = it.next())) {
				const details = event.getOccurrenceDetails(next);
				if (details.startDate.toJSDate() >= until) break;
				push(details);
			}
		} else {
			push({ item: event, startDate: event.startDate, endDate: event.endDate });
		}
	}

	return events.sort((a, b) => a.start - b.start || b.allDay - a.allDay).slice(0, CONFIG.calendarMaxEvents);
};

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const renderCalendar = (events) => {
	if (!events.length) {
		calendarBlock.innerHTML = '<p class="calendarEmpty">Inget inplanerat</p>';
		return;
	}
	calendarBlock.innerHTML = events
		.map(
			(e) => `
        <div class="calendarEvent">
          <span class="calendarWhen">${formatDay(e.start)}${e.allDay ? '' : ' ' + formatTime(e.start)}</span>
          <span class="calendarTitle">${escapeHtml(e.title || '(utan titel)')}</span>
        </div>`
		)
		.join('');
};

const loadCalendar = async () => {
	const results = await Promise.allSettled(
		CONFIG.calendarFeeds.map(async (path) => {
			const res = await fetch(path, { cache: 'no-store' });
			if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
			return collectEvents(await res.text());
		})
	);

	const events = [];
	for (const r of results) if (r.status === 'fulfilled') events.push(...r.value);

	// The same event can arrive via several feeds (invites copied into the
	// primary calendar, calendars shared between accounts), so de-dup on
	// start time + title rather than UID.
	const seen = new Set();
	const unique = events
		.filter((e) => {
			const key = `${e.start.getTime()}|${e.allDay}|${e.title}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.sort((a, b) => a.start - b.start || b.allDay - a.allDay)
		.slice(0, CONFIG.calendarMaxEvents);

	if (unique.length) {
		renderCalendar(unique);
	} else if (events.length) {
		calendarBlock.innerHTML = '<p class="calendarEmpty">Inget inplanerat</p>';
	} else {
		const failed = results.filter((r) => r.status === 'rejected').map((r) => r.reason?.message || r.reason);
		console.error('Calendar:', failed);
		calendarBlock.innerHTML = '<p class="calendarEmpty">Kunde inte hämta kalendern</p>';
	}
};

if (CONFIG.calendarEnabled) {
	document.querySelector('.weather').style.display = 'none';
	calendarBlock.style.display = 'flex';
	loadCalendar();
	setInterval(loadCalendar, CONFIG.calendarRefreshMinutes * 60000);
}
