let FLOW_CHANGE = false;
let LAST_RIGHT_CLICKED_ELEMENT = null;
let LAST_FOCUS_OUT_ELEMENT = null;

addEventListeners(); 

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.message === "WRONG_WORD_LIST"){
        sendResponse({status: "ok"});
        generatePopupWindow(request.wrong_word_list, request.error);
      }
      if(request.message === "QUESTION_POPUP"){
        sendResponse({status: "ok"});
        generateQuestionWindow(request.selection_text);
      }
      if(request.message === "ANSWER_RCVD"){
        sendResponse({status: "ok"});
        handleAnswerRcvd(request.answer, request.error);
      }
      if(request.message === "GENERATE_CONTENT_RCVD"){
        sendResponse({status: "ok"});
        handleGeneratedContent(request.content, request.error);
      }
      if(request.message === "TASK_CONTENT_RCVD"){
        sendResponse({status: "ok"});
        handleTaskResponse(request.content, request.error);
      }
    }
);

function addEventListeners(){
    document.addEventListener('focusout', handleFocusOut, true);
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('click', handleClicks, true);
    document.addEventListener("contextmenu", (event) => {
        // Store the element where the right-click happened
        LAST_RIGHT_CLICKED_ELEMENT = event.target;
     });
}

function handleFocusIn(event){
    const target = event.target;

    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if(!($(target).parents("#writewise-popup-id").length) && !($(target).parents("#questionwise-popup-id").length)){
            $('.writewise-internal').remove();
            $(".writewise-popup-window").remove();
            $(".questionwise-container").remove();
            addModalIcon(target);
        }   
    }
}

function addModalIcon(target){
    //first remove all existing icons
    $('.writewise-internal').remove()

    let imageURL = chrome.runtime.getURL('icons/icon-circle.png');
    //adding modal icon 
    let anchorName = "--writewise-anchor" + (Math.floor(Math.random() * 1000) + 1);
    $(target).css("anchor-name", anchorName);
    $("body").append(`<div class="writewise-icon writewise-internal" id="writewise-icon-id" style=position-anchor:` + anchorName + `><img class="writewise-icon-image" id="writewise-image-icon-id" src = "` + imageURL + `"></div>`);
    $(".writewise-internal").click(openPopup);
}

function openPopup(){
    let loaderURL = chrome.runtime.getURL('icons/loader.gif');

    $("body").append(`<div class="writewise-popup-window" id="writewise-popup-id">
        <div class="writewise-loader-container">
            <img src="` + loaderURL + `">
        </div>
        
    </div>`);

    const icon = document.getElementById('writewise-icon-id');
    const popupWindow = document.getElementById('writewise-popup-id');

    popupWindow.style.display = "block";

   let position = calculatePopupPosition(icon, popupWindow); 

    // Apply final position to the popup window
    popupWindow.style.top = `${position.top}px`;
    popupWindow.style.left = `${position.left}px`;

    $(".writewise-loader-container").show();
    
    //fetchSpellingMistakes();
    
    //calling the updated fetch spelling mistakes function
    findSpellingMistakes();
}

function findSpellingMistakes(){
    let inputText = $(LAST_FOCUS_OUT_ELEMENT).val() || $(LAST_FOCUS_OUT_ELEMENT).text();
    fetchSpellingMistakes(inputText);
    
}

function generateQuestionWindow(selectionText){
    //add anchor to the last element with right click
    let loaderURL = chrome.runtime.getURL('icons/loader.gif');
    let imageURL = chrome.runtime.getURL('icons/icon.png');

    let anchorName = "--questionwise-anchor" + (Math.floor(Math.random() * 1000) + 1);
    //$(LAST_RIGHT_CLICKED_ELEMENT).css("anchor-name", anchorName);

    let baseHTML = `<div class="questionwise-container" id="questionwise-popup-id" >
        <div class="questionwise-header">
            <div class="questionwise-logo"><img src="` + imageURL + `"></div>

            <div class="questionwise-close-button">
                <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </div>
        </div>

        <div class="questionwise-input-container">
            <input type="text" 
                   class="questionwise-input" 
                   placeholder="Type your question here..."
                   id="questionwise-question-input">
            <button class="questionwise-submit-button" id="questionwise-submit">
                <svg viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            </button>
        </div>

        <div class="questionwise-response-container" id="questionwise-response-container">
            <div class="questionwise-response-scroll">
                <div class="questionwise-response" id="questionwise-response">
                <div class="questionwise-response-loader" style="display:none;"><img class="questionwise-response-loader-image" src="` + loaderURL + `"></div>

                    <!-- Response will be inserted here -->
                </div>
            </div>
            <div class="questionwise-response-actions">
                <button class="questionwise-action-button" id="questionwise-copy">
                    <svg viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                </button>
                <button class="questionwise-action-button" id="questionwise-regenerate">
                    <svg viewBox="0 0 24 24">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>`;

    $("body").append(baseHTML);
    let position = calculatePopupPosition(LAST_RIGHT_CLICKED_ELEMENT, document.getElementById("questionwise-popup-id"));
    $(".questionwise-container").css("top", position.top + "px");
    $(".questionwise-container").css("left", position.left + "px");


    questionWiseJS(selectionText);
}

function handleAnswerRcvd(answer, error){
    $(".questionwise-response-loader").hide();
    const responseDiv = document.getElementById('questionwise-response');
    if(!error){
        responseDiv.textContent = JSON.parse(answer).answer;
    }
    else{
        responseDiv.textContent = "Something went wrong. Please try again later.";
    }

}

function handleGeneratedContent(content, error){
    $(".writewise-response-loader").hide();
    $("#writewise-response-content").show();
    if(!error){
        document.getElementById('writewise-response-content').textContent = JSON.parse(content).answer;
    }
    else{
        document.getElementById('writewise-response-content').textContent = "Something went wrong. Please try again later.";
    }
}

function handleTaskResponse(content, error){
    $(".writewise-response-loader").hide();
    $("#writewise-response-content").show();
    if(!error){
        document.getElementById('writewise-response-content').textContent = JSON.parse(content).answer;
    }
    else{
        document.getElementById('writewise-response-content').textContent = "Something went wrong. Please try again later.";
    }
}   

function fetchSpellingMistakes(inputText){
    chrome.runtime.sendMessage({message: "FETCH_WORD_LIST", input_text: inputText}, function(response) {  });
}

function handleFocusOut(event){
    if (event.target.id !== "writewise-popup-id" && event.target.id !== "writewise-icon-id" && event.target.id !== "writewise-image-icon-id" && !($(event.target).parents("#writewise-popup-id").length) && !($(event.target).parents("#questionwise-popup-id").length)) {
        LAST_FOCUS_OUT_ELEMENT = event.target;
    }
}

function callSpellCheck(textContent){
    chrome.runtime.sendMessage({message: "SPELL_CHECK", text_content: textContent}, function(response) {  });
}

function handleClicks(event){
    let target = event.target;
    if (!(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        if(!($(target).parents("#writewise-popup-id").length) && !($(target).parents("#questionwise-popup-id").length) && target.id !== "writewise-popup-id" && target.id !== "writewise-icon-id" && target.id !== "writewise-image-icon-id" ){
            $('.writewise-internal').remove();
            $(".writewise-popup-window").remove();
            $(".questionwise-container").remove();
        }   
    }
}

function generatePopupWindow(wrongWordList, error){
    $(".writewise-loader-container").hide();
    $(".writewise-popup-window").append(addSpellCheckContent(wrongWordList, error));
    addSpellCheckJS();
}

function addSpellCheckContent(wrongWordList, error){
    let imageURL = chrome.runtime.getURL('icons/icon.png');
    let loaderURL = chrome.runtime.getURL('icons/loader.gif');


    let wrongWordHTMLList = "";
    if(error){
        wrongWordHTMLList = `<div style="padding: 16px; color: #388e3c; border-radius: 4px; text-align: center; border: 1px solid #388e3c;">
            Something went wrong. Please try again later.
        </div>`;
    }
    else if(wrongWordList.length <= 0){
        wrongWordHTMLList = `<div style="padding: 16px; color: #388e3c; border-radius: 4px; text-align: center; border: 1px solid #388e3c;">
            Good work! No spelling mistakes found
        </div>`;
    }
    else{
        for(let i = 0; i < wrongWordList.length; i++){
            wrongWordHTMLList += addWritewiseWordPair(wrongWordList[i].wrong_word, wrongWordList[i].corrected_word);
        }
    }
    

    let baseHTML = `<div class="writewise-container">
        <div class="writewise-header">
            <div class="writewise-logo"><img src="` + imageURL + `"></div>
            <div class="writewise-close-button">
                <svg viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </div>
        </div>

        <div class="writewise-word-list">
            ` + wrongWordHTMLList + `
        </div>
        <div class="writewise-input-section">
            <label for="tone">Tone:</label>
            <input type="text" id="writewise-tone" placeholder="Enter tone (e.g., formal, casual)">

            <label for="persona">Persona:</label>
            <input type="text" id="writewise-persona" placeholder="Enter persona (e.g., teacher, friend)">

            <label for="additional-info">Additional Info:</label>
            <input type="text" id="writewise-additional-info" placeholder="Enter additional information">

            <button id="writewise-generate-content">Generate Content</button>
        </div>

        <div id="writewise-response-section">
            <h3>Generated Response:</h3>
            <div class="writewise-response-loader" style="display:none;"><img class="writewise-response-loader-image" src="` + loaderURL + `"></div>

            <p id="writewise-response-content"></p>
        </div>

        <div class="writewise-icon-section">
            <div class="writewise-generate-icon writewise-icon-class" id="writewise-expand-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M4 10v4h4l-4-4zm16-4h-4l4 4v-4zm-4 8h4v4l-4-4zM4 10v4h4l-4-4zm0 4h4v4l-4-4zm8-8v4H8l4-4zm8 8v4h-4l4-4zm-4-4H8V8l4 4z"/>
                </svg>
                <div class="writewise-icon-label">Expand</div>
            </div>
            <div class="writewise-generate-icon writewise-icon-class" id="writewise-summarize-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h10v2H7V7zm0 4h6v2H7v-2z"/>
                </svg>
                <div class="writewise-icon-label">Summarize</div>
            </div>
            <div class="writewise-generate-icon writewise-icon-class" id="writewise-rephrase-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4zm0 6h10v2H4zm0 6h16v2H4z"/>
                </svg>
                <div class="writewise-icon-label">Rephrase</div>
            </div>
        </div>
    </div>`

    return baseHTML;
}

function addWritewiseWordPair(wrongWord, correctWord) {
    if(wrongWord && correctWord){
        if(wrongWord.toLowerCase() != correctWord.toLowerCase()){
            return `
            <div class="writewise-word-item">
                <span class="writewise-wrong-word">` + wrongWord + `</span>
                <span class="writewise-arrow">→</span>
                <span class="writewise-correct-word">` + correctWord + `</span>
            </div>
            `;
        }
        else{
            return " ";
        }
    }
    else{
        return " ";
    }
}

function fetchAnswer(selectionText, question){
    chrome.runtime.sendMessage({message: "FETCH_ANSWER", selection_text: selectionText, question: question}, function(response) {  });
}

function generateContent(tone, persona, info){
    let inputText = $(LAST_FOCUS_OUT_ELEMENT).val() || $(LAST_FOCUS_OUT_ELEMENT).text();
    chrome.runtime.sendMessage({message: "GENERATE_CONTENT", tone: tone, persona: persona, info: info, input_text: inputText}, function(response) {  });

}

function questionWiseJS(selectionText){
    // Close button functionality
    document.querySelector('.questionwise-close-button').addEventListener('click', () => {
        $(".questionwise-container").remove();
    });

    // Get elements
    const submitButton = document.getElementById('questionwise-submit');
    const input = document.getElementById('questionwise-question-input');
    const responseContainer = document.getElementById('questionwise-response-container');
    const responseDiv = document.getElementById('questionwise-response');
    const copyButton = document.getElementById('questionwise-copy');
    const regenerateButton = document.getElementById('questionwise-regenerate');

    // Handle submission
    function handleSubmit() {
        const question = input.value.trim();
        if (question) {
            // Show response container
            responseContainer.style.display = 'flex';
            $(".questionwise-response-loader").show();

            // Here you would typically make an API call
            fetchAnswer(selectionText, question);

            // For now, we'll show a long response to demonstrate scrolling
            //responseDiv.textContent = `You asked: ${question}\n\n` + 
            //    'This is a long response to demonstrate scrolling. '.repeat(20);
            
            // Clear input
            input.value = '';
        }
    }

    // Handle copy
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(responseDiv.textContent);
            
            // Show success feedback
            const success = document.createElement('div');
            success.className = 'questionwise-copy-success';
            success.textContent = 'Copied!';
            copyButton.appendChild(success);
            success.style.display = 'block';
            
            setTimeout(() => {
                success.remove();
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });

    // Handle regenerate
    regenerateButton.addEventListener('click', () => {
        // Here you would typically make another API call
        // For now, we'll just append "(Regenerated)" to the response
        responseDiv.textContent += ' (Regenerated)';
    });

    // Submit on button click
    submitButton.addEventListener('click', handleSubmit);

    // Submit on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
}

function addSpellCheckJS(){
    document.getElementById('writewise-response-section').style.display = 'block';
    // "Generate Content" button functionality
    document.getElementById('writewise-generate-content').addEventListener('click', function () {
        $(".writewise-response-loader").show();
        $("#writewise-response-content").hide();
        const tone = document.getElementById('writewise-tone').value;
        const persona = document.getElementById('writewise-persona').value;
        const additionalInfo = document.getElementById('writewise-additional-info').value;        
        
        generateContent(tone, persona, additionalInfo);
    });

    // Add functionality for icons here as needed
    document.getElementById('writewise-expand-icon').addEventListener('click', () => {
        inputRegenTask("Expand");
    });

    document.getElementById('writewise-summarize-icon').addEventListener('click', () => {
        inputRegenTask("Summarize");
    });

    document.getElementById('writewise-rephrase-icon').addEventListener('click', () => {
        inputRegenTask("Rephrase");
    });

    $(".writewise-close-button").click(function(event){
        $(".writewise-popup-window").remove();
    });

    let inputText = $(LAST_FOCUS_OUT_ELEMENT).val() || $(LAST_FOCUS_OUT_ELEMENT).text();
    
    if(!inputText){
        $(".writewise-generate-icon").css({"pointer-events": "none", "opacity": "0.5"});
    }
}

function inputRegenTask(task){
    $(".writewise-response-loader").show();
    $("#writewise-response-content").hide();
    let inputText = $(LAST_FOCUS_OUT_ELEMENT).val() || $(LAST_FOCUS_OUT_ELEMENT).text();

    chrome.runtime.sendMessage({message: "INPUT_REGEN", task: task, input_text: inputText}, ( ) => { });

}

function calculatePopupPosition(iconElement, popupElement) {
    if (!iconElement || !popupElement) {
        throw new Error("Both iconElement and popupElement are required.");
    }

    // Get dimensions and positions of the icon and viewport
    const iconRect = iconElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get the max height of the popup from CSS
    const computedStyle = window.getComputedStyle(popupElement);
    const maxHeight = parseInt(computedStyle.maxHeight, 10) || viewportHeight;

    // Use maxHeight as the default popup height for positioning
    const popupHeight = maxHeight;
    const popupWidth = popupElement.offsetWidth;

    // Calculate potential positions
    const belowIcon = iconRect.bottom; // Top position if placed below the icon
    const aboveIcon = iconRect.top - popupHeight; // Top position if placed above the icon
    const leftSide = iconRect.left - popupWidth; // Left position if placed to the left of the icon
    const rightSide = iconRect.right; // Left position if placed to the right of the icon

    // Determine the best vertical position
    let topPosition = belowIcon;
    if (belowIcon + popupHeight > viewportHeight && aboveIcon >= 0) {
        topPosition = aboveIcon; // Place above the icon if below would exceed viewport
    } else if (belowIcon + popupHeight > viewportHeight) {
        topPosition = Math.max(0, viewportHeight - popupHeight); // Ensure within viewport
    }

    // Determine the best horizontal position
    let leftPosition = iconRect.left;
    if (iconRect.left + popupWidth > viewportWidth && leftSide >= 0) {
        leftPosition = leftSide; // Place to the left if right would exceed viewport
    } else if (iconRect.left < 0) {
        leftPosition = Math.max(0, rightSide); // Adjust if left side goes out of bounds
    }

    // Ensure popup does not overlap the icon (adjust slightly)
    const iconPadding = 5; // Add some padding
    if (topPosition === belowIcon) {
        topPosition += iconPadding; // Adjust below position
    } else {
        topPosition -= iconPadding; // Adjust above position
    }

    // Set the max height on the popup to ensure it doesn't exceed the viewport
    popupElement.style.maxHeight = `${Math.min(maxHeight, viewportHeight - iconPadding)}px`;

    // Return the calculated positions
    return { top: topPosition, left: leftPosition };
}
