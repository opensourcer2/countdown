const {parse: parseBody} = require('../helpers/parse-body');
const {hbs} = require('../setup/handlebars');
const Event = require('../models/event.model');

module.exports = {
	renderAll,
	renderEdit,
	renderCreate,
	renderSingle,
	renderUndefinedSingle,
	create,
	seed,
	clear
};

function renderAll (req, res) {
	Event.find(function (err, events) {
		if (err) return res.send(err);

		res.render('pages/events', {events});
	});
}

function renderEdit (req, res) {
	Event.find(
		{slug: req.params.eventSlug},
		(err, docs) => {
			if (err) return res.send(err);

			res.render('pages/edit-event', {
				postPath: req.path,
				event: docs[0]
			});
		}
	);
}

function renderCreate (req, res) {
	res.render('pages/edit-event', {
		postPath: req.path
	});
}

function renderSingle (req, res) {
	Event.find(
		{slug: req.params.eventSlug},
		(err, result) => {
			if (err) return res.send(err);
			const event = result[0];
			let eventBody = hbs.handlebars.compile(event.body.html, {knownHelpers: {clock: true}})(event);
			res.render('pages/event', {event, eventBody});
		}
	);
}

function renderUndefinedSingle (req, res) {
	res.redirect('/events/');
}

function create (req, res) {
	console.log('create');
	console.log(req.body);
	console.log(req.file.path);

	var event = req.body;
	event.slug = event.title.toLowerCase();
	event.start = {datetime: 'dt', format: 'hh:mm'};
	event.body = {md: event['body-md']};
	event.background = {
		image: req.file ? req.file.path : ''
	};

	event.body.html = parseBody(event.body.md, event);
	console.log('event.body.html:', event.body.html);
	event = new Event(event);

	event.save((err) => {
		if (err) return res.send(err);

		res.redirect('/events/');
	});
}

function seed (req, res) {
	var insertions = [];
	var errors = [];
	var events = [
		{title: 'kladd', slug: 'kladd'},
		{title: 'klidd', slug: 'klidd'},
		{title: 'kledd', slug: 'kledd'},
		{title: 'kludd', slug: 'kludd'}
	];

	Event.remove({}, () => {
		for (var event of events) {
			event = new Event(event);
			insertions.push(event.save((err) => {
				if (err) errors.push(err);
			}));
		}
	});

	Promise.all(insertions).then(() => {
		if (errors.length) return res.send(errors);

		res.redirect('/events/');
	});
}

function clear (req, res) {
	Event.remove({}, (err) => {
		if (err) return res.send(err);

		res.redirect('/events/');
	});
}
