const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
	res.render('hello', { title: 'Find & Rate Resturants', city: 'San Rafael' });
});

router.get('/reverse/:name/:city', (req, res) => {
	console.log([...req.params.city]);
	//console.log([...req.params.name].reverse().join(''));
	res.send('Name reversed !!!');
});
module.exports = router;
