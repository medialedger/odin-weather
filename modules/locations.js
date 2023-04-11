import { renderPage } from './app.js';
import { getForecast } from './weather.js';

export async function renderSaved() {
	const locations = getLocations();
	if (locations) {
		document.querySelector('.saved').innerHTML = '';
		let locationHtml = '';
		for (const loc of locations) {
			const locData = await getForecast(loc.location);
			locationHtml += `<li data-location="${locData.location.lat},${locData.location.lon}">
				<h3>${locData.location.name}</h3>
				<span class="time">${locData.location.localtime}</span>
				<span class="condition">${locData.current.condition.text}</span>
				<span class="temp">${Math.round(locData.current.temp_f)}°</span>
				<span class="hi-low">H:${Math.round(locData.forecast.forecastday[0].day.maxtemp_f)}° L:${Math.round(locData.forecast.forecastday[0].day.mintemp_f)}°</span>
			</li>`;
		}
		document.querySelector('.saved').insertAdjacentHTML('afterbegin', locationHtml);
		const allLocLis = document.querySelectorAll('.saved li');
		if (allLocLis) {
			for (const loc of allLocLis) {
				loc.addEventListener('click', renderSavedLoc);
			}
		}
	}
}
export async function renderSavedLoc(e) {
	const thisLoc = e.target.dataset.location;
	let locData = {};
	if (thisLoc) {
		locData = await getForecast(thisLoc, 3);
	} else {
		locData = await getForecast(e.target.closest('li').dataset.location, 3);
	}
	renderPage(locData);		
}

function saveLocations(data) {
	localStorage.setItem('locations', JSON.stringify(data));
}
function getLocations() {
	return JSON.parse(localStorage.getItem('locations'));
}
