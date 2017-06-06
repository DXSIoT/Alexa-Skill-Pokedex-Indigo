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
        .card("Welcome to the Unofficial Pokedex","You can ask for information about a Pokemon.");
    response
        .say("For instructions on what you can say, please say help me.")
        .shouldEndSession(false)
        .send();
});

app.intent("AMAZON.StopIntent",
	function(request, response){
		
		response
			.say("Goodbye")
			.send();
	});

app.intent("AMAZON.CancelIntent",
	function(request, response){
		
		response
			.say("Goodbye")
			.send();
	});


app.intent("AMAZON.HelpIntent",
	function(request, response){
		
		response
			.say("You can ask for Pokemon information, only says the Pokemon's name... Information for " + Object.keys(pokes).length + " available")
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
        
        var cardTitle = "Information for " + itemName,
            pokeid = parseInt(pokes[itemName]),
            speechOutput,
            repromptOutput;
        var speech;

        if (pokeid) {           
            	speech = itemName + ' is the Pokemon number ' + pokeid +'.';
            try {                
                json = getApiResponse(HOST_API + '/pokemon/'+ pokeid);                
                if(json.error){
                	speech+= ' There was an error getting information of these Pokemon . Try again with another.'
                }else{
                	var data = json.data;	               	               	                
	                speech+= ' And' + buildTypeSpeech(data.types);
	                speech+= ' And' + buildAbilitiesSpeech(data.abilities);	                
                }                
            } catch (err) { //throw err;
            	speech+= ' There was an error getting information from the Pokemon API. Try again later or try another Pokemon.'
            }

        }else{
            if (itemName) {
                speech = "I'm sorry, I currently do not have information for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that Pokemon. What else can I help with?";
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
        
        var cardTitle = "Pokemon Type of " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        var speech = '';

        if (pokeid) {                       	
            try {                
                json = getApiResponse(HOST_API + '/pokemon/'+ pokeid);                
                if(json.error){
                	speech+= 'There was an error getting information of these Pokemon . Try again with another.'
                }else{
                	speech = itemName
                	var data = json.data;	               	               	                
	                speech+= ' ' + buildTypeSpeech(data.types);	                
                }                
            } catch (err) { //throw err;
            	speech+= 'There was an error getting information from the Pokemon API. Try again later or try another Pokemon.'
            }

        }else{
            if (itemName) {
                speech = "I'm sorry, I currently do not have information for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that Pokemon. What else can I help with?";
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
        
        var cardTitle = "Pokemon Number of " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        var speech = '';

        if (pokeid) { 
        	var speech = 'This pokemon is the number ' + pokeid;
        }else{
            if (itemName) {
                speech = "I'm sorry, I currently do not have information for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that Pokemon. What else can I help with?";
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
        
        var cardTitle = "Evolution of " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        var speech = '';

        var poke_evolved = false;
        if (pokeid) {                       	
            try {                
                json = getApiResponse(HOST_API + '/pokemon/'+ pokeid + '/evolution-chain');                
                if(json.error){
                	speech+= 'There was an error getting information of these Pokemon . Try again with another.'
                }else{
                	speech = itemName
                	var data = json.data;
                	var t = data.length;
                	if(t <= 1){
						speech+= ' has no evolution.';
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
                				speech+= ' evolves in ' + poke_evolved.name;	
                			}else{
                				speech+= ' evolution not found.';
                			}                			
                		}else{
                			speech+= ' has no evolution.';
                		}
                	}
	                //speech+= ' evolution chain, has ' + data.length + ' steps';
                }                
            } catch (err) { // throw err;
            	speech+= 'There was an error getting information from the Pokemon API. Try again later or try another Pokemon.'
            }

        }else{
            if (itemName) {
                speech = "I'm sorry, I currently do not have information for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that Pokemon. What else can I help with?";
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
        speech+= ' has no type.';
    }else 
    if(poke_types.length==1){
        speech+= ' is type ' + poke_types.join(' and ') + '.';
    }else{
    	poke_types_last = poke_types.pop();
        speech+= ' is type ' + poke_types.join(', ') + ' and ' + poke_types_last + '.';
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
        speech+= ' has no abilites.';
    }else 
    if(poke_abilities.length==1){
        speech+= ' has only one ability: ' + poke_abilities.join(',') + '.';
    }else{
    	poke_abilities_last = poke_abilities.pop();
        speech+= ' has '+ (poke_abilities.length + 1) +' abilites: ' + poke_abilities.join(', ') + ' and ' + poke_abilities_last +'.';
    }
    return speech;
}