import Tabulator from 'tabulator-tables'

Tabulator.prototype.extendModule('sort', 'sorters', {
  summaryStar(a, b) {
    const dataA =
      typeof a === 'object' && typeof a.bestStar === 'number'
        ? a
        : {
            bestStar: 0,
          }
    const dataB =
      typeof b === 'object' && typeof b.bestStar === 'number'
        ? b
        : {
            bestStar: 0,
          }

    return dataA.bestStar - dataB.bestStar
  },
  pr(a, b) {
    const dataA =
      typeof a === 'object' && typeof a.percentile === 'number'
        ? a
        : {
            percentile: -1,
          }
    const dataB =
      typeof b === 'object' && typeof b.percentile === 'number'
        ? b
        : {
            percentile: -1,
          }

    return dataA.percentile - dataB.percentile
  },
})

Tabulator.prototype.extendModule('format', 'formatters', {
  summaryStar(cell) {
    const rawData = cell.getValue()
    const data =
      typeof rawData === 'object' &&
      typeof rawData.bestStar === 'number' &&
      typeof rawData.playCount === 'number'
        ? rawData
        : {
            bestStar: 0,
            playCount: 0,
          }
    const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>`
    let stars = ''
    const starCount = Math.ceil(data.bestStar)
    for (let i = 0; i < starCount; i++) {
      stars += starSVG
    }
    return `<div class="flex flex-col">
                  <div class="text-center">${data.playCount.toFixed(
                    0
                  )} ครั้ง</div>
                  <div class="text-center text-yellow-500 h-5">${stars}</div>
                </div>`
  },
  pr(cell) {
    const rawData = cell.getValue()
    const data =
      typeof rawData === 'object' && typeof rawData.percentile === 'number'
        ? rawData
        : {
            percentile: undefined,
            color: 'transparent',
            textColor: 'black',
          }
    const element = cell.getElement()
    element.style.backgroundColor = data.color
    element.style.color = data.textColor

    if (typeof data.percentile === 'number') {
      return `<div class="flex flex-col">
                  <div class="text-center">${data.percentile.toFixed(2)}</div>
                </div>`
    } else {
      return `<div class="flex flex-col">
                  <div class="text-center">-</div>
                </div>`
    }
  },
})
