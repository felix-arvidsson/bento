// ╔╗ ╔═╗╔╗╔╔╦╗╔═╗
// ╠╩╗║╣ ║║║ ║ ║ ║
// ╚═╝╚═╝╝╚╝ ╩ ╚═╝
// ┌─┐┌─┐┌┐┌┌─┐┬┌─┐┬ ┬┬─┐┌─┐┌┬┐┬┌─┐┌┐┌
// │  │ ││││├┤ ││ ┬│ │├┬┘├─┤ │ ││ ││││
// └─┘└─┘┘└┘└  ┴└─┘└─┘┴└─┴ ┴ ┴ ┴└─┘┘└┘

const CONFIG = {
	// ┌┐ ┌─┐┌─┐┬┌─┐┌─┐
	// ├┴┐├─┤└─┐││  └─┐
	// └─┘┴ ┴└─┘┴└─┘└─┘

	// General
	name: 'Flip',
	imageBackground: false,
	openInNewTab: true,
	twelveHourFormat: false,

	// Greetings
	greetingMorning: 'Good morning!',
	greetingAfternoon: 'Good afternoon,',
	greetingEvening: 'Good evening,',
	greetingNight: 'Go to Sleep!',

	// Layout
	bentoLayout: 'lists', // 'bento', 'lists', 'buttons'

	// Weather
	weatherKey: 'InsertYourAPIKeyHere123456', // Write here your API Key
	weatherIcons: 'OneDark', // 'Onedark', 'Nord', 'Dark', 'White'
	weatherUnit: 'C', // 'F', 'C'
	language: 'en', // More languages in https://openweathermap.org/current#multi

	trackLocation: true, // If false or an error occurs, the app will use the lat/lon below
	defaultLatitude: '37.775',
	defaultLongitude: '-122.419',

	// Calendar (feeds proxied by nginx at /calendar-N.ics, URLs set in .env)
	calendarEnabled: true, // Replaces the weather widget
	calendarFeeds: ['calendar-1.ics', 'calendar-2.ics'], // One path per URL in CALENDAR_ICS_URLS, add calendar-3.ics … as needed
	calendarDays: 14, // How far ahead to look
	calendarMaxEvents: 5,
	calendarRefreshMinutes: 15,
	calendarLocale: 'sv-SE',

	// Catppuccin colors (https://catppuccin.com/palette/)
	catppuccin: true, // Light theme = Latte
	catppuccinDark: 'mocha', // 'frappe', 'macchiato', 'mocha'
	catppuccinAccent: 'mauve', // rosewater, flamingo, pink, mauve, red, maroon, peach, yellow, green, teal, sky, sapphire, blue, lavender
	catppuccinCardColors: ['mauve', 'peach', 'green', 'sapphire', 'pink', 'yellow', 'teal', 'lavender'], // Cycled over cards

	// Search (press / or Ctrl+K). Searches every link on the page plus these
	// hidden bookmarks. Nothing matches → web search, or open it if it looks like a domain.
	searchEngine: 'https://duckduckgo.com/?q=',
	bookmarks: [
		{ name: 'Syssla', url: 'https://syssla.felixarvidsson.se', tags: ['todo'] },
		{ name: 'Kaloripejl', url: 'https://kaloripejl.se', tags: ['mat'] },
		{ name: 'Portfolio', url: 'https://felixarvidsson.se', tags: [] },
		{ name: 'Home Assistant', url: 'https://homeassistant.felixarvidsson.se', tags: ['hem'] },
		{ name: 'Jellyfin (publik)', url: 'https://jellyfin.felixarvidsson.se', tags: ['media'] },
		{ name: 'Audiobookshelf', url: 'https://audiobooks.felixarvidsson.se', tags: ['media', 'böcker'] },
		{ name: 'Umami', url: 'https://umami.felixarvidsson.se', tags: ['analytics'] },
		{ name: 'Vikunja', url: 'https://vikunja.felixarvidsson.se', tags: ['todo'] },
		{ name: 'ntfy', url: 'https://ntfy.felixarvidsson.se', tags: ['notiser'] },
		{ name: 'Stronko', url: 'https://stronko.felixarvidsson.se', tags: ['träning'] },
		{ name: 'GuildThing', url: 'https://guildthing.duckdns.org', tags: ['wow'] },
		{ name: 'GitHub', url: 'https://github.com/felix-arvidsson', tags: ['kod'] },
	],

	// Syssla (proxied by nginx at /syssla/api, token set in .env)
	sysslaEnabled: true,
	sysslaUrl: 'https://syssla.felixarvidsson.se',
	sysslaScope: 'everything', // Scope name/id or 'everything'
	sysslaLists: [], // List titles to show, in order. Empty = all lists in the scope
	sysslaDefaultList: '', // Where the top input adds tasks without list:. Empty = first list
	sysslaMaxDone: 10, // Completed tasks shown per list when "show completed" is on
	sysslaRefreshMinutes: 5,

	// Autochange
	autoChangeTheme: true,

	// Autochange by OS
	changeThemeByOS: true,

	// Autochange by hour options (24hrs format, string must be in: hh:mm)
	changeThemeByHour: false,
	hourDarkThemeActive: '18:30',
	hourDarkThemeInactive: '07:00',

	// ┌┐ ┬ ┬┌┬┐┌┬┐┌─┐┌┐┌┌─┐
	// ├┴┐│ │ │  │ │ ││││└─┐
	// └─┘└─┘ ┴  ┴ └─┘┘└┘└─┘

	firstButtonsContainer: [
		{
			id: '1',
			name: 'Github',
			icon: 'github',
			link: 'https://github.com/',
		},
		{
			id: '2',
			name: 'Mail',
			icon: 'mail',
			link: 'https://mail.protonmail.com/',
		},
		{
			id: '3',
			name: 'Todoist',
			icon: 'trello',
			link: 'https://todoist.com',
		},
		{
			id: '4',
			name: 'Calendar',
			icon: 'calendar',
			link: 'https://calendar.google.com/calendar/r',
		},
		{
			id: '5',
			name: 'Reddit',
			icon: 'glasses',
			link: 'https://reddit.com',
		},
		{
			id: '6',
			name: 'Odysee',
			icon: 'youtube',
			link: 'https://odysee.com/',
		},
	],

	secondButtonsContainer: [
		{
			id: '1',
			name: 'Music',
			icon: 'headphones',
			link: 'https://open.spotify.com',
		},
		{
			id: '2',
			name: 'twitter',
			icon: 'twitter',
			link: 'https://twitter.com/',
		},
		{
			id: '3',
			name: 'bot',
			icon: 'bot',
			link: 'https://discord.com/app',
		},
		{
			id: '4',
			name: 'Amazon',
			icon: 'shopping-bag',
			link: 'https://amazon.com/',
		},
		{
			id: '5',
			name: 'Hashnode',
			icon: 'pen-tool',
			link: 'https://hashnode.com/',
		},
		{
			id: '6',
			name: 'Figma',
			icon: 'figma',
			link: 'https://figma.com/',
		},
	],

	// ┬  ┬┌─┐┌┬┐┌─┐
	// │  │└─┐ │ └─┐
	// ┴─┘┴└─┘ ┴ └─┘

	// First Links Container
	firstlistsContainer: [
		{
			icon: 'clapperboard',
			id: '1',
			links: [
				{
					name: 'Jellyfin',
					link: 'https://jellyfin.media.wtf',
				},
				{
					name: 'Seerr',
					link: 'https://seerr.media.wtf',
				},
				{
					name: 'Musik',
					link: 'https://musik.media.wtf',
				},
				{
					name: 'Music Assistant',
					link: 'https://ma.home.wtf',
				},
				{
					name: 'Calibre',
					link: 'https://calibre.media.wtf',
				},
			],
		},
		{
			icon: 'radar',
			id: '2',
			links: [
				{
					name: 'Sonarr',
					link: 'https://sonarr.media.wtf',
				},
				{
					name: 'Radarr',
					link: 'https://radarr.media.wtf',
				},
				{
					name: 'Lidarr',
					link: 'https://lidarr.media.wtf',
				},
				{
					name: 'Prowlarr',
					link: 'https://prowlarr.media.wtf',
				},
			],
		},
	],

	// Second Links Container
	secondListsContainer: [
		{
			icon: 'download',
			id: '1',
			links: [
				{
					name: 'Torrent',
					link: 'https://torrent.media.wtf',
				},
				{
					name: 'Deluge',
					link: 'https://deluge.media.wtf',
				},
				{
					name: 'Jackett',
					link: 'https://jackett.media.wtf',
				},
			],
		},
		{
			icon: 'server',
			id: '2',
			links: [
				{
					name: 'Proxmox',
					link: 'https://proxmox.fubar.wtf',
				},
				{
					name: 'Home Assistant',
					link: 'https://homeassistant.felixarvidsson.se',
				},
				{
					name: 'Pi-hole',
					link: 'https://pihole.infra.wtf/admin',
				},
				{
					name: 'Uptime',
					link: 'https://uptime.infra.wtf',
				},
				{
					name: 'Stronko',
					link: 'https://stronko.fubar.wtf',
				},
			],
		},
	],
};
