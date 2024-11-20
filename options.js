document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const message = document.getElementById('message');


    // Load the saved API key
    chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
    });

    // Save the API key
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();

        if (apiKey) {
            chrome.storage.sync.set({ apiKey }, () => {
                message.textContent = 'API Key saved successfully!';
                setTimeout(() => {
                    message.textContent = '';
                }, 2000);
            });
        } else {
            message.textContent = 'Please enter a valid API Key.';
            setTimeout(() => {
                message.textContent = '';
            }, 2000);
        }
    });
});
