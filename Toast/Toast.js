const DEFAULT_OPTIONS = {
    autoClose: 5000,
    position: 'top-right',
    onClose: () => { },
    canClose: true,
    showProgress: true
}

export default class Toast {
    #toastElem
    #autoCloseTimeout
    #removeBinded
    #progressInterval
    #visibleSince
    #autoClose
    constructor(options) {
        this.#toastElem = document.createElement('div')
        this.#toastElem.classList.add("toast")
        this.#visibleSince = new Date()
        requestAnimationFrame(() => {
            this.#toastElem.classList.add("show")
        })
        this.#removeBinded = this.remove.bind(this)
        Object.entries({ ...DEFAULT_OPTIONS, ...options }).forEach(([key, value]) => {
            this[key] = value;
        })
    }

    /**
     * @param {any} value
     */
    set position(value) {
        const currentContainer = this.#toastElem.parentElement
        const selector = `.toast-container[data-position="${value}"]`
        const container = document.querySelector(selector) || createContainer(value)
        container.append(this.#toastElem)
        if (currentContainer == null || currentContainer.hasChildNodes()) return
        currentContainer.remove()
    }

    /**
     * @param {any} value
     */
    set text(value) {
        this.#toastElem.innerHTML = value
    }


    /**
     * @param {boolean} value
     */
    set canClose(value) {
        this.#toastElem.classList.toggle('can-close', value)
        if (value) {
            this.#toastElem.addEventListener("click", this.#removeBinded)
        } else {
            this.#toastElem.removeEventListener("click", this.#removeBinded)
        }
    }

    /**
     * @param {number | boolean} value
     */
    set autoClose(value) {
        this.#autoClose = value
        if (value === false) return
        if (this.#autoCloseTimeout != null) clearTimeout(this.#autoCloseTimeout)
        this.#autoCloseTimeout = setTimeout(() => this.remove(), value)
    }

    /**
     * @param {boolean} value
     */
    set showProgress(value) {
        this.#toastElem.classList.toggle("progress", value)
        this.#toastElem.style.setProperty("--progress", 1)
        if (value) {
            this.#progressInterval = setInterval(() => {
                const timeVisible = new Date() - this.#visibleSince
                this.#toastElem.style.setProperty("--progress",
                    1 - timeVisible / this.#autoClose)
            }, 10)
        }
    }

    show() { }

    update(options) {
        Object.entries(options).forEach(([key, value]) => {
            this[key] = value;
        })
    }

    remove() {
        clearInterval(this.#progressInterval)
        clearTimeout(this.#autoCloseTimeout)
        const container = this.#toastElem.parentElement
        this.#toastElem.classList.remove("show")
        this.#toastElem.addEventListener("transitionend", () => {
            this.#toastElem.remove()
            if (container.hasChildNodes()) return
            container.remove()
        })
        this.onClose()
    }

}

function createContainer(position) {
    const container = document.createElement('div')
    container.classList.add('toast-container')
    container.setAttribute('data-position', position)
    document.body.append(container)
    return container
}