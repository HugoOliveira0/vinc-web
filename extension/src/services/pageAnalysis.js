export const collectPageData = () => {
    const maxItemsPerCategory = 100

    const allHeadings = [
        ...document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ]

    const isVisible = (element) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()

        const isVisuallyClipped =
            (
                style.clip !== 'auto' ||
                style.clipPath !== 'none'
            ) &&
            rect.width <= 1 &&
            rect.height <= 1

        return (
            !element.hidden &&
            !element.closest('[hidden], [aria-hidden="true"]') &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            Number(style.opacity) !== 0 &&
            rect.width > 0 &&
            rect.height > 0 &&
            !isVisuallyClipped
        )
    }

    const normalizeText = (text) => {
        return (text || '').replace(/\s+/g, ' ').trim()
    }

    const getElementText = (element) => {
        return normalizeText(element.innerText || element.textContent)
    }

    const getReferencedText = (element, attribute) => {
        return normalizeText(
            (element.getAttribute(attribute) || '')
                .split(/\s+/)
                .filter(Boolean)
                .map((id) => document.getElementById(id)?.textContent || '')
                .join(' ')
        )
    }

    const getEmbeddedGraphicText = (element) => {
        const imageText = [...element.querySelectorAll('img[alt]')]
            .map((image) => image.getAttribute('alt'))
            .map(normalizeText)
            .filter(Boolean)
            .join(' ')

        const svgTitle = [...element.querySelectorAll('svg title')]
            .map((title) => getElementText(title))
            .filter(Boolean)
            .join(' ')

        return normalizeText(`${imageText} ${svgTitle}`)
    }

    allHeadings.forEach((heading) => {
        heading.removeAttribute('data-vinc-heading-id')
    })

    const headingElements = allHeadings.filter((heading) => {
        return isVisible(heading) && getElementText(heading)
    })

    headingElements.forEach((heading, index) => {
        heading.dataset.vincHeadingId = `vinc-heading-${index}`
    })

    const allLinks = [
        ...document.querySelectorAll('a[href]')
    ]

    allLinks.forEach((link) => {
        link.removeAttribute('data-vinc-link-id')
    })

    const getLinkAccessibleName = (link) => {
        return (
            getReferencedText(link, 'aria-labelledby') ||
            link.getAttribute('aria-label')?.trim() ||
            getElementText(link) ||
            getEmbeddedGraphicText(link) ||
            link.getAttribute('title')?.trim() ||
            ''
        )
    }

    const getLinkText = (link) => {
        return getLinkAccessibleName(link) || 'Link sem descrição'
    }

    const getLinkDestinationLabel = (link) => {
        const currentLabel = getLinkAccessibleName(link)
        const title = normalizeText(link.getAttribute('title'))

        if (title && title !== currentLabel) {
            return title
        }

        const href = link.getAttribute('href') || ''

        if (href.startsWith('#')) {
            const target = document.getElementById(
                decodeURIComponent(href.slice(1))
            )
            const targetText = target ? getElementText(target) : ''

            if (targetText && targetText !== currentLabel) {
                return targetText
            }
        }

        try {
            const url = new URL(link.href, document.baseURI)
            const pathPart = decodeURIComponent(
                url.pathname.split('/').filter(Boolean).at(-1) || ''
            )
                .replace(/[-_]+/g, ' ')
                .trim()

            return pathPart && pathPart !== currentLabel ? pathPart : ''
        } catch {
            return ''
        }
    }

    const getLinkContext = (link) => {
        const container = link.closest(
            'li, td, th, figcaption, figure, article, section, nav'
        )
        const context = container ? getElementText(container) : ''

        if (!context || context === getLinkAccessibleName(link)) {
            return ''
        }

        return context.slice(0, 240)
    }

    const getLinkSection = (link) => {
        const previousHeadings = headingElements.filter((heading) => {
            return Boolean(
                heading.compareDocumentPosition(link) &
                Node.DOCUMENT_POSITION_FOLLOWING
            )
        })

        return previousHeadings.length > 0
            ? getElementText(previousHeadings.at(-1)).slice(0, 160)
            : ''
    }

    const linkElements = allLinks.filter((link) => {
        return isVisible(link) && getLinkText(link)
    })

    linkElements.forEach((link, index) => {
        link.dataset.vincLinkId = `vinc-link-${index}`
    })

    const allButtons = [
        ...document.querySelectorAll(
            'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]'
        )
    ]

    allButtons.forEach((button) => {
        button.removeAttribute('data-vinc-button-id')
    })

    const getButtonAccessibleName = (button) => {
        return (
            getReferencedText(button, 'aria-labelledby') ||
            button.getAttribute('aria-label')?.trim() ||
            getElementText(button) ||
            getEmbeddedGraphicText(button) ||
            button.value?.trim() ||
            button.getAttribute('title')?.trim() ||
            ''
        )
    }

    const getButtonText = (button) => {
        return getButtonAccessibleName(button) || 'Botão sem descrição'
    }

    const buttonElements = allButtons.filter((button) => {
        return isVisible(button)
    })

    buttonElements.forEach((button, index) => {
        button.dataset.vincButtonId = `vinc-button-${index}`
    })

    const allFields = [
        ...document.querySelectorAll(
            'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]), textarea, select'
        )
    ]

    allFields.forEach((field) => {
        field.removeAttribute('data-vinc-field-id')
    })

    const getFieldAccessibleLabel = (field) => {
        const labelText = [...(field.labels || [])]
            .map((label) => getElementText(label))
            .filter(Boolean)
            .join(' ')

        const labelledByText = getReferencedText(
            field,
            'aria-labelledby'
        )

        return (
            labelledByText ||
            field.getAttribute('aria-label')?.trim() ||
            labelText ||
            ''
        )
    }

    const getFieldLabel = (field) => {
        return (
            getFieldAccessibleLabel(field) ||
            field.getAttribute('placeholder')?.trim() ||
            field.getAttribute('name')?.trim() ||
            'Campo sem descrição'
        )
    }

    const getFieldType = (field) => {
        const tagName = field.tagName.toLowerCase()

        if (tagName === 'select' || tagName === 'textarea') {
            return tagName
        }

        return field.type || 'text'
    }

    const fieldElements = allFields.filter((field) => {
        return isVisible(field)
    })

    fieldElements.forEach((field, index) => {
        field.dataset.vincFieldId = `vinc-field-${index}`
    })


    const allImages = [
        ...document.querySelectorAll('img')
    ]

    allImages.forEach((image) => {
        image.removeAttribute('data-vinc-image-id')
    })

    const imageElements = allImages.filter((image) => {
        return isVisible(image)
    })

    imageElements.forEach((image, index) => {
        image.dataset.vincImageId = `vinc-image-${index}`
    })

    const getImageDescription = (image) => {
        const alt = image.getAttribute('alt')?.trim()

        if (alt) {
            return alt
        }

        if (image.hasAttribute('alt')) {
            return 'Imagem decorativa'
        }

        return 'Imagem sem descrição'
    }


    return {
        title: document.title,
        language: document.documentElement.lang?.trim() || '',

        headings: headingElements.length,

        headingItems: headingElements
            .slice(0, maxItemsPerCategory)
            .map((heading) => ({
                id: heading.dataset.vincHeadingId,
                level: heading.tagName.toLowerCase(),
                text: getElementText(heading)
            })),

        links: linkElements.length,

        linkItems: linkElements
            .slice(0, maxItemsPerCategory)
            .map((link) => ({
                id: link.dataset.vincLinkId,
                text: getLinkText(link),
                url: link.href,
                domain: (() => {
                    try {
                        return new URL(link.href, document.baseURI).hostname
                    } catch {
                        return ''
                    }
                })(),
                destinationLabel: getLinkDestinationLabel(link),
                context: getLinkContext(link),
                section: getLinkSection(link),
                hasAccessibleName: Boolean(getLinkAccessibleName(link))
            })),

        buttons: buttonElements.length,

        buttonItems: buttonElements
            .slice(0, maxItemsPerCategory)
            .map((button) => ({
                id: button.dataset.vincButtonId,
                text: getButtonText(button),
                hasAccessibleName: Boolean(getButtonAccessibleName(button))
            })),

        fields: fieldElements.length,

        fieldItems: fieldElements
            .slice(0, maxItemsPerCategory)
            .map((field) => ({
                id: field.dataset.vincFieldId,
                label: getFieldLabel(field),
                type: getFieldType(field),
                hasAccessibleLabel: Boolean(getFieldAccessibleLabel(field)),
                required: field.required,
                disabled: field.disabled
            })),

        images: imageElements.length,

        imageItems: imageElements
            .slice(0, maxItemsPerCategory)
            .map((image) => ({
                id: image.dataset.vincImageId,
                description: getImageDescription(image),
                hasAlt: image.hasAttribute('alt'),
                decorative:
                    image.hasAttribute('alt') &&
                    !image.getAttribute('alt')?.trim(),
                width: image.naturalWidth || Math.round(
                    image.getBoundingClientRect().width
                ),
                height: image.naturalHeight || Math.round(
                    image.getBoundingClientRect().height
                )
            }))
    }
}

export const analyzePage = async (tabId) => {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: collectPageData
    })

    return result
}
