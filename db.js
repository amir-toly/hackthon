
var db_host= process.env.DB_HOST || 'localhost';
var db_port=  process.env.DB_PORT || 27017;
var db_name  = process.env.DB_NAME || 'test';
var mongo_str='mongodb://'+db_host+':'+db_port+'/'+ db_name
console.log('db string:' + mongo_str);

module.exports = {
	//'url' : 'mongodb://<dbuser>:<dbpassword>@novus.modulusmongo.net:27017/<dbName>'

	url: mongo_str
}