function listenServer () {
	const port = this.app.get('port');
	console.log(`Node app is running on port: ${port}`);
}

module.exports = listenServer;