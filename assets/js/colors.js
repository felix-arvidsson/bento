// Catppuccin color per card, cycled from CONFIG.catppuccinCardColors.
// Falls back to the theme accent when Catppuccin is off.

const cardColor = (i) => {
	const colors = CONFIG.catppuccinCardColors || [];
	if (!CONFIG.catppuccin || !colors.length) return 'var(--accent)';
	return `var(--ctp-${colors[i % colors.length]})`;
};
