/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Pokedes Indigo information for Pikachu."
 *  Alexa: "..."
 */

'use strict';

var AlexaSkill = require('./AlexaSkill'),
    pokes = require('./pokes');

var request = require('sync-request');

var APP_ID = 'amzn1.ask.skill.d114e13c-ec9c-4373-abb2-d19ed8da521d'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * Pokedex is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Pokedex = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Pokedex.prototype = Object.create(AlexaSkill.prototype);
Pokedex.prototype.constructor = Pokedex;

Pokedex.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to the Unofficial Pokedex. You can ask for information about a Pokemon.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

Pokedex.prototype.intentHandlers = {
    "AskInformationIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Poke,
            itemName;        
        if (itemSlot && itemSlot.value){
            itemName = itemSlot.value.toLowerCase();            
        }
        
        var cardTitle = "Information for " + itemName,
            pokeid = pokes[itemName],
            speechOutput,
            repromptOutput;
        if (pokeid) {
            //var speech = 'This pokemon is the number ' + pokeid;

            var speech = itemName + ' is the Pokemon number ' + pokeid +'.';

            try {
                ////
                var url_api = 'http://pokeapi.co/api/v2/pokemon/'+ pokeid +'/';
                var res = request('GET', url_api );
                var data = JSON.parse(res.getBody('utf8'));
                
                var types = data.types;
                var abilities = data.abilities;

                var poke_types = [];var x;
                if(types && types.length>0) for(x in types){
                    var type_name = types[x].type.name;                
                    poke_types.push(type_name);
                }
                var poke_abilities = [];var y;
                if(abilities && abilities.length>0) for(y in abilities){
                    var abilitie_name = abilities[y].ability.name;
                    poke_abilities.push(abilitie_name);
                }
                ////            

                speech+= ' And';
                if(poke_types.length==0){
                    speech+= ' has no type.';
                }else 
                if(poke_types.length==1){
                    speech+= ' is type ' + poke_types.join(' and ') + '.';
                }else{
                    speech+= ' is type ' + poke_types.join(' and ') + '.';
                }

                speech+= ' And';
                if(poke_abilities.length==0){
                    speech+= ' has no abilites.';
                }else 
                if(poke_abilities.length==1){
                    speech+= ' has only one ability: ' + poke_abilities.join(',') + '.';
                }else{
                    speech+= ' has '+ poke_abilities.length +' abilites: ' + poke_abilities.join(',') + '.';
                }

            } catch (err) {
              speech+= ' There was an error getting information from the Pokemon API. Try again later or try another Pokemon.'
            }

            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tellWithCard(speechOutput, cardTitle, speech);
        } else {
            var speech;
            if (itemName) {
                speech = "I'm sorry, I currently do not have information for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that Pokemon. What else can I help with?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
        
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask for Pokemon information, only says the Pokemon's name... Information for " + Object.keys(pokes).length + " available";
        var repromptText = "You can ask for Pokemon information, only says the Pokemon's name... Information for " + Object.keys(pokes).length + " available";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var pokedexHelper = new Pokedex();
    pokedexHelper.execute(event, context);
};
