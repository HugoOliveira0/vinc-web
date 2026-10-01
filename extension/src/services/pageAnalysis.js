const collectPageData = () => {
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

    return {
        title: document.title,

        headings: headingElements.length,

        headingItems: headingElements
            .slice(0, 20)
            .map((heading) => ({
                id: heading.dataset.vincHeadingId,
                level: heading.tagName.toLowerCase(),
                text: heading.innerText.trim()
            })),

        links: linkElements.length,

        linkItems: linkElements
            .slice(0, 20)
            .map((link) => ({
                id: link.dataset.vincLinkId,
                text: getLinkText(link),
                url: link.href
            })),

        buttons: document.querySelectorAll(
            'button, [role="button"]'
        ).length,

        fields: document.querySelectorAll(
            'input, textarea, select'
        ).length,

        images: document.querySelectorAll('img').length
    }
}

export const analyzePage = async (tabId) => {
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: collectPageData
    })

    return result
}