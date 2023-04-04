import { getCurrentWeather, getForecast } from './weather.js';
import { getImage } from './unsplash.js';

export async function renderCurrent() {
	async function success(pos) {
		// current location data
		const currentData = await getForecast(`${pos.coords.latitude},${pos.coords.longitude}`, 3);
		console.log(currentData);
		document.querySelector('header .current .name').innerText = currentData.location.name;
		document.querySelector('.now .name').innerText = currentData.location.name;
		document.querySelector('header .current .condition').innerText = currentData.current.condition.text;
		document.querySelector('.now .condition').innerText = currentData.current.condition.text;
		document.querySelector('header .current .temp').innerText = `${Math.round(currentData.current.temp_f)}°`;
		document.querySelector('.now .temp').innerText = `${Math.round(currentData.current.temp_f)}°`;
		document.querySelector('header .current .hi-low').innerText = `H:${Math.round(currentData.forecast.forecastday[0].day.maxtemp_f)}° L:${Math.round(currentData.forecast.forecastday[0].day.mintemp_f)}°`;
		document.querySelector('.now .hi-low').innerText = `H:${Math.round(currentData.forecast.forecastday[0].day.maxtemp_f)}° L:${Math.round(currentData.forecast.forecastday[0].day.mintemp_f)}°`;
		// hourly
		let hourlyHtml = '';
		const hourlyTimeFormat = new Intl.DateTimeFormat('en', {
			hour: 'numeric'
		});
		currentData.forecast.forecastday[0].hour.forEach((hour) => {
			const thisTime = new Date(hour.time);
			hourlyHtml += `<li><span class="hour">${hourlyTimeFormat.format(thisTime)}</span><img src="${hour.condition.icon}" alt="${hour.condition.text}"><span class="temp">${Math.round(hour.temp_f)}°</span></li>`;
		})
		document.querySelector('.hourly ol').insertAdjacentHTML('afterbegin', hourlyHtml);
		// forecast
		let forecastHtml = '';
		const forecastDateFormat = new Intl.DateTimeFormat('en', {
			weekday: 'short'
		});
		currentData.forecast.forecastday.forEach((day) => {
			const thisTime = new Date(`${day.date} 00:00`);
			forecastHtml += `<li><span class="date">${forecastDateFormat.format(thisTime)}</span><img src="${day.day.condition.icon}" alt="${day.day.condition.text}"><span class="hi-low"><span class="low">${Math.round(day.day.mintemp_f)}°</span><hr><span class="high">${Math.round(day.day.maxtemp_f)}°</span></span></li>`;
		})
		document.querySelector('.forecast ol').insertAdjacentHTML('afterbegin', forecastHtml);
		// wind
		document.querySelector('.wind .arrow').style.transform = `translateX(-50%) rotate(${currentData.current.wind_degree}deg)`;
		document.querySelector('.wind .wind-number').innerText = currentData.current.wind_mph;
		// pressure
		let pressureDeg = 0;
		if (currentData.current.pressure_in > 29.92) {
			pressureDeg = (currentData.current.pressure_in - 29.92) * 25;
		} else if (currentData.current.pressure_in < 29.92) {
			pressureDeg = (29.92 - currentData.current.pressure_in) * 25;
		}
		document.querySelector('.pressure .arrow').style.transform = `rotate(${pressureDeg}deg)`;
		document.querySelector('.pressure .pressure-number').innerText = currentData.current.pressure_in;
		// air quality
		let aqi = 'Good';
		switch (currentData.current.air_quality["us-epa-index"]) {
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
		document.querySelector('.aqi .marker').style.left = `%{((currentData.current.air_quality["us-epa-index"] - 1) / 5) * 100}%`;
		// UV
		document.querySelector('.uv .number').innerText = currentData.current.uv;
		let uvDesc = 'Low';
		if (currentData.current.uv > 2 && currentData.current.uv <= 5) {
			uvDesc = 'Moderate';
		} else if (currentData.current.uv > 5 && currentData.current.uv <= 7) {
			uvDesc = 'High';
		} else if (currentData.current.uv > 7 && currentData.current.uv <= 10) {
			uvDesc = 'Very High';
		} else if (currentData.current.uv > 11) {
			uvDesc = 'Extreme';
		}
		document.querySelector('.uv .description').innerText = uvDesc;
		if (currentData.current.uv > 11) {
			document.querySelector('.uv .marker').style.left = '100%';
		} else {
			document.querySelector('.uv .marker').style.left = `%{((currentData.current.uv - 1) / 5) * 50}%`;
		}
		// sunset
		// precip
		// BG image
		const bgImage = await getImage(currentData.location.localtime, currentData.current.feelslike_f, currentData.current.condition.text, currentData.current.precip_mm, currentData.current.wind_mph);
		document.querySelector('body').style.backgroundImage = `url(${bgImage.results[0].urls.full})`;
	}
	function error(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	}
	navigator.geolocation.getCurrentPosition(success, error);
}
