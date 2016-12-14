var request = require('sync-request');

var url_api = 'http://pokeapi.co/api/v1/pokemon/charmander/';
var res = request('GET', url_api );
var data = JSON.parse(res.getBody('utf8'));

var forms = data.forms;
var types = data.types;
var abilities = data.abilities;

var poke_types = [];
for(x in types){
	var type_name = types[x].name;
	//console.log(type_name);
	poke_types.push(type_name);
}
var poke_abilities = [];
for(y in abilities){
	var abilitie_name = abilities[y].name;
	poke_abilities.push(abilitie_name);
}

var poke_name = forms[0].name;

console.log('poke_name: ' + poke_name);
console.log('poke_types: '+ poke_types);
console.log('poke_abilities: '+ poke_abilities);