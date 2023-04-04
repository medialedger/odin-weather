export async function getImage(localtime, temp, condition, precip, wind) {
	let keywords = '';
	// time
	if (localtime) {
		const hour = new Date(localtime).getHours();
		if (hour > 5 && hour <= 12) {
			keywords += 'morning';
		} else if (hour > 12 && hour <= 16) {
			keywords += 'afternoon';
		} else if (hour > 16 && hour <= 20) {
			keywords += 'evening';
		} else {
			keywords += 'night';
		}
	} else {
		keywords += 'morning';
	}
	// temp
	if (temp) {
		if (temp <= 40) {
			keywords += '-cold';
		}
		if ( temp > 85) {
			keywords += '-hot';
		}
	}
	// condition
	if (condition) {
		keywords += `-${condition}`;
	}
	// precip
	if (precip) {
		if (precip >= 1 && temp <= 32) {
			keywords += '-snowy';
		}
		if (precip >= 1 && temp > 32) {
			keywords += '-rainy';
		}
	}
	// wind
	if (wind) {
		if (wind >= 15) {
			keywords += '-windy';
		}
	}
	try {
		const response = await fetch(`https://api.unsplash.com/search/photos?page=1&per_page=1&collections=N2PUsiNO9sg,136095,893395&query=${keywords}&orientation=landscape&client_id=y9VLj3xlyLy6sfo0TxhaJTca_-p9-4OWWPTDszFBD94`);
		return response.json();
	} catch (error) {
		console.log(error);
	}
}
