const locateElementInPage = (attribute, id, shouldFocus) => {
    const selectedElement = document.querySelector(
        `[${attribute}="${id}"]`
    )

    if (!selectedElement) {
        return false
    }

    selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    })

    if (shouldFocus) {
        selectedElement.focus({
            preventScroll: true
        })
    }

    return true
}

const locateElement = async (tabId, attribute, id, shouldFocus) => {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        args: [attribute, id, shouldFocus],
        func: locateElementInPage
    })

    return result
}

export const locateHeading = (tabId, headingId) => {
    return locateElement(
        tabId,
        'data-vinc-heading-id',
        headingId,
        false
    )
}

export const locateLink = (tabId, linkId) => {
    return locateElement(
        tabId,
        'data-vinc-link-id',
        linkId,
        true
    )
}

export const locateButton = (tabId, buttonId) => {
    return locateElement(
        tabId,
        'data-vinc-button-id',
        buttonId,
        true
    )
}

export const locateField = (tabId, fieldId) => {
    return locateElement(
        tabId,
        'data-vinc-field-id',
        fieldId,
        true
    )
}
