
var db_host= process.env.DB_HOST || 'localhost';
var db_port=  process.env.DB_PORT || 27017;
var db_name  = process.env.DB_PORT || 'test';
console.log('db string' +db_host);
 var mongo_str='mongodb://'+db_host+':'+db_port+'/'+ db_name

module.exports = {
	//'url' : 'mongodb://<dbuser>:<dbpassword>@novus.modulusmongo.net:27017/<dbName>'

	url: mongo_str
}