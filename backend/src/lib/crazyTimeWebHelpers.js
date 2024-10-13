const { until, By } = require("selenium-webdriver");

async function acceptCookies(driver) {
    const checkInterval = 1000; // Time in milliseconds between checks
    const maxAttempts = 10; // Maximum number of attempts to find the cookie modal

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            // Check if the cookie modal exists
            const cookieModal = await driver.wait(until.elementLocated(By.css('.cookie-modal')), checkInterval);
            const isDisplayed = await cookieModal.isDisplayed();

            if (isDisplayed) {
                // Find and click the 'Accept' button
                const acceptButton = await cookieModal.findElement(By.css('.cookie-modal__button-accept'));
                await acceptButton.click();
                console.log('Cookies accepted');
                break; // Exit loop after clicking accept
            }
        } catch (error) {
            // Log error if it's not a timeout error
            if (error.name !== 'TimeoutError') {
                console.error('Error checking for cookie modal:', error);
            }
        }
        if (attempt === maxAttempts) {
            console.log('Failed to find or accept cookies within the expected time.');
        }
        // Wait before the next check
        await driver.sleep(checkInterval);
    }

    
}

async function closeAdvertisingModal(driver) {
    const modalSelector = '.modal-container';
    const closeButtonSelector = '.close-button';
    const checkInterval = 1000; // Time in milliseconds between checks
    const maxAttempts = 10; // Maximum number of attempts to find the modal
    const retryDelay =  30 * 1000; 

    let attemptsRemaining = maxAttempts;

    async function lookForModal() {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                // Check if the modal exists
                let modalElements = await driver.findElements(By.css(modalSelector));

                if (modalElements.length > 0) {
                    const modal = modalElements[0];
                    const isDisplayed = await modal.isDisplayed();

                    if (isDisplayed) {
                        // Find the close button and click it
                        const closeButton = await modal.findElement(By.css(closeButtonSelector));
                        await closeButton.click();
                        console.log('Modal closed');
                        return; // Exit the function after closing the modal
                    }
                } else {
                    console.log('No modal found at attempt', attempt + 1);
                }
            } catch (error) {
                console.error('Error in closing the advertising modal:', error);
            }

            if (attempt === maxAttempts - 1) {
                console.log('Failed to find or close modal within the expected time. Will retry in 5 minutes.');
            }

            // Wait before the next check within the same attempt
            await driver.sleep(checkInterval);
        }

        // If the modal was not found or closed after max attempts, wait for 5 minutes before trying again
        setTimeout(() => {
            console.log('Retrying to look for the modal after 5 minutes.');
            lookForModal(); // Restart the modal search process
        }, retryDelay);
    }

    // Start the first attempt to look for the modal
    lookForModal();
}


async function closeAdvertisingModalSimple(driver) {
    const modalSelector = '.modal-container';
    const closeButtonSelector = '.close-button';

    try {
        // Try to find the modal
        let modalElements = await driver.findElements(By.css(modalSelector));
        if (modalElements.length > 0) {
            const modal = modalElements[0];
            const isDisplayed = await modal.isDisplayed();
            if (isDisplayed) {
                // Find the close button and click it
                const closeButton = await modal.findElement(By.css(closeButtonSelector));
                await closeButton.click();
                console.log('Modal closed');
            } else {
                console.log('Modal is not displayed');
            }
        } else {
            console.log('No modal found');
        }
    } catch (error) {
        console.error('Error while trying to find or close the modal:', error);
    }
}

module.exports = { acceptCookies,closeAdvertisingModal ,closeAdvertisingModalSimple};
