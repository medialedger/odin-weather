export async function getCurrentWeather(loc) {
	try {
		const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=2c2ea9ec44b64c4797120433232803&q=${loc}`);
		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}

export async function getForecast(loc,days) {
	try {
		const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=2c2ea9ec44b64c4797120433232803&q=${loc}&days=${days}&aqi=yes&alerts=no`);
		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}
