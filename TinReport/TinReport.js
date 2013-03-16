
/*
=============COPYRIGHT============ 
Tin Statement Sender - An I-Did-This prototype for Tin Can API 0.95
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

//Create an instance of the Tin Can Library

var myTinCan = new TinCan();
myTinCan.DEBUG = 0;

//define the arrays of statements as global variables
var makeModeratorStatements,
makeModeratorStatementsLength,
revokeModeratorStatements,
revokeModeratorStatementsLength,
revertExtensionStatements,
deprecateExtensionStatements,
recogniseExtensionStatements,
acceptExtensionStatements,
registerExtensionStatements;

//Define legal activity types (see profile)
var legalActivityTypes = [
	"http://tincanapi.co.uk/tinrepo/activitytypes/verb",
	"http://tincanapi.co.uk/tinrepo/activitytypes/activity_type",
	"http://tincanapi.co.uk/tinrepo/activitytypes/activity_definition_extension",
	"http://tincanapi.co.uk/tinrepo/activitytypes/result_extension",
	"http://tincanapi.co.uk/tinrepo/activitytypes/context_extension",
	"http://tincanapi.co.uk/tinrepo/activitytypes/attachment_extension",
	"http://tincanapi.co.uk/tinrepo/activitytypes/state_api_document",
	"http://tincanapi.co.uk/tinrepo/activitytypes/agent_profile_api_document",
	"http://tincanapi.co.uk/tinrepo/activitytypes/activity_profile_api_document"
];

//Details of the admin account hard coded here for now as a single item array of objects
var adminAuth = [{
	objectType:"Agent",
	account:{
		name:"gddikCN6KrbdWZaXq36T@mrandrewdownes",
		homePage:"https://mrandrewdownes.waxlrs.com/TCAPI"
		}
	}]

/*============DOCUMENT READY==============*/
$(function(){
	console.log (new Date().getTime() + ' HTML page loaded. LRS data retrieval will begin in a few milliseconds...');
	
	//Create an LRS and add to the list of record stores
	var myLRS = new TinCan.LRS({
		endpoint:"https://mrandrewdownes.waxlrs.com/TCAPI/", 
		version: "0.95",
		auth: 'Basic ' + Base64.encode("gddikCN6KrbdWZaXq36T" + ':' + "b7Q21MPlattwRn964bVW")
	});
	
	myTinCan.recordStores[0] = myLRS;
	
	getMakeModerator();
	
});

function getMakeModerator()
{	
	console.log (new Date().getTime() + ' Getting and validating data from the LRS (this may take a few seconds, please wait)...');
	
	//get the make moderator statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/make_moderator"},
		},
		callback: getRevokeModerator
	});
}

function getRevokeModerator (err,result){
	//validate and save the result of the previous step to a global variable
	makeModeratorStatements = validateAdministratorStatements(result.statements);
	//save the length as this will be used lots and will not change from here onwards
	makeModeratorStatementsLength = makeModeratorStatements.length;
	
	//Get the revoke statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/revoke_moderator"},
		},
		callback: getRevertExtension
	});
}

function getRevertExtension (err,result){
	//validate and save the result of the previous step to a global variable
	revokeModeratorStatements = validateAdministratorStatements(result.statements);
	//save the length as this will be used lots and will not change from here onwards
	revokeModeratorStatementsLength = revokeModeratorStatements.length;
	
	//Get the statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/reverted_extension"},
		},
		callback: getDeprecateExtension
	});
}

function getDeprecateExtension (err,result){
	//validate and save the result of the previous step to a global variable
	revertExtensionStatements = validateModeratorStatements(result.statements);
	
	//Get the statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/deprecated_extension"},
		},
		callback: getRecogniseExtension
	});
}

function getRecogniseExtension (err,result){
	//validate and save the result of the previous step to a global variable
	deprecateExtensionStatements = validateModeratorStatements(result.statements);
	
	//Get the statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/recognised_extension"},
		},
		callback: getAcceptExtension
	});
}

function getAcceptExtension (err,result){
	//validate and save the result of the previous step to a global variable
	recogniseExtensionStatements = validateModeratorStatements(result.statements);
	
	//Get the statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/accepted_extension"},
		},
		callback: getRegisterExtension
	});
}

function getRegisterExtension (err,result){
	//validate and save the result of the previous step to a global variable
	acceptExtensionStatements = validateModeratorStatements(result.statements);
	
	//Get the statements
	myTinCan.getStatements({
		params:{
			verb:{id:"http://tincanapi.co.uk/tinrepo/verbs/registered_extension"},
		},
		callback: processStatements
	});
}


function processStatements (err,result){
	//handle the result of the previous step
	registerExtensionStatements = validatePublicStatements(result.statements);
	console.log (new Date().getTime() + ' Data retrieved and validated. Processing data...');
	//TODO: get and validate moderator statements - store them in sub-arrays divided by object activity id, sorted by stored property
	
	//dump the results on the page....(for now)
	outputStatements(makeModeratorStatements);
	$('body').append(JSON.stringify(makeModeratorStatements));
	outputStatements(revokeModeratorStatements);
	$('body').append(JSON.stringify(revokeModeratorStatements));
	
	console.log (new Date().getTime() + ' All done. Enjoy!');
}

//============VALIDATION FUNCTIONS==========================
//TODO: remove any voided statements (note: check if TinCanJS already does it, if not, consider integrating it).

function validateAdministratorStatements(statements){
	//timestamp is important for administrator statements, not stored, so change the order
	return sortStatementsByTimestamp(
		//But before we check that, the object of all administrator statements will always be an Agent
		validateObjectType(
			//But first, the authority of all administrator statements will always be the authority defined above and stored in the global variable 'adminAuth'
			validateAuth(
				statements,
				adminAuth
			),
			"Agent"
		)
	);
}

function validateModeratorStatements(statements){
	var authorisedStatements = new Array(),
	statementsLength = statements.length;
	//cycle through the array of statements
	for (var i = 0; i < statementsLength; i++) {
		//get the current statement
		var statement = statements[i],
		//get the most recent time the authority was promoted to moderator prior to the stored time of the current statement
		matchingMakeModeratorStatement = matchModeratorStatement(makeModeratorStatements,makeModeratorStatementsLength,statement),
		//get the most recent time the authority was demoted from moderator prior to the stored time of the current statement
		matchingRevokeModeratorStatement = matchModeratorStatement(revokeModeratorStatements,revokeModeratorStatementsLength,statement);
		
		//If we have found a matching make moderator statement 
		//AND EITHER we have not found a matching revoke moderator statement OR the make moderator statement is most recent, THEN...
		if ((matchingMakeModeratorStatement.success) 
		&& ((!matchingRevokeModeratorStatement.success)||(matchingMakeModeratorStatement.timestamp >= matchingRevokeModeratorStatement.timestamp))){
			authorisedStatements.push(statement);
		}
	}
	
	//Check that the activity type is valid
	return validateActivityTypes(
		//but first, make sure it's an activity.
		validateObjectType(
			authorisedStatements,
			"Activity"
		),
	legalActivityTypes
	);
}

function matchModeratorStatement(moderatorManagementStatements,moderatorManagementStatementsLength,statementToValidate)
{
	var parsedStoredOfStatementToValidate = Date.parse(statementToValidate.stored);
	//cycle through the moderator management statements
	for (var i = 0; i < moderatorManagementStatementsLength; i++) {
		var moderatorManagementStatement = moderatorManagementStatements[i];
		//Find the most recent moderator management statement whose object matches the statement being validated.
		//To match, the timestamp of the moderator management statement must be before (or equal to) the stored property of the statement being validated
		if (_.isEqual(deleteEmptyProperties(moderatorManagementStatement.target),deleteEmptyProperties(statementToValidate.authority))
		&& (Date.parse(moderatorManagementStatement.timestamp) <= parsedStoredOfStatementToValidate)) {
			//return that a match has been found and give the timestamp.
			return {
				success:true,
				timestamp:moderatorManagementStatement.timestamp
			};
		}
	}
	//No match found
	return {
		success:false,
		timestamp:null
	};
}
//Make sure that the object is an activity with a legal activity type
function validatePublicStatements(statements){
	return validateActivityTypes(
		validateObjectType(
			statements,
			"Activity"
		),
	legalActivityTypes
	);
}

//Checks that the statements authority matches a given array if authorities
function validateAuth(statements,auths)
{	
	//some variables to be used in the loops
	var returnStatements = new Array(),
	statementsLength = statements.length,
	authsLength = auths.length;
	
	//cycle through the array of statements
	for (var i = 0; i < statementsLength; i++) {
		//get the current statement
		var statement = statements[i];
		//cycle through the array of authorities to compare against
		for (var j = 0; j < authsLength; j++) {
			//get the current authority
			var auth = auths[j];
			//If the statement authority and the comparision authority match...
			if (_.isEqual(deleteEmptyProperties(statement.authority),deleteEmptyProperties(auth))) {
				//add the statement to the array
				returnStatements.push(statement);
				//just in case the authority appears in our array twice, break the auths loop
				break;
			}
		}
	}
	//return an array of statements with invalid statements not included. 
	return returnStatements;
}


function validateObjectType(statements,objectType)
{
	var returnStatements = new Array();
	var statementsLength = statements.length;
	for (var i = 0; i < statementsLength; i++) {
		var statement = statements[i];
		if (statement.target.objectType == objectType) {
			returnStatements.push(statement);
		}
	}
	return returnStatements;
}

//Note: make sure all statements passed to this function have an object objectType of Activity
function validateActivityTypes(statements,activityTypes)
{
	var returnStatements = new Array();
	var statementsLength = statements.length;
	for (var i = 0; i < statementsLength; i++) {
		var statement = statements[i];
		if ($.inArray(statement.target.definition.type,activityTypes) != -1) {
			returnStatements.push(statement);
		}
	}
	return returnStatements;
}

//TODO: add additional parameters to this function and move to TinCan.Utils
//sorts by newest timestamp first - reverse chronological order
function sortStatementsByTimestamp(statements)
{
	return statements.sort(function(x, y){
		timestamp1 = new Date(x.timestamp);
		timestamp2 = new Date(y.timestamp);
		return timestamp2 - timestamp1;
	});
}

//===================================


function outputStatements(statements){
	//For each statement returned...
	var statementsLength = statements.length;
	for (var i = 0; i < statementsLength; i++) {
		var statement = statements[i];
		
		var actor = '<a target="blank" href="' + statement.actor.mbox + '">' + statement.actor.name + '</a>';
		var verb = (statement.verb.display['en-GB']) ? statement.verb.display['en-GB'] : statement.verb.display['en-US'];
var objectLink;

		if (statement.target.objectType == "Agent")
		{
			objectLink = '<a target="blank" href="' + statement.target.mbox + '">' + statement.target.name + '</a>'
		}
		else
		{
			var object
			if (statement.target.definition){
				object = getLangFromMapInGBOrDefault(statement.target.definition.name)
			}
			else
			{
				object = statement.target.id;
			}
			
			objectLink = '<a target="blank" href="' + statement.target.id + '">' + object + '</a>'
		}
		var statementDiv = $('<div class="section"></div>');
		statementDiv.html(actor + ' ' + verb + ' ' + objectLink +'<br />'+ statement.authority);

		$('body').append(statementDiv);
	}
	
}

