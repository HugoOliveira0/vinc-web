const locateElementInPage = (
    attribute,
    id,
    shouldFocus = false
) => {
    const selectedElement = document.querySelector(
        `[${attribute}="${id}"]`
    )

    if (!selectedElement) {
        return false
    }

    const getHighlightTarget = (element) => {
        if (element.tagName !== 'IMG') {
            return element
        }

        const imageRect = element.getBoundingClientRect()
        let ancestor = element.parentElement

        // Procura um contêiner próximo que esteja recortando a imagem.
        for (let level = 0; ancestor && level < 3; level += 1) {
            const style = window.getComputedStyle(ancestor)
            const ancestorRect = ancestor.getBoundingClientRect()

            const clipsContent = [
                style.overflow,
                style.overflowX,
                style.overflowY
            ].some((value) => value === 'hidden' || value === 'clip')

            const hasSameSize =
                Math.abs(ancestorRect.width - imageRect.width) <= 2 &&
                Math.abs(ancestorRect.height - imageRect.height) <= 2

            if (clipsContent && hasSameSize) {
                return ancestor
            }

            ancestor = ancestor.parentElement
        }

        return element
    }

    const highlightTarget = getHighlightTarget(selectedElement)

    selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    })

    if (shouldFocus) {
        selectedElement.focus({
            preventScroll: true
        })
    }

    window.setTimeout(() => {
        const highlightToken = `${Date.now()}-${Math.random()}`

        // Salva o estilo original somente no primeiro destaque ativo.
        if (!highlightTarget.dataset.vincHighlightToken) {
            highlightTarget.dataset.vincPreviousOutline =
                highlightTarget.style.outline

            highlightTarget.dataset.vincPreviousOutlineOffset =
                highlightTarget.style.outlineOffset
        }

        // O clique mais recente passa a controlar a restauração.
        highlightTarget.dataset.vincHighlightToken = highlightToken

        highlightTarget.style.outline = '4px solid #00d4ff'

        highlightTarget.style.outlineOffset =
            selectedElement.tagName === 'IMG' ? '-4px' : '4px'

        window.setTimeout(() => {
            // Um clique mais recente aconteceu: este timer antigo não faz nada.
            if (
                highlightTarget.dataset.vincHighlightToken !==
                highlightToken
            ) {
                return
            }

            highlightTarget.style.outline =
                highlightTarget.dataset.vincPreviousOutline || ''

            highlightTarget.style.outlineOffset =
                highlightTarget.dataset.vincPreviousOutlineOffset || ''

            delete highlightTarget.dataset.vincHighlightToken
            delete highlightTarget.dataset.vincPreviousOutline
            delete highlightTarget.dataset.vincPreviousOutlineOffset
        }, 1800)
    }, 500)

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

export const locateImage = (tabId, imageId) => {
    return locateElement(
        tabId,
        'data-vinc-image-id',
        imageId,
        false
    )
}
