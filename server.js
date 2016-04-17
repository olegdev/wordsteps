GLOBAL.BASE_PATH = __dirname;
GLOBAL.SERVICES_PATH = __dirname + '/server/services';
GLOBAL.API_PATH = __dirname + '/server/api';
GLOBAL.CONFIG = require(BASE_PATH + '/server/util').getModuleConfig(__filename);

var express = require('express');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');
var join = require('path').join;

var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var dbconnect = require(SERVICES_PATH + '/dbconnect/dbconnect');

var auth = require(SERVICES_PATH + '/auth');
var sockets = require(SERVICES_PATH + '/sockets');
var getConfig = require(SERVICES_PATH + '/getconfig/getconfig');
var dictionary = require(SERVICES_PATH + '/dictionary/dictionary');
var bots = require(SERVICES_PATH + '/bots/bots');
var rating = require(SERVICES_PATH + '/rating/rating');
var timed = require(SERVICES_PATH + '/timed/timed');
var buffs = require(SERVICES_PATH + '/buffs/buffs');
var gameInfo = require(SERVICES_PATH + '/gameinfo/gameinfo');
var vk = require(SERVICES_PATH + '/social/vk');

//============= Create server ============

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.use(cookieParser());

// =========== DB connect as middleware ===============

app.use(dbconnect);

//============= Session ============

var sessionMiddleware = session({
    secret: 'MHsession',
    saveUninitialized: true,
	resave: false,
    store: new MongoStore({
		mongooseConnection: mongoose.connection,
		autoReconnect: true,		
		collection: 'sessions',
		stringify: true,
		hash: false,
		ttl:  60 * 60 * 24 * 14, // 14 days
		autoRemove: 'native',
		autoRemoveInterval: 10,
    })
});

app.use(sessionMiddleware);

//============= Static ============

app.use(compression());
app.use(express.static(__dirname + '/client'));

//============= Template engine ============

var hbs = exphbs.create({
    defaultLayout: 'default',
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// ============== ROUTES ================

app.get("/", function(req, res, next) {
	if (!req.session.uid) {		
		res.redirect('/login');
	} else {
		getConfig
			.getConfig(req.session.uid, function(err, config) {
				if (!err && config) {
					app.locals.config = JSON.stringify(config);
					if (config.debug) {
						app.locals.debug = JSON.stringify(config.debug);						
					}
					res.render('main', {layout: 'main'});
				} else {
					if (!config) {
						/****/ logger.error('Config for user id ' + req.session.uid + ' not found');
					}
					res.status(500).send("Internal server error");
				}
			});
	}
});
app.get("/login", function(req, res, next) {
	if (!req.session.uid) {
		res.render('login');
	} else {
		res.redirect('/');
	}
});
app.get("/vk", function(req, res, next) {
	/****/ logger.info('User auth ' + JSON.stringify(req.query));
	vk.auth(req.query, function(err, uid) {
		/****/ logger.info('User auth success ' + uid);
		if (!err) {
			if (uid) {
				req.session.uid = uid;
				res.redirect('/');
			} else {
				res.end('User not found.');
			}
		} else {
			res.status(500).send("Internal server error");	
		}
	});
});
app.post("/vk_order", function(req, res, next) {
	vk.order(req.body, function(err, data) {
		if (!err) {
			res.setHeader('Content-Type', 'application/json; charset=utf-8');
    		res.send(JSON.stringify({response: data}));
		} else {
			res.status(500).send("Internal server error");	
		}
	});
});
app.post('/login', function(req, res, next) {
	auth
		.auth(req.body.login, req.body.pass, function(err, uid) {
			if (!err) {
				if (uid) {
					req.session.uid = uid;
					res.redirect('/');
				} else {
					res.end('User not found.');
				}
			} else {
				res.status(500).send("Internal server error");	
			}
		});
});
app.get("/info", function(req, res, next) {
	app.locals.info = gameInfo.getInfo();
	res.render('info');
});

var server = app.listen(CONFIG.port);
var serverHttps = https.createServer({
      key: fs.readFileSync('./ssl/private'),
      cert: fs.readFileSync('./ssl/certificate'),
      ca: [
      	fs.readFileSync('./ssl/root_cert'),
      	fs.readFileSync('./ssl/intermediate_cert'),
      	fs.readFileSync('./ssl/cert_request')
      ]
    }, app).listen(CONFIG.portHttps);

// ============ Socket IO =========

var sio = sockets.listen(server);
var sio2 = sockets.listen(serverHttps);

sio.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
sio.use(function(socket, next) {
    dbconnect(socket.request, socket.request.res, next);
});
sio2.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
sio2.use(function(socket, next) {
    dbconnect(socket.request, socket.request.res, next);
});

// ============= Bootstrap models ==========

fs.readdirSync(join(BASE_PATH, 'server/models')).forEach(function (file) {
  if (~file.indexOf('.js')) require(join(BASE_PATH, 'server/models', file));
});

// ============ Bootstrap api =============
fs.readdirSync(join(BASE_PATH, 'server/api')).forEach(function (file) {
  if (~file.indexOf('.js')) require(join(BASE_PATH, 'server/api', file));
});

// ============ Load dictionary ===========
dictionary.load(function(err) {
	if (!err) {
		/****/ logger.info('Dictionary loaded with ' + dictionary.dictionary.words.length + ' words');
	} else {
		/****/ logger.error('Dictionary load error');
	}
});

// ============ Load bots ===========
bots.load(function(err) {
	if (!err) {
		/****/ logger.info('Bots loaded');
	} else {
		/****/ logger.error('Bots load error');
	}
});

// ============ Recalc rating ===========
rating.recalcRating(function(err) {
	if (!err) {
		/****/ logger.info('Rating is ready');
	} else {
		/****/ logger.error('Rating calculation error');
	}
});

// ============ Timed refreshing ===========
timed.refreshValues(function(err) {
	if (!err) {
		/****/ logger.info('Timed was refreshed');
	} else {
		/****/ logger.error('Timed refreshing error');
	}
});

// ============ Buffs refreshing ===========
buffs.refreshValues(function(err) {
	if (!err) {
		/****/ logger.info('Buffs was refreshed');
	} else {
		/****/ logger.error('Buffs refreshing error');
	}
});

/****/ logger.info('Node app started on port ' + CONFIG.port);
/****/ logger.info('Node https app started on port ' + CONFIG.portHttps);