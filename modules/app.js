import { getForecast } from './weather.js';
import { renderSavedLoc } from './locations.js';
import { getImage } from './unsplash.js';

export async function renderCurrent() {
	async function success(pos) {
		const currentData = await getForecast(`${pos.coords.latitude},${pos.coords.longitude}`, 3);
		renderPage(currentData);
		renderCurrentLocData(currentData.location, currentData.current, currentData.forecast.forecastday[0].day);
	}
	function error(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	}
	navigator.geolocation.getCurrentPosition(success, error);
}

export function renderPage(data) {
	renderLocData(data.location, data.current, data.forecast.forecastday[0].day);
	renderHourly(data.forecast.forecastday[0].hour);
	renderForecast(data.forecast.forecastday);
	renderWind(data.current);
	renderPressure(data.current);
	renderAQI(data.current);
	renderUV(data.current);
	renderSun(data.forecast.forecastday);
	renderPrecip(data.current.precip_in, data.forecast.forecastday[0].day.totalprecip_in);
	renderFeels(data.current.feelslike_f);
	renderHumidity(data.current.humidity);
	renderVisibility(data.current.vis_miles);
	renderClouds(data.current.cloud);
	renderBgImage(data.location.localtime, data.current);
}
function renderCurrentLocData(loc, curr, fore) {
	const currLoc = document.querySelector('header .current');
	currLoc.querySelector('li').dataset.location = `${loc.lat},${loc.lon}`;
	currLoc.querySelector('.name').innerText = loc.name;
	currLoc.querySelector('.condition').innerText = curr.condition.text;
	currLoc.querySelector('.temp').innerText = `${Math.round(curr.temp_f)}°`;
	currLoc.querySelector('.hi-low').innerText = `H:${Math.round(fore.maxtemp_f)}° L:${Math.round(fore.mintemp_f)}°`;
	currLoc.addEventListener('click', renderSavedLoc);
}
function renderLocData(loc, curr, fore) {
	document.querySelector('.now .name').innerText = loc.name;
	document.querySelector('.now .condition').innerText = curr.condition.text;
	document.querySelector('.now .temp').innerText = `${Math.round(curr.temp_f)}°`;
	document.querySelector('.now .hi-low').innerText = `H:${Math.round(fore.maxtemp_f)}° L:${Math.round(fore.mintemp_f)}°`;
}
function renderHourly(data) {
	let hourlyHtml = '';
	const hourlyTimeFormat = new Intl.DateTimeFormat('en', {
		hour: 'numeric'
	});
	data.forEach((hour) => {
		const thisTime = new Date(hour.time);
		hourlyHtml += `<li><span class="hour">${hourlyTimeFormat.format(thisTime)}</span><img src="${hour.condition.icon}" alt="${hour.condition.text}"><span class="temp">${Math.round(hour.temp_f)}°</span></li>`;
	})
	document.querySelector('.hourly ol').innerHTML = '';
	document.querySelector('.hourly ol').insertAdjacentHTML('afterbegin', hourlyHtml);
}
function renderForecast(data) {
	let forecastHtml = '';
	const forecastDateFormat = new Intl.DateTimeFormat('en', {
		weekday: 'short'
	});
	data.forEach((day) => {
		const thisTime = new Date(`${day.date} 00:00`);
		forecastHtml += `<li><span class="date">${forecastDateFormat.format(thisTime)}</span><img src="${day.day.condition.icon}" alt="${day.day.condition.text}"><span class="hi-low"><span class="low">${Math.round(day.day.mintemp_f)}°</span><hr><span class="high">${Math.round(day.day.maxtemp_f)}°</span></span></li>`;
	})
	document.querySelector('.forecast ol').innerHTML = '';
	document.querySelector('.forecast ol').insertAdjacentHTML('afterbegin', forecastHtml);
}
function renderWind(data) {
	document.querySelector('.wind .arrow').style.transform = `rotate(${data.wind_degree}deg)`;
	document.querySelector('.wind .dial-number').innerText = data.wind_mph;
}
function renderPressure(data) {
	let pressureDeg = 0;
	if (data.pressure_in > 29.92) {
		pressureDeg = (data.pressure_in - 29.92) * 25;
	} else if (data.pressure_in < 29.92) {
		pressureDeg = (29.92 - data.pressure_in) * 25;
	}
	document.querySelector('.pressure .arrow').style.transform = `rotate(${pressureDeg}deg)`;
	document.querySelector('.pressure .dial-number').innerText = data.pressure_in;
}
function renderAQI(data) {
	document.querySelector('.aqi .number').innerText = data.air_quality["us-epa-index"];
	let aqi = 'Good';
	switch (data.air_quality["us-epa-index"]) {
		case 2:
			aqi = 'Moderate';
			break;
		case 3:
			aqi = 'Unhealthy for Sensitive Groups';
			break;
		case 4:
			aqi = 'Unhealthy';
			break;
		case 5:
			aqi = 'Very Unhealthy';
			break;
		case 6:
			aqi = 'Hazardous';
			break;
		default:
			break;
	}
	document.querySelector('.aqi .description').innerText = aqi;
	document.querySelector('.aqi .marker').style.left = `${((data.air_quality["us-epa-index"] - 1) / 5) * 100}%`;
}
function renderUV(data) {
	document.querySelector('.uv .number').innerText = data.uv;
	let uvDesc = 'Low';
	if (data.uv > 2 && data.uv <= 5) {
		uvDesc = 'Moderate';
	} else if (data.uv > 5 && data.uv <= 7) {
		uvDesc = 'High';
	} else if (data.uv > 7 && data.uv <= 10) {
		uvDesc = 'Very High';
	} else if (data.uv > 11) {
		uvDesc = 'Extreme';
	}
	document.querySelector('.uv .description').innerText = uvDesc;
	if (data.uv > 11) {
		document.querySelector('.uv .marker').style.left = '100%';
	} else {
		document.querySelector('.uv .marker').style.left = `${((data.uv - 1) / 5) * 50}%`;
	}
}
function renderSun(data) {
	const sunNow = new Date();
	const sunNow24 = (sunNow.getHours() * 100) + sunNow.getMinutes();
	const sunrise = data[0].astro.sunrise;
	let sunRise24 = '';
	if (sunrise.includes(' AM')) {
		sunRise24 = Number(sunrise.replace(' AM', '').replace(':', ''));
	} else {
		sunRise24 = Number(sunrise.replace(' PM', '').replace(':', '')) + 1200;
	}
	const sunset = data[0].astro.sunset;
	let sunSet24 = '';
	if (sunset.includes(' PM')) {
		sunSet24 = Number(sunset.replace(' PM', '').replace(':', '')) + 1200;
	} else {
		sunSet24 = Number(sunset.replace(' AM', '').replace(':', ''));
	}
	if (sunNow24 < sunRise24) {
		document.querySelector('.sun .icon-sunset').classList.add('hidden');
		document.querySelector('.sun .number').innerText = sunrise;
		document.querySelector('.sun .description').innerText = `Sunset: ${sunset}`;
	} else {
		document.querySelector('.sun .icon-sunrise').classList.add('hidden');
		document.querySelector('.sun .sun-text').innerText = 'Sunset';
		const sunRiseTomorrow = data[1].astro.sunrise;
		document.querySelector('.sun .number').innerText = sunset;
		document.querySelector('.sun .description').innerText = `Sunrise: ${sunRiseTomorrow}`;
	}
	document.querySelector('.sun .bar').style.backgroundImage = `linear-gradient(to right, hsla(0, 0%, 100%, .16) ${sunRise24 / 24}%, hsla(0, 0%, 100%, .4) ${sunRise24 / 24}% ${sunSet24 / 24}%, hsla(0, 0%, 100%, .16) ${sunSet24 / 24}%)`;
	document.querySelector('.sun .marker').style.left = `${sunNow24 / 24}%`;
}
function renderPrecip(curr, fore) {
	document.querySelector('.precip .number').innerText = `${curr}"`;
	document.querySelector('.precip .description').innerText = `${fore}" expected today`;
}
function renderFeels(data) {
	document.querySelector('.feels .number').innerText = `${Math.round(data)}°`;
}
function renderHumidity(data) {
	document.querySelector('.humidity .number').innerText = `${Math.round(data)}%`;
}
function renderVisibility(data) {
	document.querySelector('.vis .number').innerText = `${data} mi`;
}
function renderClouds(data) {
	document.querySelector('.cloud .number').innerText = `${data}%`;
}
async function renderBgImage(time, curr) {
	const bgImage = await getImage(time, curr.feelslike_f, curr.condition.text, curr.precip_mm, curr.wind_mph);
	document.querySelector('body').style.backgroundImage = `url(${bgImage.urls.full})`;
}
