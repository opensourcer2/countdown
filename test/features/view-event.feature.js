'use strict';

const cheerio = require('cheerio');
const request = require('supertest');

const app = require('../../app/app');
const factory = require('../helpers/factories');
const Event = require('../../app/lib/models/event.model');

feature('View event', () => {
	before(() => Event.remove({}));

	scenario('User views an event', () => {
		let $, $event, event;

		before(async () => {
			event = await factory.create('event', {backgroundImage: null});
		});

		when('the user visits the event page', done => {
			request(app)
				.get(`/event/${event.slug}/`)
				.expect(200)
				.end((err, res) => {
					if (err) return done(err);
					$ = cheerio.load(res.text);
					done();
				});
		});

		then('they should see an event', () => {
			$event = $('.event');
			expect($event).to.have.length(1);
		});

		and('it should contain some event details', () => {
			expect($('h1').text()).to.equal(event.title);
		});

		and('it should have some styling', () => {
			const stylesheet = $('style');
			const styles = stylesheet.html();

			expect(styles).to.include(`color: ${event.style.text.color};`);
			expect(styles).to.include(`font: ${event.style.text.fontBody};`);
			expect(styles).to.include(`font: ${event.style.text.fontHeading};`);

			expect(styles).to.include(`background-color: ${event.style.background.color};`);
			expect(styles).to.include(`background-image: url(${event.style.background.image});`);
		});
	});
});
