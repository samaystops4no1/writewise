import appConfig from "./app-config.js";
import envConfig, { environment } from "./env-config.js";

const config = appConfig[envConfig.environment]; 

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "SPELL_CHECK"){
            //call process event
            console.log("Message rcvd");
            spellCheck(request.text_content, sender.tab.id);
            sendResponse({status: "ok"});
        }
        if(request.message === "FETCH_WORD_LIST"){
            getWrongWordList(request.input_text, sender.tab.id);
            sendResponse({status: "ok"});
        }
        if(request.message === "FETCH_ANSWER"){
          fetchAnswer(request.selection_text, request.question, sender.tab.id);
          sendResponse({status: "ok"});
        }
        if(request.message === "GENERATE_CONTENT"){
          generateContent(request.tone, request.persona, request.info, request.input_text, sender.tab.id);
          sendResponse({status: "ok"});
        }
        if(request.message === "INPUT_REGEN"){
          inputRegen(request.task, request.input_text, sender.tab.id);
          sendResponse({status: "ok"});
        }

    }
);

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "WRITEWISE_CHROME_CONTEXT_MENU",
    title: "WriteWise Selection",
    type: 'normal',
    contexts: ['selection']
  });
  
});

chrome.contextMenus.onClicked.addListener(function(info, tabs){
  let messageObject = {
    "message": "QUESTION_POPUP",
    "selection_text": info.selectionText
  }
  sendMessageToContentScript(tabs.id, messageObject, ( ) => {
    
  });

});

function spellCheck(textContent, callback){
    let reqBody = {
        "model": config.model,
        "messages": [
          {
            "role": "system",
            "content": "Please check the following text strictly for spelling mistakes only. Only return words that are misspelled or incorrectly spelled. Do not return any words that are already correctly spelled. Focus only on words that have mistakes."
          },
          {
            "role": "user",
            "content": textContent
          }
        ],
        "response_format": config.gpt_api.spell_check.body.response_format
    };

    let requestObject = {
        "url": config.url,
        "details":{
            "method": "POST",
            "headers": {
                "Authorization": "",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(reqBody)
        }
        
    }

    makeApiCall(requestObject, function(response, error){
      if(!error){
        response.json().then(function(data) {
          let wrongWordList = JSON.parse(data.choices[0].message.content).word_list;
          callback(wrongWordList, 0);
        });
      }
      else{
        callback([], 1);
      }
    });

}

function handleWordMistakes(wordList, tabID){
  let messageObject = {
    "message": "MISTAKE_FOUND",
    "word_list": wordList
  }

  sendMessageToContentScript(tabID, messageObject, ( ) => { });
}

function fetchAnswer(selectionText, question, tabID){
  let reqBody = {
    "model": config.model,
    "temperature": 0,
    "messages": [
      {
        "role": "system",
        "content": "Use this as the input text and answer questions that the user asks based on this.- " + selectionText
      },
      {
        "role": "user",
        "content": question
      }
    ],
        "response_format": config.gpt_api.question_answer.body.response_format
    };

  let requestObject = {
      "url": config.url,
      "details":{
          "method": "POST",
          "headers": {
              "Authorization": "",
              "Content-Type": "application/json"
          },
          "body": JSON.stringify(reqBody)
      }
    }

    makeApiCall(requestObject, function(response, error){
      let messageObject = {
        "message": "ANSWER_RCVD"
      };
      if(!error){
        response.json().then(function(data) {
          let responseData = data.choices[0].message.content;
          messageObject.answer = responseData;
          messageObject.error = null;
          sendMessageToContentScript(tabID, messageObject, ( ) => {  });
        });
      }
      else{
        messageObject.error = 1;
        sendMessageToContentScript(tabID, messageObject, ( ) => {  });
      }
    });
}

function getWrongWordList(inputText, tabID){
  spellCheck(inputText, (wrongWordList, error) => {
    let messageObject = {
      "message": "WRONG_WORD_LIST",
    };
    if(!error){
      messageObject.wrong_word_list = wrongWordList;
      messageObject.error = null;
    }
    else{
      messageObject.error = 1;
    }
    sendMessageToContentScript(tabID, messageObject, ( ) => { });

  });
}

function generateContent(tone, persona, info, inputText, tabID){
  let systemContent = (inputText) ? ("Use the following text at information already typed in by the user - " + inputText) : (" "); 
  let userContent = "As a " + ((persona) ? (persona) : ("working professional")) + " generate " + ((tone) ? (tone) : ("formal")) + " content based on text already entered. " + ((info) ? ("This is the additional information on generating content - " + info) : (" "));

  let reqBody = {
    "model": config.model,
    "temperature": 0,
    "messages": [
      {
        "role": "system",
        "content": systemContent
      },
      {
        "role": "user",
        "content": userContent
      }
    ],
        "response_format":  config.gpt_api.generate_content.body.response_format
    };

    requestObject = {
      "url": config.url,
      "details":{
          "method": "POST",
          "headers": {
              "Authorization": "",
              "Content-Type": "application/json"
          },
          "body": JSON.stringify(reqBody)
      }
    }

    makeApiCall(requestObject, function(response, error){
      let messageObject = {
        "message": "GENERATE_CONTENT_RCVD",
      };
      if(!error){
        response.json().then(function(data) {
          let responseData = data.choices[0].message.content;
          messageObject.content = responseData;
          messageObject.error = null;
          sendMessageToContentScript(tabID, messageObject, ( ) => {  });
        });
      }
      else{
        messageObject.error = 1;
        sendMessageToContentScript(tabID, messageObject, ( ) => {  });
      }
    });
}

function inputRegen(task, inputText, tabID){
  let systemContent =  (inputText) ? ("Use the following text at information already typed in by the user - " + inputText) : (" ");
  let userContent = task + " the entered text."

  let reqBody = {
    "model": config.model,
    "temperature": 0,
    "messages": [
      {
        "role": "system",
        "content": systemContent
      },
      {
        "role": "user",
        "content": userContent
      }
    ],
    "response_format":  config.gpt_api.generate_content.body.response_format
    };

    requestObject = {
      "url": config.url,
      "details":{
          "method": "POST",
          "headers": {
              "Authorization": "",
              "Content-Type": "application/json"
          },
          "body": JSON.stringify(reqBody)
      }
    }

    makeApiCall(requestObject, function(response, error){
      let messageObject = {
        "message": "TASK_CONTENT_RCVD"
      }
      if(!error){
        response.json().then(function(data) {
          let responseData = data.choices[0].message.content;
          messageObject.content = responseData;
          messageObject.error = null;
          sendMessageToContentScript(tabID, messageObject, ( ) => {  });
        });
      }
      else{
        messageObject.error = 1;
        sendMessageToContentScript(tabID, messageObject, ( ) => {  });
      }
    });
}

function makeApiCall(requestObject, callback){
    console.log(requestObject);
    fetch(requestObject.url, requestObject.details)
    .then(function(response){
        if (response.status !== 200) {
            response.text().then((text) => {
                callback(response, 1);
            });
        }
        else {
            callback(response, 0);
        }
    });
}

function sendMessageToContentScript(tabId, messageObject, callback){
  try {
      chrome.tabs.sendMessage(tabId, messageObject, function(response) {
          if(chrome.runtime.lastError){
              //do something with error
              console.log(chrome.runtime.lastError);
          }
          else{
              callback(response);
          } 
      });
  }
  catch(err){
      //do something with error
  }
}

function getChromeVariables(key, callback){
  chrome.storage.sync.get(key, function(result) {
      callback(result);
  });
}

function setChromeVariables(object, callback){
  chrome.storage.sync.set(object, function() {
      callback();
  });
}