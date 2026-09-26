// ┬  ┬┌─┐┌┬┐┌─┐
// │  │└─┐ │ └─┐
// ┴─┘┴└─┘ ┴ └─┘
// Functions for printing both lists

let listCardIndex = 0;

const renderList = (list, container) => {
	const target = CONFIG.openInNewTab ? '_blank' : '';
	const links = list.links
		.map(
			(l) => `
          <a
          target="${target}"
          href="${l.link}"
          class="listItem"
          >${l.name}</a>`
		)
		.join('');
	const item = `
        <div class="card list list__${list.id}" id="list_${list.id}" style="--card-accent: ${cardColor(listCardIndex++)}">
          <i class="listIcon" data-lucide="${list.icon}"></i>${links}
        </div>
      `;
	container.insertAdjacentHTML('beforeend', item);
};

const generateFirstListsContainer = () => {
	for (const list of CONFIG.firstlistsContainer) renderList(list, lists_1);
};

const generateSecondListsContainer = () => {
	for (const list of CONFIG.secondListsContainer) renderList(list, lists_2);
};

const generateLists = () => {
	switch (CONFIG.bentoLayout) {
		case 'bento':
			generateFirstListsContainer();
			break;
		case 'lists':
			generateFirstListsContainer();
			generateSecondListsContainer();
			break;
		default:
			break;
	}
};

generateLists();
