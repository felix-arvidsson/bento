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

	// Calendar (feed proxied by nginx at /calendar.ics, URL set in .env)
	calendarEnabled: true, // Replaces the weather widget
	calendarDays: 14, // How far ahead to look
	calendarMaxEvents: 5,
	calendarRefreshMinutes: 15,
	calendarLocale: 'sv-SE',

	// Catppuccin colors (https://catppuccin.com/palette/)
	catppuccin: true, // Light theme = Latte
	catppuccinDark: 'mocha', // 'frappe', 'macchiato', 'mocha'
	catppuccinAccent: 'mauve', // rosewater, flamingo, pink, mauve, red, maroon, peach, yellow, green, teal, sky, sapphire, blue, lavender

	// Syssla (proxied by nginx at /syssla/api, token set in .env)
	sysslaEnabled: true,
	sysslaUrl: 'https://syssla.felixarvidsson.se',
	sysslaScope: 'everything', // Scope name/id or 'everything'
	sysslaLists: [], // List titles to show, in order. Empty = all lists with open tasks
	sysslaMaxTasks: 6, // Per list
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
