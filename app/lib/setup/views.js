'use strict';

const exphbs = require('express-handlebars');
const helpers = require('../helpers/view-helpers');
let hbs;

module.exports = setup;
module.exports.getEngine = getEngine;

function setup (app) {
	const {engine} = getEngine();
	app.engine('hbs', engine);
	app.set('view engine', 'hbs');
	app.set('views', 'app/views');
}

function getEngine () {
	if (hbs) return hbs;

	return hbs = exphbs.create({
		extname: '.hbs',
		defaultLayout: 'main',
		layoutsDir: 'app/views/layouts',
		partialsDir: 'app/views/partials',
		helpers
	});
}
