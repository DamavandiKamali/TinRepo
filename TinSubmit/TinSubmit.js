/*
=============COPYRIGHT============ 
Tin Submit
Copyright (C) 2012  Andrew Downes

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
<http://www.gnu.org/licenses/>.
*/


/*============DOCUMENT READY==============*/
$(function(){
	
	
	//Set Up LRS
	//Add one blank LRS to the page by default
	appendLRS();
	//When the user clicks '+LRS', append an extra LRS
	$('#lrsLrsAdd').click(appendLRS);
	$('#lrsLrsRemove').click({elementId: 'lrs', propertyClass: 'lrs', minimum:1},removeProperty);
	getLRSFromQueryString();
	
	
	//Set up Actor
	appendGroup('actorAgent').addClass('displayNone');
	appendAgent('actorAgent');
	$('#actorObjectType').change({elementId: 'actor'},ObjectTypeChanged);
	$('#actorAgentAdd').click({elementId: 'actorAgent'},appendAgentOnEvent);
	$('#actorAgentRemove').click({elementId: 'actorAgent', propertyClass: 'agent', minimum:1},removeProperty);
	
	var languageMap = ["en-GB","en-US"];
	
	//set up Object
	$('#objectType').change({elementId: 'object'},ObjectTypeChanged);
	//activity
	appendLanguageMap('activity','name',2, languageMap);
	$('#activityNameAdd').click({elementId: 'activity', propertyClass: 'name', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#activityNameRemove').click({elementId: 'activity', propertyClass: 'name', minimum:0},removeProperty);
	appendLanguageMap('activity','description',2, languageMap);
	$('#activityDescriptionAdd').click({elementId: 'activity', propertyClass: 'description', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#activityDescriptionRemove').click({elementId: 'activity', propertyClass: 'description', minimum:0},removeProperty);


	//send statement
	$('#sendStatement').click(statementGeneratorSendStatement);
	
	//Set debug defaults
	var setDebugDefaults = true;
	
	if (setDebugDefaults){
		$('#endpoint0').val('https://mrandrewdownes.waxlrs.com/TCAPI/');
		$('#basicLogin0').val('gddikCN6KrbdWZaXq36T');
		$('#basicPass0').val('b7Q21MPlattwRn964bVW');
		$('#actorAgentName1').val('Andrew Downes');
		$('#actorAgentFunctionalIdentifier1').val('mrdownes@hotmail.com');
		$('#verbId').val('http://tincanapi.co.uk/tinrepo/verbs/make_moderator');
		$('#verbDisplayValue0').val('make moderator');
		$('#verbDisplayValue1').val('make moderator');
	}
	
});
/*============END DOCUMENT READY==============*/


/*============SEND STATEMENT==============*/
function statementGeneratorSendStatement()
{

	//Create an instance of the Tin Can Library
	var myTinCan = new TinCan();
	
	myTinCan.DEBUG = 1;
	
	//TODO: get this data from a properties file in root (or XML or properties.js or something)
	//LRS

	var myLRS = new TinCan.LRS({
		endpoint: 'https://mrandrewdownes.waxlrs.com/TCAPI/', 
		version: '0.95',
		auth: 'Basic ' + Base64.encode('uomcAcOeWBxCF6NvWUDh' + ':' + 'Weyr9VvZoGKic40lzNTv')
	});
	myTinCan.recordStores[0]= myLRS;
	
	
	//actor - TODO: factor this better (do this in TinStatement and copy code across)
	switch($('#actorObjectType').val())
	{
		case 'Agent':
			var myActor;
			if ($('#actor').find('.agent:first').find('.functionalIdentifierType') == 'account')
			{
				myActor= new TinCan.Agent({
				name : $('#actor').find('.agent:first').find('.name').val(),
				account: {
					name:$('#actor').find('.agent:first').find('.accountHomePage').val(),
					homePage:$('#actor').find('.agent:first').find('.accountName').val()
					}
				});
			}
			else
			{
				myActor= new TinCan.Agent({
				name : $('#actor').find('.agent:first').find('.name').val()
				});
				myActor[$('#actor').find('.agent:first').find('.functionalIdentifierType').val()] = $('#actor').find('.agent:first').find('.functionalIdentifier').val();
				myActor.objectType = "Agent";
			}
						
			myTinCan.actor = myActor;
		break;
		case 'Group':
			var myActor;
			if ($('#actor').find('.group:first').find('.functionalIdentifierType') == 'account')
			{
				myActor= new TinCan.Group({
				name : $('#actor').find('.group:first').find('.name').val(),
				account: {
					name:$('#actor').find('.group:first').find('.accountHomePage').val(),
					homePage:$('#actor').find('.group:first').find('.accountName').val()
					}
				});
			}
			else
			{
				myActor= new TinCan.Group({
				name : $('#actor').find('.group:first').find('.name').val()
				//$('#actor').find('.group:first').find('.functionalIdentifierType').val() : $('#actor').find('.group:first').find('.functionalIdentifier').val()
				});
				myActor[$('#actor').find('.group:first').find('.functionalIdentifierType').val()] = $('#actor').find('.group:first').find('.functionalIdentifier').val();
			}
			 $('#actor').find('.agent').each(function(index){
			 	var agentToAddToGroup = new TinCan.Agent({
				name : $(this).find('.name').val(),
				mbox : $(this).find('.mbox').val(),
				mbox_sha1sum: $(this).find('.mbox_sha1sum').val(),
				openid: $(this).find('.openid').val(),
				account: {
					name: $(this).find('.accountHomePage').val(),
					homePage: $(this).find('.accountName').val()
					}
				});
				if ($(this).find('.functionalIdentifierType') == 'account')
				{
					myActor= new TinCan.Agent({
					name : $(this).find('.name').val(),
					account: {
						name:$(this).find('.accountName').val(),
						homePage:$(this).find('.accountHomePage').val()
						}
					});
				}
				else
				{
					myActor= new TinCan.Agent({
					name : $(this).find('.name').val()
					//$(this).find('.functionalIdentifierType').val() :$(this).find('.functionalIdentifier').val()
					});
					myActor[$(this).find('.functionalIdentifierType').val()] = $(this).find('.functionalIdentifier').val();
				}

				myActor.member[index] = agentToAddToGroup;
			 });
		break;
	}
	
	//verb
	var myVerb = new TinCan.Verb({
		id : "http://tincanapi.co.uk/tinrepo/verbs/registered_extension",
		display : {
			"en-GB" : "Registered Extension",
			"en-US" : "Registered Extension"
		}
	});
	 
	
	//Object
	var myTarget;
	
	//Create the activity definition
	var myActivityDefinitionName = new Object();
	 $('#activity').find('.name').each(function(index) {
	   myActivityDefinitionName[$(this).find('.nameKey').val()] = $(this).find('.nameValue').val()
	 });
	 var myActivityDefinitionDescription = new Object();
	 $('#activity').find('.description').each(function(index) {
	   myActivityDefinitionDescription[$(this).find('.descriptionKey').val()] = $(this).find('.descriptionValue').val()
	 });
	 var myActivityDefinitionExtensions = new Object();
	  $('#activity').find('.extension').each(function(index) {
	   myActivityDefinitionExtensions[$(this).find('.extensionKey').val()] = $(this).find('.extensionValue').val()
	 });
	 
	 var myActivityDefinition = new TinCan.ActivityDefinition({
		type : $('#activity').find('.activityType').val(),
		name:  myActivityDefinitionName,
		description:  myActivityDefinitionDescription,
		extensions:  myActivityDefinitionExtensions
	});
	
	//Create the activity
	var myActivity = new TinCan.Activity({
		id : $('#activity').find('.activityId').val(),
		definition : myActivityDefinition
	});
	
	myTarget = myActivity;
	
	var stmt = new TinCan.Statement({
		actor : deleteEmptyProperties(myActor),
		verb : deleteEmptyProperties(myVerb),
		target : deleteEmptyProperties(myTarget)
	},true);
	
	console.log ('sending: ' + JSON.stringify(stmt));
	
	//TODO: add callback confirming that the extension has been registered. 
	myTinCan.sendStatement(stmt, function(err, xhr) {
	});
}
