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

    const parseRgbColor = (color) => {
        const match = color.match(/^rgba?\(([^)]+)\)$/i)

        if (!match) {
            return null
        }

        const values = match[1]
            .split(',')
            .map((value) => Number.parseFloat(value.trim()))

        if (values.length < 3 || values.some(Number.isNaN)) {
            return null
        }

        return {
            red: values[0],
            green: values[1],
            blue: values[2],
            alpha: values[3] ?? 1
        }
    }

    const getRelativeLuminance = ({ red, green, blue }) => {
        const convertChannel = (channel) => {
            const value = channel / 255

            return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4
        }

        const convertedRed = convertChannel(red)
        const convertedGreen = convertChannel(green)
        const convertedBlue = convertChannel(blue)

        return (
            0.2126 * convertedRed +
            0.7152 * convertedGreen +
            0.0722 * convertedBlue
        )
    }

    const getContrastRatio = (firstColor, secondColor) => {
        const firstLuminance = getRelativeLuminance(firstColor)
        const secondLuminance = getRelativeLuminance(secondColor)
        const lighter = Math.max(firstLuminance, secondLuminance)
        const darker = Math.min(firstLuminance, secondLuminance)

        return (lighter + 0.05) / (darker + 0.05)
    }

    const getAdjacentBackground = (element, useInnerArea) => {
        if (selectedElement.tagName === 'IMG') {
            return { color: null, complex: true }
        }

        let currentElement = useInnerArea
            ? element
            : element.parentElement

        while (currentElement) {
            const style = window.getComputedStyle(currentElement)

            if (style.backgroundImage !== 'none') {
                return { color: null, complex: true }
            }

            const color = parseRgbColor(style.backgroundColor)

            if (color?.alpha > 0 && color.alpha < 1) {
                return { color: null, complex: true }
            }

            if (color?.alpha === 1) {
                return { color, complex: false }
            }

            currentElement = currentElement.parentElement
        }

        return {
            color: { red: 255, green: 255, blue: 255, alpha: 1 },
            complex: false
        }
    }

    const getHighlightColors = (element, useInnerArea) => {
        const black = { red: 0, green: 0, blue: 0 }
        const yellow = { red: 255, green: 234, blue: 0 }
        const background = getAdjacentBackground(element, useInnerArea)

        if (background.complex || !background.color) {
            return {
                outline: '#ffea00',
                secondaryRing: '0 0 0 7px #000000'
            }
        }

        const blackContrast = getContrastRatio(black, background.color)
        const yellowContrast = getContrastRatio(yellow, background.color)

        return {
            outline: blackContrast >= yellowContrast
                ? '#000000'
                : '#ffea00',
            secondaryRing: ''
        }
    }

    const highlightTarget = getHighlightTarget(selectedElement)
    const useInnerArea = selectedElement.tagName === 'IMG'

    selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    })

    const isHeading = /^H[1-6]$/.test(selectedElement.tagName)
    const isNamedImage =
        selectedElement.tagName === 'IMG' &&
        Boolean(selectedElement.getAttribute('alt')?.trim())
    const needsTemporaryTabIndex =
        !selectedElement.hasAttribute('tabindex') &&
        (isHeading || isNamedImage)

    if (shouldFocus || isHeading || isNamedImage) {
        if (needsTemporaryTabIndex) {
            selectedElement.setAttribute('tabindex', '-1')
        }

        selectedElement.focus({
            preventScroll: true
        })

        if (needsTemporaryTabIndex) {
            window.setTimeout(() => {
                selectedElement.removeAttribute('tabindex')
            }, 0)
        }
    }

    window.setTimeout(() => {
        const highlightToken = `${Date.now()}-${Math.random()}`

        // Salva o estilo original somente no primeiro destaque ativo.
        if (!highlightTarget.dataset.vincHighlightToken) {
            highlightTarget.dataset.vincPreviousOutline =
                highlightTarget.style.outline

            highlightTarget.dataset.vincPreviousOutlineOffset =
                highlightTarget.style.outlineOffset

            highlightTarget.dataset.vincPreviousBoxShadow =
                highlightTarget.style.boxShadow
        }

        // O clique mais recente passa a controlar a restauração.
        highlightTarget.dataset.vincHighlightToken = highlightToken

        const highlightColors = getHighlightColors(
            highlightTarget,
            useInnerArea
        )

        highlightTarget.style.outline =
            `4px solid ${highlightColors.outline}`

        highlightTarget.style.outlineOffset =
            useInnerArea ? '-4px' : '4px'

        highlightTarget.style.boxShadow =
            highlightColors.secondaryRing

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

            highlightTarget.style.boxShadow =
                highlightTarget.dataset.vincPreviousBoxShadow || ''

            delete highlightTarget.dataset.vincHighlightToken
            delete highlightTarget.dataset.vincPreviousOutline
            delete highlightTarget.dataset.vincPreviousOutlineOffset
            delete highlightTarget.dataset.vincPreviousBoxShadow
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

const activateElementInPage = (attribute, id) => {
    const selectedElement = document.querySelector(
        `[${attribute}="${id}"]`
    )

    if (!selectedElement) {
        return { activated: false, reason: 'not-found' }
    }

    const isDisabled =
        selectedElement.disabled ||
        selectedElement.getAttribute('aria-disabled') === 'true'

    if (isDisabled) {
        return { activated: false, reason: 'disabled' }
    }

    if (typeof selectedElement.click !== 'function') {
        return { activated: false, reason: 'unsupported' }
    }

    selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    })

    selectedElement.focus({
        preventScroll: true
    })

    window.setTimeout(() => {
        selectedElement.click()
    }, 250)

    return { activated: true }
}

const activateElement = async (tabId, attribute, id) => {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        args: [attribute, id],
        func: activateElementInPage
    })

    return result
}

export const activateLink = (tabId, linkId) => {
    return activateElement(tabId, 'data-vinc-link-id', linkId)
}

export const activateButton = (tabId, buttonId) => {
    return activateElement(tabId, 'data-vinc-button-id', buttonId)
}

const updateFieldInPage = (fieldId, value) => {
    const field = document.querySelector(
        `[data-vinc-field-id="${fieldId}"]`
    )

    if (!field) {
        return { updated: false, reason: 'not-found' }
    }

    if (
        field.disabled ||
        field.getAttribute('aria-disabled') === 'true'
    ) {
        return { updated: false, reason: 'disabled' }
    }

    if (field.readOnly) {
        return { updated: false, reason: 'readonly' }
    }

    const tagName = field.tagName.toLowerCase()
    const blockedTypes = ['password', 'file', 'hidden']
    const supportedInputTypes = [
        'text',
        'search',
        'email',
        'tel',
        'url',
        'number'
    ]

    if (
        tagName === 'select' ||
        blockedTypes.includes(field.type) ||
        (
            tagName === 'input' &&
            !supportedInputTypes.includes(field.type || 'text')
        ) ||
        !['input', 'textarea'].includes(tagName)
    ) {
        return {
            updated: false,
            reason: blockedTypes.includes(field.type)
                ? 'sensitive'
                : 'unsupported'
        }
    }

    const prototype = tagName === 'textarea'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype

    const valueSetter = Object.getOwnPropertyDescriptor(
        prototype,
        'value'
    )?.set

    if (!valueSetter) {
        return { updated: false, reason: 'unsupported' }
    }

    field.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    })

    field.focus({ preventScroll: true })
    valueSetter.call(field, value)

    field.dispatchEvent(new Event('input', { bubbles: true }))
    field.dispatchEvent(new Event('change', { bubbles: true }))

    return { updated: true }
}

const updateField = async (tabId, fieldId, value) => {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        args: [fieldId, value],
        func: updateFieldInPage
    })

    return result
}

export const fillField = (tabId, fieldId, value) => {
    return updateField(tabId, fieldId, value)
}

export const clearField = (tabId, fieldId) => {
    return updateField(tabId, fieldId, '')
}

const scrollPageInPage = (direction) => {
    const distance = Math.max(window.innerHeight * 0.8, 300)

    window.scrollBy({
        top: direction === 'up' ? -distance : distance,
        behavior: 'smooth'
    })

    return true
}

export const scrollPage = async (tabId, direction) => {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        args: [direction],
        func: scrollPageInPage
    })

    return result
}
