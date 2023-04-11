import { getForecast } from './weather.js';
import { renderPage } from './app.js';

export function initSearch() {
	document.getElementById('form-search').addEventListener('submit', doSearch);
}
async function doSearch(e) {
	e.preventDefault();
	const thisForm = e.target;
	const thisLoc = thisForm.querySelector('#search').value;
	if (thisLoc) {
		const thisForecast = await getForecast(thisLoc, 3);
		renderPage(thisForecast);
	}
}