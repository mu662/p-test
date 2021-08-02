var express = require('Express');
var app = express();
var cors = require('cors')
require('dotenv').config()
var mongoose = require("mongoose");
var apiRoute = require('./routes/api');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

/**
 * @mongodb connection...
 */
var MONGODB_URL = process.env.MONGODB_URL;
console.log('MONGODB_URL', MONGODB_URL)

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
	if (process.env.NODE_ENV !== "test") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
var db = mongoose.connection;
//-----//

app.use('/api', apiRoute);

app.get('/', function (req, res) {
    console.log('working')
    res.send("Hello world!");
});

app.listen(3001, (err) => {
    if (err) throw err;
    console.log(`app is running on port 3001`)
});