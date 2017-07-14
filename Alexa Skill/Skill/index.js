/*
EliteD Alexa Skill
Author: Austin Wilson (16)
*/

//Import assests
const https = require('https');
var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var commandSpeech = require('./speech');
var savedShipInformation;

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'eliteDangerousAIUsers'; //THIS WORKS!
    alexa.registerHandlers(handlers);
    alexa.execute();
};

String.prototype.capitalize = function() {
    return contextThis.charAt(0).toUpperCase() + contextThis.slice(1);
}

//API url
var apiURL = "https://www.edsm.net/api-v1/system?";

//PubHub server information (This is how i send the information to the Raspberry Pi)
var iotCloudToComputer = require("pubnub")({
  	ssl           : true,  // - enable TLS Tunneling over TCP 
  	publish_key   : "pub-c-18a081e9-f557-4146-b7d3-7847a67dfbaa", //If you want to host contextThis yourself, contextThis is where your publish_key and subscribe_key will go.
  	subscribe_key : "sub-c-367dd992-c6c7-11e6-8164-0619f8945a4f"
});

var iotCloudFromComputer = require("pubnub")({
  	ssl           : true,  // - enable TLS Tunneling over TCP 
  	publish_key   : "pub-c-06cf8ccb-5bf9-4a97-aca2-3a5eb322dd92", //If you want to host contextThis yourself, contextThis is where your publish_key and subscribe_key will go.
  	subscribe_key : "sub-c-2955e8f4-c6c7-11e6-b8a7-0619f8945a4f"
});

var myChannel;
var myChannelShipInfo; //UNCOMMENT if you are hosting contextThis yourself.
var myChannelShipCommands; //UNCOMMENT if you are hosting contextThis yourself.

/*
Use the following to retrieve the game info:

iotCloudFromComputer.history({
	channel : myChannelShipInfo,
	callback : function(m){
		//Handle what to do with Info
	},
	count : 1, // 100 is the default
	reverse : false // false is the default
});
*/

var handlers = {
    'NewSession': function() {
        console.log("NewSession");
        var contextThis = this;
    	if(Object.keys(this.attributes).length === 0) {
            //contextThis.attributes['myChannel'] = "123456789";
            contextThis.attributes['myChannel'] = Math.floor(Math.random()*90000000) + 10000000;
            contextThis.attributes['myChannelShipInfo'] = "" + contextThis.attributes['myChannel'] + "A" //UNCOMMENT if you are hosting contextThis yourself.
            contextThis.attributes['myChannelShipCommands'] = "" + contextThis.attributes['myChannel'] + "B" //UNCOMMENT if you are hosting contextThis yourself.
        } else {
			console.log("connected");
			console.log(contextThis.attributes['repromptSpeech']);
			console.log(contextThis.attributes['speechOutput']);
		}
		myChannel = contextThis.attributes['myChannel'];
		myChannelShipInfo = contextThis.attributes['myChannelShipInfo'];
		myChannelShipCommands = contextThis.attributes['myChannelShipCommands'];
		console.log(myChannel);
		console.log(myChannelShipInfo);
		console.log(myChannelShipCommands);
        handleWelcomeRequest(contextThis); //Sends my skill's welcome information
	},
    "LaunchRequest": function() {
		console.log("Launch");
        var contextThis = this;
    	if(Object.keys(this.attributes).length === 0) {
            //contextThis.attributes['myChannel'] = "123456789";
            contextThis.attributes['myChannel'] = Math.floor(Math.random()*90000000) + 10000000;
            contextThis.attributes['myChannelShipInfo'] = "" + contextThis.attributes['myChannel'] + "A" //UNCOMMENT if you are hosting contextThis yourself.
            contextThis.attributes['myChannelShipCommands'] = "" + contextThis.attributes['myChannel'] + "B" //UNCOMMENT if you are hosting contextThis yourself.
        } else {
			console.log("connected");
			console.log(contextThis.attributes['repromptSpeech']);
			console.log(contextThis.attributes['speechOutput']);
		}
		myChannel = contextThis.attributes['myChannel'];
		myChannelShipInfo = contextThis.attributes['myChannelShipInfo'];
		myChannelShipCommands = contextThis.attributes['myChannelShipCommands'];
		console.log(myChannel);
		console.log(myChannelShipInfo);
		console.log(myChannelShipCommands);
        handleWelcomeRequest(contextThis); //Sends my skill's welcome information
    },
	"UnrecognizedIntent": function () {
        var contextThis = this;
		unrecognizedSpeech(contextThis);
	},
    'Unhandled': function() {
        console.log("UNHANDLED");
        var contextThis = this;
		unrecognizedSpeech(contextThis);
    },
	"WhereAmIIntent": function () {
        var contextThis = this;
		iotCloudFromComputer.history({
			channel : myChannelShipInfo,
			callback : function(m){
			    console.log(m)
			    if(m[0][0]){
			        if(m[0][0].Location){
        				savedShipInformation = m[0];
        				console.log(savedShipInformation);
        				if (savedShipInformation[0].Location.StarSystem){
        					contextThis.attributes['speechOutput']= "You are located in " + savedShipInformation[0].Location.StarSystem + ". ";
        					contextThis.attributes['repromptSpeech'] = "What's next?";
    						contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
        				} else {
        					contextThis.attributes['speechOutput']= "I can't find your location. ";
        					contextThis.attributes['repromptSpeech'] = "What's next?";
    						contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
        				}
    				} else {
    					contextThis.attributes['speechOutput']= "I can't find your location. ";
    				    contextThis.attributes['repromptSpeech'] = "What's next?";
    				    contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    				}
			    } else {
					contextThis.attributes['speechOutput']= "I can't find your location. ";
				    contextThis.attributes['repromptSpeech'] = "What's next?";
				    contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				}
				
			},
			count : 1, // 100 is the default
			reverse : false, // false is the default
			error : function() {
				console.log("error");
				contextThis.attributes['speechOutput']= "I can't find your location. ";
				contextThis.attributes['repromptSpeech'] = "What's next?";
				contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
			}
		});
	},
	"GetRecentMessageIntent": function () {
        var contextThis = this;
	    console.log(myChannelShipInfo);
		iotCloudFromComputer.history({
			channel : myChannelShipInfo,
			callback : function(m){
			    savedShipInformation = m[0];
			    console.log(m[0]);
			    if(savedShipInformation[0]){
			        if(savedShipInformation[0].RecieveText.Message){
        				if (savedShipInformation[0].RecieveText){
        					contextThis.attributes['speechOutput']= "Here is your latest message from "+savedShipInformation[0].RecieveText.From+": " + savedShipInformation[0].RecieveText.Message.replace(/u0027/g,"'") + " ";
        					contextThis.attributes['repromptSpeech'] = "What's next?";
							contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
        				} else {
        					contextThis.attributes['speechOutput']= "I can't find your most recent message. ";
        					contextThis.attributes['repromptSpeech'] = "What's next?";
							contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
        				}
    				} else {
    					contextThis.attributes['speechOutput']= "I can't find your most recent message. ";
				        contextThis.attributes['repromptSpeech'] = "What's next?";
				        contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    				}
			    } else {
					contextThis.attributes['speechOutput']= "I can't find your most recent message. ";
				    contextThis.attributes['repromptSpeech'] = "What's next?";
				    contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				}
				
			},
			count : 1, // 100 is the default
			reverse : false, // false is the default
			error : function() {
				console.log("error");
				contextThis.attributes['speechOutput']= "I can't find your most recent message. ";
				contextThis.attributes['repromptSpeech'] = "What's next?";
				contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
			}
		});
		
	},
	"RankIntent": function ( ) {
        var contextThis = this;
		iotCloudFromComputer.history({
			channel : myChannelShipInfo,
			callback : function(m){
				savedShipInformation = m[0];
				var rankSlot = intent.slots.rank,
					rankValue;

				console.log(rankSlot);
				console.log(rankSlot.value);

				if (rankSlot && rankSlot.value) {
					rankValue = rankSlot.value.toLowerCase().capitalize();
					console.log(rankValue);
					if (savedShipInformation[0]) {
    					if (savedShipInformation[0].Rank.Combat >= 0){
    						if(rankValue == "Combat" || rankValue == "Trade" || rankValue == "Explore" || rankValue == "Cqc" ) {
    							contextThis.attributes['speechOutput']= "You are rank " + savedShipInformation[0].Rank[rankValue.capitalize()] + " in " + rankValue.toLowerCase() + ". ";
    							contextThis.attributes['repromptSpeech'] = "What's next?";
							    contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    						} else if(rankValue == "Empire" || rankValue == "Federation" ) {
    							contextThis.attributes['speechOutput']= "You are rank " + savedShipInformation[0].Rank[rankValue.capitalize()] + " in the " + rankValue.toLowerCase() + ". ";
    							contextThis.attributes['repromptSpeech'] = "What's next?";
							    contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    						} else {
    							contextThis.attributes['speechOutput']= "I can't find your current rank for that area. ";
    							contextThis.attributes['repromptSpeech'] = "What's next?";
							    contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    						}
    					} else {
    						contextThis.attributes['speechOutput']= "I can't find your current rank for that area. ";
				            contextThis.attributes['repromptSpeech'] = "What's next?";
				            contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    					}
					} else {
    					contextThis.attributes['speechOutput']= "I can't find your current rank for that area. ";
				        contextThis.attributes['repromptSpeech'] = "What's next?";
				        contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
    				}
				} else {
					console.log("6");
					contextThis.attributes['speechOutput']= "I can't find your current rank for that area. ";
					contextThis.attributes['repromptSpeech'] = "What's next?";
					contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				}
			},
			count : 1, // 100 is the default
			reverse : false, // false is the default
			error : function() {
				console.log("error");
				contextThis.attributes['speechOutput']= "I can't find your current rank for that area. ";
				contextThis.attributes['repromptSpeech'] = "What's next?";
				contextThis.emit(':ask',contextThis.attributes['speechOutput']+contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
			}
		});
		
	},
	"SystemInformationIntent": function () {
	    var contextThis = this;
		var systemSlot = intent.slots.system,
			systemValue,
			sysAllegiance,
			sysGovernment,
			sysFaction,
			sysPopulation,
			sysEconomy,
			sysSecurity,
			sysAllegianceSpeech,
			sysGovernmentSpeech,
			sysFactionSpeech,
			sysPopulationSpeech,
			sysEconomySpeech,
			sysSecuritySpeech,
			sysNameSpeech,
			sysInfo,
			sysName,
			sysPermit;

		if (systemSlot && systemSlot.value) {
			systemValue = systemSlot.value.toLowerCase();
			if(systemValue == "contextThis")
			{
			    iotCloudFromComputer.history({
        			channel : myChannelShipInfo,
        			callback : function(m){
        			    console.log(m)
        			    if(m[0][0]) {
        			        if(m[0][0].Location){
                				savedShipInformation = m[0];
                				console.log(savedShipInformation);
                				if (savedShipInformation[0].Location.StarSystem){
                					systemValue = savedShipInformation[0].Location.StarSystem;
                					console.log(systemValue)
                					systemValue.replace(' ','+');
                        			console.log(systemValue)
                        			
                        			console.log('https://www.edsm.net/api-v1/system?sysname='+systemValue+'&showPermit=1&showInformation=1')
                        
                        			https.get('https://www.edsm.net/api-v1/system?sysname='+systemValue+'&showPermit=1&showInformation=1', (res) => {
                          				console.log('statusCode:', res.statusCode);
                          				console.log('headers:', res.headers);
                        
                          				res.on('data', function (chunk) {
                        					console.log('BODY: ' + chunk); //Handle API return.
                        					sysInfo = JSON.parse(chunk);
                        					console.log(sysInfo);
                        					
                        					if(sysInfo.name){
                        						sysName = sysInfo.name;
                        						
                        						sysPermit = sysInfo.requirePermit;
                        						if(sysInfo.information.allegiance || sysInfo.information.government || sysInfo.information.faction || sysInfo.information.population || sysInfo.information.state || sysInfo.information.security){
                        							contextThis.attributes['speechOutput']= "Here is what I have on "+ sysName +". ";
                        							if(sysInfo.information.allegiance){
                        								sysAllegiance = sysInfo.information.allegiance.toLowerCase();
                        								sysAllegianceSpeech = sysName + " has an allegiance to the " + sysAllegiance + ". ";
                        								contextThis.attributes['speechOutput']+= sysAllegianceSpeech;
                        							}
                        							if(sysInfo.information.government){
                        								sysGovernment = sysInfo.information.government.toLowerCase();
                        								sysGovernmentSpeech = "It's government is a " +sysGovernment+ ". ";
                        								contextThis.attributes['speechOutput']+= sysGovernmentSpeech;
                        							}
                        							if(sysInfo.information.faction){
                        								sysFaction = sysInfo.information.faction.toLowerCase();
                        								sysFactionSpeech = "It's faction is " +sysFaction+ ". ";
                        								contextThis.attributes['speechOutput']+= sysFactionSpeech;
                        							}
                        							if(sysInfo.information.population){
                        								sysPopulation = sysInfo.information.population;
                        								sysPopulationSpeech = "It has a population of " +sysPopulation+ ". ";
                        								contextThis.attributes['speechOutput']+= sysPopulationSpeech;
                        							}
                        							if(sysInfo.information.state){
                        								sysEconomy = sysInfo.information.state.toLowerCase();
                        								sysEconomySpeech = "It's economy is currently in a " + sysEconomy + " state. ";
                        								contextThis.attributes['speechOutput']+= sysEconomySpeech;
                        							}
                        							if(sysInfo.information.security){
                        								sysSecurity = sysInfo.information.security.toLowerCase();
                        								sysSecuritySpeech = "It has " +sysSecurity+ " security. ";
                        								contextThis.attributes['speechOutput']+= sysSecuritySpeech;
                        							}
                        							if (sysPermit) {
                        								contextThis.attributes['speechOutput']+= "This star system also requires a permit. ";
                        							} else {
                        								contextThis.attributes['speechOutput']+= "This star system also does not require a permit. ";
                        							}
                        							contextThis.attributes['repromptSpeech'] = "What's next?";
                        							contextThis.attributes['speechOutput']+= contextThis.attributes['repromptSpeech'];
                        							
                        							contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
                        						} else {
                        							contextThis.attributes['repromptSpeech'] = " What's next?";
                        							contextThis.attributes['speechOutput']= "I don't have any information on " + sysName + "." + contextThis.attributes['repromptSpeech'];
                        												
                        							contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
                        						}
                        					} else {
                        						contextThis.attributes['repromptSpeech'] = " What's next?";
                        						contextThis.attributes['speechOutput']= "I'm sorry, I could not get data for that system." + contextThis.attributes['repromptSpeech'];
                        						
                        						contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
                        					}
                        				});
                        			}).on('error', (e) => {
                        				console.error(e);
                        				contextThis.attributes['repromptSpeech'] = " What's next?";
                        				contextThis.attributes['speechOutput']= "I'm sorry, I could not get data for that system." + contextThis.attributes['repromptSpeech'];
                        									
                        				contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
                        			});
                				}
            				}
        			    } else {
        			        contextThis.attributes['repromptSpeech'] = " What's next?";
            				contextThis.attributes['speechOutput']= "I'm sorry, I could not get data for that system." + contextThis.attributes['repromptSpeech'];
            									
            				contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
        			    }
        			},
        			count : 1, // 100 is the default
        			reverse : false, // false is the default
        		});
			    
			} else {
    			systemValue.replace(' ','+');
    			console.log(systemValue)
    			
    			console.log('https://www.edsm.net/api-v1/system?sysname='+systemValue+'&showPermit=1&showInformation=1')
    
    			https.get('https://www.edsm.net/api-v1/system?sysname='+systemValue+'&showPermit=1&showInformation=1', (res) => {
      				console.log('statusCode:', res.statusCode);
      				console.log('headers:', res.headers);
    
      				res.on('data', function (chunk) {
    					console.log('BODY: ' + chunk); //Handle API return.
    					sysInfo = JSON.parse(chunk);
    					console.log(sysInfo);
    					
    					if(sysInfo.name){
    						sysName = sysInfo.name;
    						
    						sysPermit = sysInfo.requirePermit;
    						if(sysInfo.information.allegiance || sysInfo.information.government || sysInfo.information.faction || sysInfo.information.population || sysInfo.information.state || sysInfo.information.security){
    							contextThis.attributes['speechOutput']= "Here is what I have on "+ sysName +". ";
    							if(sysInfo.information.allegiance){
    								sysAllegiance = sysInfo.information.allegiance.toLowerCase();
    								sysAllegianceSpeech = sysName + "'s allegiance is to the " + sysAllegiance + ". ";
    								contextThis.attributes['speechOutput']+= sysAllegianceSpeech;
    							}
    							if(sysInfo.information.government){
    								sysGovernment = sysInfo.information.government.toLowerCase();
    								sysGovernmentSpeech = "It's government is a " +sysGovernment+ ". ";
    								contextThis.attributes['speechOutput']+= sysGovernmentSpeech;
    							}
    							if(sysInfo.information.faction){
    								sysFaction = sysInfo.information.faction.toLowerCase();
    								sysFactionSpeech = "It's faction is " +sysFaction+ ". ";
    								contextThis.attributes['speechOutput']+= sysFactionSpeech;
    							}
    							if(sysInfo.information.population){
    								sysPopulation = sysInfo.information.population;
    								sysPopulationSpeech = "It has a population of " +sysPopulation+ ". ";
    								contextThis.attributes['speechOutput']+= sysPopulationSpeech;
    							}
    							if(sysInfo.information.state){
    								sysEconomy = sysInfo.information.state.toLowerCase();
    								sysEconomySpeech = "It's economy is currently in a " + sysEconomy + " state. ";
    								contextThis.attributes['speechOutput']+= sysEconomySpeech;
    							}
    							if(sysInfo.information.security){
    								sysSecurity = sysInfo.information.security.toLowerCase();
    								sysSecuritySpeech = "It has " +sysSecurity+ " security. ";
    								contextThis.attributes['speechOutput']+= sysSecuritySpeech;
    							}
    							if (sysPermit) {
    								contextThis.attributes['speechOutput']+= "This star system also requires a permit. ";
    							} else {
    								contextThis.attributes['speechOutput']+= "This star system also does not require a permit. ";
    							}
    							contextThis.attributes['repromptSpeech'] = "What's next?";
    							contextThis.attributes['speechOutput']+= contextThis.attributes['repromptSpeech'];
    							
    							contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
    						} else {
    							contextThis.attributes['repromptSpeech'] = " What's next?";
    							contextThis.attributes['speechOutput']= "I don't have any information on " + sysName + "." + contextThis.attributes['repromptSpeech'];
    												
    							contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
    						}
    					} else {
    						contextThis.attributes['repromptSpeech'] = " What's next?";
    						contextThis.attributes['speechOutput']= "I'm sorry, I could not get data for that system." + contextThis.attributes['repromptSpeech'];
    						
    						contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
    					}
    				});
    			}).on('error', (e) => {
    				console.error(e);
    				contextThis.attributes['repromptSpeech'] = " What's next?";
    				contextThis.attributes['speechOutput']= "I'm sorry, I could not get data for that system." + contextThis.attributes['repromptSpeech'];
    									
    				contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
    			});
			}
		} else {
		    contextThis.attributes['repromptSpeech'] = " What's next?";
			contextThis.attributes['speechOutput']= "I'm sorry, I could not get data for that system." + contextThis.attributes['repromptSpeech'];
								
			contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
		}
	},
	"BoostIntent": function () {
        var contextThis = this;
		var message = {"command":"boost"};
		contextThis.attributes['speechOutput'] = commandSpeech.boost[Math.floor(Math.random() * commandSpeech.boost.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"YouThereIntent": function () {
        var contextThis = this;
		var message = {"command":"youThere"};
		contextThis.attributes['speechOutput'] = commandSpeech.youThere[Math.floor(Math.random() * commandSpeech.youThere.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
	},
	"BalencePowerIntent": function () {
        var contextThis = this;
		var message = {"command":"balencePower"};
		contextThis.attributes['speechOutput'] = commandSpeech.balencePower[Math.floor(Math.random() * commandSpeech.balencePower.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"CancelDockingIntent": function () {
        var contextThis = this;
		var message = {"command":"cancelDocking"};
		contextThis.attributes['speechOutput'] = commandSpeech.cancelDocking[Math.floor(Math.random() * commandSpeech.cancelDocking.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"DeployChaffIntent": function () {
        var contextThis = this;
		var message = {"command":"deployChaff"};
		contextThis.attributes['speechOutput'] = commandSpeech.deployChaff[Math.floor(Math.random() * commandSpeech.deployChaff.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"DeployHardpointsIntent": function () {
        var contextThis = this;
		var message = {"command":"deployHardpoints"};
		contextThis.attributes['speechOutput'] = commandSpeech.deployHardpoints[Math.floor(Math.random() * commandSpeech.deployHardpoints.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"DeployLandingGearIntent": function () {
        var contextThis = this;
		var message = {"command":"deployLandingGear"};
		contextThis.attributes['speechOutput'] = commandSpeech.deployLandingGear[Math.floor(Math.random() * commandSpeech.deployLandingGear.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput'] + " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
			},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e );
            }
		});
	},
	"DeployCargoScoopIntent": function () {
        var contextThis = this;
		var message = {"command":"deployCargoScoop"};
		contextThis.attributes['speechOutput'] = commandSpeech.deployCargoScoop[Math.floor(Math.random() * commandSpeech.deployCargoScoop.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"DeploySRVIntent": function () { //Add planetary landing check.
        var contextThis = this;
		var message = {"command":"deploySRV"};
		contextThis.attributes['speechOutput'] = commandSpeech.deploySRV[Math.floor(Math.random() * commandSpeech.deploySRV.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to the game!", "What's next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"ExitFrameShiftDrive": function () {
        var contextThis = this;
		var message = {"command":"exitFramshift"};
		contextThis.attributes['speechOutput'] = commandSpeech.exitFrameShift[Math.floor(Math.random() * commandSpeech.exitFrameShift.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"ExitCruiseIntent": function () {
        var contextThis = this;
		var message = {"command":"exitCruise"};
		contextThis.attributes['speechOutput'] = commandSpeech.exitCruise[Math.floor(Math.random() * commandSpeech.exitCruise.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"PowerToEnginesIntent": function () {
        var contextThis = this;
		var message = {"command":"powerToEngines"};
		contextThis.attributes['speechOutput'] = commandSpeech.powerToEngines[Math.floor(Math.random() * commandSpeech.powerToEngines.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"PowertoSystemsIntent": function () {
        var contextThis = this;
		var message = {"command":"powerToSystems"};
		contextThis.attributes['speechOutput'] = commandSpeech.powerToSystems[Math.floor(Math.random() * commandSpeech.powerToSystems.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"PowerToWeaponsIntent": function () {
        var contextThis = this;
		var message = {"command":"powerToWeapons"};
		contextThis.attributes['speechOutput'] = commandSpeech.powerToWeapons[Math.floor(Math.random() * commandSpeech.powerToWeapons.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EmergencyStopIntent": function () {
        var contextThis = this;
		var message = {"command":"emergencyStop"};
		contextThis.attributes['speechOutput'] = commandSpeech.emergencyStop[Math.floor(Math.random() * commandSpeech.emergencyStop.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EngageFrameShiftDrive": function () {
        var contextThis = this;
		var message = {"command":"engageFrameshift"};
		contextThis.attributes['speechOutput'] = commandSpeech.engageFrameShift[Math.floor(Math.random() * commandSpeech.engageFrameShift.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EngageCruiseIntent": function () {
        var contextThis = this;
		var message = {"command":"engageCruise"};
		contextThis.attributes['speechOutput'] = commandSpeech.engageCruise[Math.floor(Math.random() * commandSpeech.engageCruise.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"FlightAssistOffIntent": function () {
        var contextThis = this;
		var message = {"command":"fightAssistOff"};
		contextThis.attributes['speechOutput'] = commandSpeech.flightAssistOff[Math.floor(Math.random() * commandSpeech.flightAssistOff.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"FlightAssistOnIntent": function () {
        var contextThis = this;
		var message = {"command":"fightAssistOn"};
		contextThis.attributes['speechOutput'] = commandSpeech.flightAssistOn[Math.floor(Math.random() * commandSpeech.flightAssistOn.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"TargetEnemyIntent": function () {
        var contextThis = this;
		var message = {"command":"targetEnemy"};
		contextThis.attributes['speechOutput'] = commandSpeech.targetEnemy[Math.floor(Math.random() * commandSpeech.targetEnemy.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"ScreenshotIntent": function () {
        var contextThis = this;
		var message = {"command":"screenshot"};
		contextThis.attributes['speechOutput'] = commandSpeech.Screenshot[Math.floor(Math.random() * commandSpeech.Screenshot.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"LaunchIntent": function () {
        var contextThis = this;
		var message = {"command":"launch"};
		contextThis.attributes['speechOutput'] = commandSpeech.launch[Math.floor(Math.random() * commandSpeech.launch.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"LightsOffIntent": function () {
        var contextThis = this;
		var message = {"command":"lightsOff"};
		contextThis.attributes['speechOutput'] = commandSpeech.lightsOff[Math.floor(Math.random() * commandSpeech.lightsOff.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"LightsOnIntent": function () {
        var contextThis = this;
		var message = {"command":"lightsOn"};
		contextThis.attributes['speechOutput'] = commandSpeech.lightsOn[Math.floor(Math.random() * commandSpeech.lightsOn.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardOneHundredPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward100"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardOneHundredPercent[Math.floor(Math.random() * commandSpeech.enginesForwardOneHundredPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardNintyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward90"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardNintyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardNintyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardEightyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward80"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardEightyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardEightyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardSeventyFivePercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward75"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardSeventyFivePercent[Math.floor(Math.random() * commandSpeech.enginesForwardSeventyFivePercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardSeventyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward70"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardSeventyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardSeventyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardSixtyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward60"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardSixtyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardSixtyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardFiftyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward50"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardFiftyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardFiftyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardFortyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward40"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardFortyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardFortyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardThirtyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward30"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardThirtyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardThirtyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardTwentyFivePercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward25"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardTwentyFivePercent[Math.floor(Math.random() * commandSpeech.enginesForwardTwentyFivePercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardTwentyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward20"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardTwentyPercent[Math.floor(Math.random() * commandSpeech.enginesForwardTwentyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesForwardTenPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesForward10"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesForwardTenPercent[Math.floor(Math.random() * commandSpeech.enginesForwardTenPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"NextFireGroupIntent": function () {
        var contextThis = this;
		var message = {"command":"nextFireGroup"};
		contextThis.attributes['speechOutput'] = commandSpeech.nextFireGroup[Math.floor(Math.random() * commandSpeech.nextFireGroup.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"NextHostileIntent": function () {
        var contextThis = this;
		var message = {"command":"nextHostile"};
		contextThis.attributes['speechOutput'] = commandSpeech.nextHostile[Math.floor(Math.random() * commandSpeech.nextHostile.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"NextSystemIntent": function () {
        var contextThis = this;
		var message = {"command":"nextSystem"};
		contextThis.attributes['speechOutput'] = commandSpeech.nextSystem[Math.floor(Math.random() * commandSpeech.nextSystem.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"NextShipIntent": function () {
        var contextThis = this;
		var message = {"command":"nextShip"};
		contextThis.attributes['speechOutput'] = commandSpeech.nextShip[Math.floor(Math.random() * commandSpeech.nextShip.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"PrevoiusFireGroupIntent": function () {
        var contextThis = this;
		var message = {"command":"prevFireGroup"};
		contextThis.attributes['speechOutput'] = commandSpeech.prevFireGroup[Math.floor(Math.random() * commandSpeech.prevFireGroup.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"PreviousHostileIntent": function () {
        var contextThis = this;
		var message = {"command":"prevHostile"};
		contextThis.attributes['speechOutput'] = commandSpeech.prevHostile[Math.floor(Math.random() * commandSpeech.prevHostile.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"PreviousShipIntent": function () {
        var contextThis = this;
		var message = {"command":"prevShip"};
		contextThis.attributes['speechOutput'] = commandSpeech.prevShip[Math.floor(Math.random() * commandSpeech.prevShip.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"DockingRequestIntent": function () {
        var contextThis = this;
		var message = {"command":"requestDocking"};
		contextThis.attributes['speechOutput'] = commandSpeech.dockingRequest[Math.floor(Math.random() * commandSpeech.dockingRequest.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"DiognosticsIntent": function () { //Add Check here
		var contextThis = this;
		contextThis.attributes['speechOutput'] = commandSpeech.diognostics[Math.floor(Math.random() * commandSpeech.diognostics.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];
		contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
	},
	"CenterHeadsetIntent": function () {
        var contextThis = this;
		var message = {"command":"centerHeadset"};
		contextThis.attributes['speechOutput'] = commandSpeech.centerHeadset[Math.floor(Math.random() * commandSpeech.centerHeadset.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"RetractHardpointsIntent": function () {
        var contextThis = this;
		var message = {"command":"retractHardpoints"};
		contextThis.attributes['speechOutput'] = commandSpeech.retractHardpoints[Math.floor(Math.random() * commandSpeech.retractHardpoints.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"RetractLandingGearIntent": function () {
        var contextThis = this;
		var message = {"command":"retractLandingGear"};
		contextThis.attributes['speechOutput'] = commandSpeech.retractLandingGear[Math.floor(Math.random() * commandSpeech.retractLandingGear.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"RetractCargoScoopIntent": function () {
        var contextThis = this;
		var message = {"command":"retractCargoScoop"};
		contextThis.attributes['speechOutput'] = commandSpeech.retractCargoScoop[Math.floor(Math.random() * commandSpeech.retractCargoScoop.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesBackwardOneHundredPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesBack100"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesBackwardOneHundredPercent[Math.floor(Math.random() * commandSpeech.enginesBackwardOneHundredPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesBackwardSeventyFivePercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesBack75"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesBackwardSeventyFivePercent[Math.floor(Math.random() * commandSpeech.enginesBackwardSeventyFivePercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesBackwardFiftyPercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesBack50"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesBackwardFiftyPercent[Math.floor(Math.random() * commandSpeech.enginesBackwardFiftyPercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"EnginesBackwardTwentyFivePercentIntent": function () {
        var contextThis = this;
		var message = {"command":"enginesBack25"};
		contextThis.attributes['speechOutput'] = commandSpeech.enginesBackwardTwentyFivePercent[Math.floor(Math.random() * commandSpeech.enginesBackwardTwentyFivePercent.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"SRVRecoveryIntent": function () {
        var contextThis = this;
		var message = {"command":"SRVRecovery"};
		contextThis.attributes['speechOutput'] = commandSpeech.SRVRecovery[Math.floor(Math.random() * commandSpeech.SRVRecovery.length)];
		
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"StopEnginesIntent": function () {
        var contextThis = this;
		var message = {"command":"cutEngines"};
		contextThis.attributes['speechOutput'] = commandSpeech.stopEngines[Math.floor(Math.random() * commandSpeech.stopEngines.length)];
		contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];

		iotCloudToComputer.publish({ //Publishes the message to my PubHub Device.
			channel   : myChannelShipCommands,
			message   : message,
			callback  : function(e) { 
				console.log( "SUCCESS!", e ); 
				contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
				},
			error     : function(e) { 
				contextThis.emit(':ask', "Failed to connect to your ship!", "What's Next?");
				console.log( "FAILED! RETRY PUBLISH!", e ); }
		});
	},
	"GetSessionIDIntent": function (){
        var contextThis = this;
		handleGetSessionIDRequest(contextThis); //Get session id spoken
	},
	"ThatsAllIntent": function (){
        var contextThis = this;
		contextThis.attributes['speechOutput'] = commandSpeech.thatsAll[Math.floor(Math.random() * commandSpeech.thatsAll.length)];
		contextThis.emit(':tell',contextThis.attributes['speechOutput']);
	},
	"ThankYouIntent": function (){
        var contextThis = this;
		contextThis.attributes['speechOutput'] = commandSpeech.thankYou[Math.floor(Math.random() * commandSpeech.thankYou.length)];
		contextThis.emit(':tell',contextThis.attributes['speechOutput']);
	},
    "AMAZON.HelpIntent": function () {
        var contextThis = this;
        handleHelpRequest(contextThis); //Run Help
    },
	"AMAZON.StopIntent": function () { //End Program from StopIntent
        var contextThis = this;
        contextThis.attributes['speechOutput'] = "Goodbye";
		contextThis.emit(':tell',contextThis.attributes['speechOutput']);
    },
    "AMAZON.CancelIntent": function () { //End Program from CancelIntent
        var contextThis = this;
        contextThis.attributes['speechOutput'] = "Goodbye";
		contextThis.emit(':tell',contextThis.attributes['speechOutput']);
    },
	'SessionEndedRequest': function () {
        this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
    },
};

function handleWelcomeRequest(contextThis) {
	contextThis.attributes['repromptSpeech'] = "For more instructions, please say help me.";
    contextThis.attributes['speechOutput'] = "Welcome to your onboard ship assistant. "
		+ "Before we begin, please either refer to your alexa app for your session ID, or ask me for it. "
		+ "You will need it to start the application on your computer. "
		+ contextThis.attributes['repromptSpeech'] + " What would you like me to do?";
	cardTitle = "Welcome to your onboard ship AI.!";
	cardContent = "Session ID = " + myChannel;
    contextThis.emit(':askWithCard',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech'], cardTitle, cardContent);
}

function handleHelpRequest(contextThis) { //Help Function
    contextThis.attributes['repromptSpeech'] = "What would you like me to do?";
    contextThis.attributes['speechOutput'] = "I can help control your ship in elite dangerous. "
        + "Try giving me a command like, raise landing gear. "
		+ "You can also ask me about star system information. "
		+ "Try, what do you have on Sol. "
        + contextThis.attributes['repromptSpeech'];
	var cardContent =contextThis.attributes['speechOutput'];
    contextThis.emit(':askWithCard',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech'], "Instuctions for controlling your A.I.", cardContent);
}

function handleNoSlotRequest(contextThis) { //Runs when invalid motion or color is given
	contextThis.attributes['speechOutput'] = {
		speech: "I'm sorry, I do not understand your request. Please try again.",
		type: skillSetup.speechOutputType.PLAIN_TEXT
	};
	contextThis.attributes['repromptSpeech'] = {
		speech: "What else can I help with?",
		type: skillSetup.speechOutputType.PLAIN_TEXT
	};
	contextThis.emit(':ask',contextThis.attributes['speechOutput'], contextThis.attributes['repromptSpeech']);
	
}

function handleGetSessionIDRequest(contextThis) {
    console.log(1);
    contextThis.attributes['speechOutput'] = 'Here is your session ID: <say-as interpret-as="spell-out">'+myChannel+'</say-as>. '
	contextThis.attributes['repromptSpeech'] = "When you are connected, you can ask me commands to control your ship";
	console.log(3);
	contextThis.emit(':ask',contextThis.attributes['speechOutput'] + contextThis.attributes['repromptSpeech'],contextThis.attributes['repromptSpeech']);
    console.log(4);
    
}

function unrecognizedSpeech(contextThis) {
	contextThis.attributes['speechOutput'] = commandSpeech.unknownIntent[Math.floor(Math.random() * commandSpeech.unknownIntent.length)];
	contextThis.attributes['repromptSpeech'] = commandSpeech.whatsNext[Math.floor(Math.random() * commandSpeech.whatsNext.length)];
	contextThis.emit(':ask', contextThis.attributes['speechOutput']+ " " + contextThis.attributes['repromptSpeech'], contextThis.attributes['repromptSpeech']);
}
