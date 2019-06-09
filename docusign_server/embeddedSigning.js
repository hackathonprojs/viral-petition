const express = require('express');
const docusign = require('docusign-esign');
const path = require('path');
const apiClient = new docusign.ApiClient();
const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || 'localhost';
const fs = require('fs');

//On execution an envelope is sent to the provided email address, one signHere
//tab is added, the document supplied in workingdirectory\fileName is used.
//Open a new browser pointed at http://localhost:3001 to execute. 
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

//Fill in your token / ID / recipient / Filename Here

//Obtain an OAuth token from https://developers.docusign.com/oauth-token-generator
//Obtain your accountId from account-d.docusign.com > Go To Admin > API and Keys

const OAuthToken = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQkAAAABAAUABwAADZELU-zWSAgAAE20GZbs1kgCAFKc49eTdTdLngDigE6OAQMVAAEAAAAYAAkAAAAFAAAAKwAAAC0AAAAvAAAAMQAAADIAAAA4AAAAMwAAADUAAAANACQAAABmMGYyN2YwZS04NTdkLTRhNzEtYTRkYS0zMmNlY2FlM2E5NzgwAIC4TX5S7NZINwCAhPAcBEvrSbI1fmVlVh7w.FVPbGXjQfsDU1clxI6NUEQxNtn7WCkpMcdL9jcgNZM1wWggBxcHFBLTg04yEJqtwN4vdysQLvBCtbOM8DuzC0_Q-aBOWTgj8HmE9tRK4Q7ao-cw1vM0AnLD_1Ehp7E8ocvzH-LtOJkChWll7RFT3ykm2CUESlYTu7tSSBEBW023GlEKXIyUTo_MEL4UII3EePvWJyhOk1wuW6qDwd27iAVpkwnVrcl6DnQD-TeZMQagQEsb9TJ9udC9_E5L9HtenNpfAS6h9rufz_VKm26xYYA8rmCCSCo3UgxU8oDKoj4knPfkwGFzjWOnsrRTyS5NyJbzyy_EoH4t7mUXlK9UmuA';
const accountId = '8502426';


//Recipient Information goes here
const recipientName = 'coder collective';
const recipientEmail = 'codercollective@gmail.com';

//Point this to the document you wish to send's location on the local machine. Default location is __workingDir\fileName
const fileName = 'docs/forest_petition2.pdf';

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

app.get('/', function (req, res) {

  apiClient.setBasePath('https://demo.docusign.net/restapi');
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + OAuthToken);

  // *** Begin envelope creation ***

  
  //Read the file you wish to send from the local machine.
  fileStream = process.argv[2];
  pdfBytes = fs.readFileSync(path.resolve(__dirname, fileName));
  pdfBase64 = pdfBytes.toString('base64');

  docusign.Configuration.default.setDefaultApiClient(apiClient);

  let envDef = new docusign.EnvelopeDefinition();

  //Set the Email Subject line and email message
  envDef.emailSubject = 'Please sign this document sent from Node SDK';
  envDef.emailBlurb = 'Please sign this document sent from the DocuSign Node.JS SDK.'

  //Read the file from the document and convert it to a Base64String
  let doc = new docusign.Document();
  doc.documentBase64 = pdfBase64;
  doc.fileExtension = 'pdf';
  doc.name = 'Node Doc Send Sample';
  doc.documentId = '1';

  //Push the doc to the documents array.
  let docs = [];
  docs.push(doc);
  envDef.documents = docs;

  //Create the signer with the previously provided name / email address
  let signer = new docusign.Signer();
  signer.name = recipientName;
  signer.email = recipientEmail;
  signer.routingOrder = '1';
  signer.recipientId = '1';
  signer.clientUserId = '123'; //ClientUserId specifies that a recipient is captive. It ties to a generic DocuSign account and cannot be referenced without generating a recipient token.

  //Create a tabs object and a signHere tab to be placed on the envelope
  let tabs = new docusign.Tabs();

  let signHere = new docusign.SignHere();
  signHere.documentId = '1';
  signHere.pageNumber = '1';
  signHere.recipientId = '1';
  signHere.tabLabel = 'SignHereTab';
  signHere.xPosition = '50';
  signHere.yPosition = '50';

  const defaultName = "John Smith";
  const defaultAddress = "101 Beverly Dr, Beverly Hills, CA 90210";
  const defaultAge = "22";

  let textName = docusign.Text.constructFromObject({
    anchorString: '/name/', anchorUnits: 'pixels',
    anchorYOffset: '-9', anchorXOffset: '-9',
    //xPosition: '150', yPosition: '150',
    font: 'helvetica', fontSize: 'size11',
    bold: 'true', value: defaultName,
    locked: 'false', tabId: 'legal_name',
    tabLabel: 'Legal name'
  });

  let textAddress = docusign.Text.constructFromObject({
    anchorString: '/address/', anchorUnits: 'pixels',
    anchorYOffset: '-9', anchorXOffset: '-9',
    //xPosition: '150', yPosition: '150',
    font: 'helvetica', fontSize: 'size11',
    bold: 'true', value: defaultAddress,
    locked: 'false', tabId: 'address',
    tabLabel: 'address'
  });

  let textAge = docusign.Text.constructFromObject({
    anchorString: '/age/', anchorUnits: 'pixels',
    anchorYOffset: '-9', anchorXOffset: '-9',
    //xPosition: '150', yPosition: '150',
    font: 'helvetica', fontSize: 'size11',
    bold: 'true', value: defaultAge,
    locked: 'false', tabId: 'age',
    tabLabel: 'age'
  });

  //Create the array for SignHere tabs, then add it to the general tab array
  signHereTabArray = [];
  signHereTabArray.push(signHere);

  //Create the array for text tabs, then add it to the general tab array
  textTabArray = [];
  textTabArray.push(textName);
  textTabArray.push(textAddress);
  textTabArray.push(textAge);

  tabs.signHereTabs = signHereTabArray;
  tabs.textTabs = textTabArray;

  //Then set the recipient, named signer, tabs to the previously created tab array
  signer.tabs = tabs;

  //Add the signer to the signers array
  let signers = [];
  signers.push(signer);

  //Envelope status for drafts is created, set to sent if wanting to send the envelope right away
  envDef.status = 'sent';

  //Create the general recipients object, then set the signers to the signer array just created
  let recipients = new docusign.Recipients();
  recipients.signers = signers;

  //Then add the recipients object to the enevelope definitions
  envDef.recipients = recipients;
  
  // *** End envelope creation *** 
  

  //Send the envelope
  let envelopesApi = new docusign.EnvelopesApi();
  envelopesApi.createEnvelope(accountId, { 'envelopeDefinition': envDef }, function (err, envelopeSummary, response) {

    if (err) {
      return res.send('Error while creating a DocuSign envelope:' + err);
    }
    //Set envelopeId the envelopeId that was just created
    let envelopeId = envelopeSummary.envelopeId;

    //Fill out the recipient View request. authenticationMethod should be email. ClientUserId, RecipientId, returnUrl, userName (Full name of the signer), and email are required.
    //If a clientUserId was not specified, leave it out.
    let recipientViewRequest = new docusign.RecipientViewRequest();
    recipientViewRequest.authenticationMethod = 'email';
    recipientViewRequest.clientUserId = '123';
    recipientViewRequest.recipientId = '1';
    recipientViewRequest.returnUrl = 'http://localhost:3001/dsreturn';
    recipientViewRequest.userName = recipientName;
    recipientViewRequest.email = recipientEmail;

    //Create the variable used to handle the response
    //recipientViewResults = docusign.ViewLinkRequest();
    recipientViewResults = docusign.RecipientViewRequest();

    //Make the request for a recipient view
    envelopesApi.createRecipientView(accountId, envelopeId, { recipientViewRequest: recipientViewRequest }, function (err, recipientViewResults, response) {

      if (err) {
        return res.send('Error while creating a DocuSign recipient view:' + err);
      }

      //Set the signingUrl variable to the link returned from the CreateRecipientView request
      let signingUrl = recipientViewResults.url;

      //Then redirect to the signing URL
      res.redirect(signingUrl);
    });

  });

});

app.get('/dsreturn', function (req, res) {
  //Enter code here for post-processing after enevelope signing has been completed.
  res.send('Welcome back, enter followup code / processing information here.');
});

app.listen(port, host, function (err) {
  if (err) {
    return res.send('Error while starting the server:' + err);
  }

  console.log('Your server is running on http://' + host + ':' + port + '.');
});
