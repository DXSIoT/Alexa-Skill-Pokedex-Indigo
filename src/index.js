/////
require('dotenv').config()
var alexa = require("alexa-app");
var http_request = require('sync-request');
var pokes = require('./pokes');
/////

var app = new alexa.app("Unofficial-Pokedex");
var HOST_API = process.env.HOST_API;
var HOST_SPRITES = process.env.HOST_SPRITES;
var APP_ID = process.env.APP_ID;

app.launch(function(request, response) {
  //response.shouldEndSession(false);
    //return 
    response        
        .card("Bienvenido a tu Pokedex","Puedes preguntar informacion acerca de un Pokemon.");        
    response
        .say("Para instrucciones de que puedes preguntar, pide ayuda.")        
        .shouldEndSession(false)
        .send();
});

app.intent("AMAZON.StopIntent",
	function(request, response){		
		response
			.say("Adios")
			.send();
	});

app.intent("AMAZON.CancelIntent",
	function(request, response){
		
		response
			.say("Adios")
			.send();
	});


app.intent("AMAZON.HelpIntent",
	function(request, response){
		
		response
            .say("Puedes preguntar por informacion de un pokemon, solo di su nombre... Actualmente hay informacion disponible para " + Object.keys(pokes).length + " pokemons")			
			.shouldEndSession(false)
			.send();
	});

app.intent("PokemonIntent", 
	{
		"slots": { "Poke" : "LIST_OF_POKES"},
		"utterances": [
			"PokemonIntent information of {Poke}",
			"PokemonIntent information about {Poke}",
			"PokemonIntent for {Poke}",
			"PokemonIntent about {Poke}"
		]
	},
	function(request, response){
		var itemSlot = request.slot("Poke"),
            itemName;

        if (itemSlot){ itemName = itemSlot.toLowerCase();  }
        
        var cardTitle = "Informacion de " + itemName,
            pokeid = parseInt(pokes[itemName]),
            speechOutput,
            repromptOutput;
        var speech;

        if (pokeid) {           
            	speech = itemName + ' es el Pokemon numero ' + pokeid +'.';
            try {                
                json = getApiResponse(HOST_API + '/pokemon/'+ pokeid);                
                if(json.error){
                	speech+= 'Hubo un error obteniendo informacion de ese Pokemon. Intenta de nuevo con otro.';
                }else{
                	var data = json.data;	               	               	                
	                speech+= ' y' + buildTypeSpeech(data.types);
	                speech+= ' y' + buildAbilitiesSpeech(data.abilities);	                
                }                
            } catch (err) { //throw err;
                speech+= ' Hubo un error obteniendo informacion de la Api de Pokemon. Intenta de nuevo mas tarde o prueba con otro Pokemon.';
            }

        }else{
            if (itemName) {
                speech = "Lo siento, actualmente no tengo informacion para " + itemName + ". Con que otra cosa te puedo ayudar?";                
            } else {
                speech = "Lo siento, actualmente no conozco ese Pokemon. Con que mas te puede ayudar?";                
            }
        }
        
        var card = 
        {
			type: "Standard",
			title: cardTitle,
			text: speech		
		};

		if(pokeid){
            card.image = 
            {
                smallImageUrl: pokemonImageFront(pokeid),
                largeImageUrl: pokemonImageFront(pokeid)
            };
		}

        response
        	.card(card);	
		
		response
			.say(speech)
            .shouldEndSession(false)
			.send();
	}
);

app.intent("PokemonTypeIntent", 
	{
		"slots": { "Poke" : "LIST_OF_POKES"},
		"utterances": [			
			"PokemonTypeIntent what type is {Poke}",
			"PokemonTypeIntent {Poke} type"

		]
	},
	function(request, response){
		var itemSlot = request.slot("Poke"),
            itemName;

        if (itemSlot){ itemName = itemSlot.toLowerCase();  }
        
        var cardTitle = "Tipo Pokemon de " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        var speech = '';

        if (pokeid) {                       	
            try {                
                json = getApiResponse(HOST_API + '/pokemon/'+ pokeid);                
                if(json.error){
                	speech+= 'Hubo un error obteniendo informacion de ese Pokemon. Intenta de nuevo con otro.';
                }else{
                	speech = itemName
                	var data = json.data;	               	               	                
	                speech+= ' ' + buildTypeSpeech(data.types);	                
                }                
            } catch (err) { //throw err;
            	speech+= ' Hubo un error obteniendo informacion de la Api de Pokemon. Intenta de nuevo mas tarde o prueba con otro Pokemon.';
            }

        }else{
            if (itemName) {
                speech = "Lo siento, actualmente no tengo informacion para " + itemName + ". Con que otra cosa te puedo ayudar?";                
            } else {
                speech = "Lo siento, actualmente no conozco ese Pokemon. Con que mas te puede ayudar?";                
            }
        }
        
        response
            .card({
    			type: "Simple",
    			title: cardTitle, // this is not required for type Simple
    			content: speech
    		});		
		
		response
            .say(speech)
            .shouldEndSession(false)
            .send();
	}
);

app.intent("PokemonNumberIntent", 
	{
		"slots": { "Poke" : "LIST_OF_POKES"},
		"utterances": [			
			"PokemonNumberIntent what number is {Poke}",
			"PokemonNumberIntent {Poke} number"

		]
	},
	function(request, response){
		var itemSlot = request.slot("Poke"),
            itemName;

        if (itemSlot){ itemName = itemSlot.toLowerCase();  }
        
        var cardTitle = "Numero de Pokemon de " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        var speech = '';

        if (pokeid) { 
        	var speech = 'Este pokemon es el numero ' + pokeid;
        }else{
            if (itemName) {
                speech = "Lo siento, actualmente no tengo informacion para " + itemName + ". Con que otra cosa te puedo ayudar?";                
            } else {
                speech = "Lo siento, actualmente no conozco ese Pokemon. Con que mas te puede ayudar?";                
            }
        }
        
        response
            .card({
    			type: "Simple",
    			title: cardTitle, // this is not required for type Simple
    			content: speech
    		});		
	
		response
            .say(speech)
            .shouldEndSession(false)
            .send();
	}
);

app.intent("PokemonEvolutionIntent", 
	{
		"slots": { "Poke" : "LIST_OF_POKES"},
		"utterances": [
			"PokemonEvolutionIntent in which evolves {Poke}",
			"PokemonEvolutionIntent in which pokemon evolves {Poke}",
			"PokemonEvolutionIntent evolution of {Poke}",
			"PokemonEvolutionIntent evolves {Poke}"
		]
	},
	function(request, response){
		var itemSlot = request.slot("Poke"),
            itemName;

        if (itemSlot){ itemName = itemSlot.toLowerCase();  }
        
        var cardTitle = "Evolucion de " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        var speech = '';

        var poke_evolved = false;
        if (pokeid) {                       	
            try {                
                json = getApiResponse(HOST_API + '/pokemon/'+ pokeid + '/evolution-chain');                
                if(json.error){
                	speech+= 'Hubo un error obteniendo informacion de ese Pokemon. Intenta de nuevo con otro.';
                }else{
                	speech = itemName
                	var data = json.data;
                	var t = data.length;
                	if(t <= 1){
						speech+= ' no tiene evolucion.';
                	}else{
                		var p;
                		for(i in data){
                			var pokemon = data[i];
                			if(pokemon.id == pokeid){
                				p = parseInt(i) + 1;
                				break;
                			}
                		}
                		if(p<t){
                			poke_evolved = data[p];
                			if(poke_evolved){
                				speech+= ' evoluciona en ' + poke_evolved.name;	
                			}else{
                				speech+= ' evolucion no encontrada.';
                			}                			
                		}else{
                			speech+= ' no tiene evolucion.';
                		}
                	}
	                //speech+= ' evolution chain, has ' + data.length + ' steps';
                }                
            } catch (err) { // throw err;
            	speech+= ' Hubo un error obteniendo informacion de la Api de Pokemon. Intenta de nuevo mas tarde o prueba con otro Pokemon.';
            }

        }else{
            if (itemName) {
                speech = "Lo siento, actualmente no tengo informacion para " + itemName + ". Con que otra cosa te puedo ayudar?";                
            } else {
                speech = "Lo siento, actualmente no conozco ese Pokemon. Con que mas te puede ayudar?";                
            }
        }
        
		var card = 
        {
			type: "Standard",
			title: cardTitle,
			text: speech		
		};

		if(poke_evolved){			
			card.image = 
            {
                smallImageUrl: pokemonImageFront(poke_evolved.id),
                largeImageUrl: pokemonImageFront(poke_evolved.id)
            };
		}

        response
        	.card(card)		
		
		response
			.say(speech)
            .shouldEndSession(false)
			.send();
	}
);

exports.handler = app.lambda();

var getApiResponse = function(url_api){	
    var resp = http_request('GET', url_api );
    var json = JSON.parse(resp.getBody('utf8'));
    return json;
}

var pokemonImageFront = function(id){
	return HOST_SPRITES + '/sprites/pokemon/' + id + '.png';
}

var pokemonImageBack = function(id){
	return HOST_SPRITES + '/sprites/pokemon/back/' + id + '.png';
}

var buildTypeSpeech = function(types){
	speech = '';

	var poke_types = [];var x;
    if(types && types.length>0) for(x in types){
        var type_name = types[x].name;                
        poke_types.push(type_name);
    }

	if(poke_types.length==0){
        speech+= ' no tiene tipo.';
    }else 
    if(poke_types.length==1){
        speech+= ' es tipo ' + poke_types.join(' y ') + '.';
    }else{
    	poke_types_last = poke_types.pop();
        speech+= ' es tipo ' + poke_types.join(', ') + ' y ' + poke_types_last + '.';
    }
	return speech;
}

var buildAbilitiesSpeech = function(abilities){
	speech = '';

	var poke_abilities = [];var y;
    if(abilities && abilities.length>0) for(y in abilities){
        var abilitie_name = abilities[y].name;
        poke_abilities.push(abilitie_name);
    }   
	if(poke_abilities.length==0){
        speech+= ' no tiene habilidades.';
    }else 
    if(poke_abilities.length==1){
        speech+= ' tiene solo una habilidad: ' + poke_abilities.join(',') + '.';
    }else{
    	poke_abilities_last = poke_abilities.pop();
        speech+= ' tiene '+ (poke_abilities.length + 1) +' habilidades: ' + poke_abilities.join(', ') + ' y ' + poke_abilities_last +'.';
    }
    return speech;
}