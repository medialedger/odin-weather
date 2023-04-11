import { renderCurrent } from './modules/app.js';
import { initSearch } from './modules/search.js';
import { renderSaved } from './modules/locations.js';

renderCurrent();
initSearch();
renderSaved();