'use strict';

const fs = require('fs');
const gm = require('gm');
const path = require('path');
const uuid = require('uuid/v4');

const {getResourceDir} = require('../setup/files');

const imageRoot = 'images';

module.exports = handleImage;
module.exports.removeImage = removeImage;
module.exports.getImagePath = getImagePath;

function handleImage (file) {
	console.log('file', file);
	return new Promise((...p) => processImage(file, ...p));
}

function removeImage (filePath, includingDir) {
	const dirPath = path.substr(0, path.lastIndexOf('/'));
	return new Promise((resolve, reject) => {
		fs.unlink(filePath, fileErr => {
			if (fileErr) return reject(fileErr);
			if (!includingDir) return resolve();

			fs.rmdir(dirPath, dirErr => {
				if (dirErr) return reject(dirErr);
				resolve();
			});
		});
	});
}

function processImage (file, resolve, reject) {
	if (!file) return reject('no file!');

	const id = uuid();
	const extension = path.extname(file.originalname);
	const imagePath = getImagePath(id, 'original' + extension);
	const imageDirPath = getResourceDir(imageRoot, id);
	const writePath = getResourceDir(imagePath);

	return writeDir(() => {
		writeImage(() => {
			resolve('/' + imagePath);
		});
	});

	function writeDir (done) {
		fs.mkdir(imageDirPath, 484, (err) => {
			// console.log('making dir');
			if (err) return reject(err);
			// console.log('making dir - success');
			done();
		});
	}

	function writeImage (done) {
		gm(file.path)
			.noProfile()
			.write(writePath, (err) => {
				if (err) return rollback(err);
				setImmediate(cleanTemp);
				done();
			});
	}

	function rollback (imageErr) {
		fs.rmdir(imageDirPath, dirErr => console.error(dirErr));
		reject(imageErr);
	}

	function cleanTemp () {
		fs.unlink(file.path, err => {
			if (err) console.error(err);
		});
	}
}

function getImagePath (...pathTailFragments) {
	return path.posix.join(imageRoot, ...pathTailFragments);
}
