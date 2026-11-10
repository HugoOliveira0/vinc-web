const collectPageData = () => {
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

    allHeadings.forEach((heading) => {
        heading.removeAttribute('data-vinc-heading-id')
    })

    const headingElements = allHeadings.filter((heading) => {
        return isVisible(heading) && heading.innerText.trim()
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

    const getLinkText = (link) => {
        return (
            link.innerText.trim() ||
            link.getAttribute('aria-label')?.trim() ||
            link.getAttribute('title')?.trim() ||
            'Link sem descrição'
        )
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

    const getButtonText = (button) => {
        return (
            button.innerText?.trim() ||
            button.getAttribute('aria-label')?.trim() ||
            button.getAttribute('title')?.trim() ||
            button.value?.trim() ||
            'Botão sem descrição'
        )
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

    const getFieldLabel = (field) => {
        const labelText = [...(field.labels || [])]
            .map((label) => label.innerText.trim())
            .filter(Boolean)
            .join(' ')

        const labelledByText = (field.getAttribute('aria-labelledby') || '')
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.innerText.trim())
            .filter(Boolean)
            .join(' ')

        return (
            labelText ||
            field.getAttribute('aria-label')?.trim() ||
            labelledByText ||
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

        headings: headingElements.length,

        headingItems: headingElements
            .slice(0, maxItemsPerCategory)
            .map((heading) => ({
                id: heading.dataset.vincHeadingId,
                level: heading.tagName.toLowerCase(),
                text: heading.innerText.trim()
            })),

        links: linkElements.length,

        linkItems: linkElements
            .slice(0, maxItemsPerCategory)
            .map((link) => ({
                id: link.dataset.vincLinkId,
                text: getLinkText(link),
                url: link.href
            })),

        buttons: buttonElements.length,

        buttonItems: buttonElements
            .slice(0, maxItemsPerCategory)
            .map((button) => ({
                id: button.dataset.vincButtonId,
                text: getButtonText(button)
            })),

        fields: fieldElements.length,

        fieldItems: fieldElements
            .slice(0, maxItemsPerCategory)
            .map((field) => ({
                id: field.dataset.vincFieldId,
                label: getFieldLabel(field),
                type: getFieldType(field),
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
                width: image.naturalWidth,
                height: image.naturalHeight
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
