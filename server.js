const express = require('express');
const app = express();
const dotenv = require('dotenv').config(); 

const bodyParser = require('body-parser'); 
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DATABASE_URL;
const PORT = process.env.PORT || 9000;
app.get('/',(req,res,next) => {

	res.sendFile('/Users/Rudra Bdr Rana/Desktop/Todo1/public'+'/index.html');
	
})

//'/Users/Rudra Bdr Rana/Desktop/Todoapp/public'+'/

MongoClient.connect(url,{useUnifiedTopology: true}).then(client => {
	
	const db = client.db('taskList');
//const db = client.db('userData');
	const tasks = db.collection('tasks');
	
	app.use(express.static('public'));
	
	app.use(bodyParser.json());

	app.get('/list', (req,res,next) => {
		
	tasks.find({}).toArray((err,result) => {
			if(err) console.error(err);
				 res.send(result);
			})
		
	});
	
	app.post('/add', (req, res) => {
		tasks.insertOne(req.body)
			.then(result => {
				res.json('success');	
			})
		
		});

	app.put('/change', (req,res)=> {
		var myQuery = {'date': req.body.date};
		var data = req.body.todoList;
    tasks.updateOne(myQuery,{$set: {'todoList': data }},(err,result)=>{
		 if(err) console.error(err);
		 res.json('success');
		});
		
	});
	
	app.delete('/remove',(req,res)=>{
		var myQuery = req.body;
		tasks.deleteOne(myQuery, (err, obj) => {
			if(err) console.error(err);
		  res.json('success');
		})
	});
	
	app.listen(PORT, () => {
			console.log('Server is running! at port:' + PORT);
			});

}).catch(error => console.error(error))




