import buildSearch from './build-search'
import store from './store'

const COLONS_REGEX = /^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/
const SKINS = [
  '1F3FA', '1F3FB', '1F3FC',
  '1F3FD', '1F3FE', '1F3FF',
]

function unifiedToNative(unified) {
  var unicodes = unified.split('-'),
      codePoints = unicodes.map((u) => `0x${u}`)

  return String.fromCodePoint(...codePoints)
}

function sanitize(emoji) {
  var { name, short_names, skin_tone, skin_variations, emoticons, unified, custom, imageUrl } = emoji,
      id = emoji.id || short_names[0],
      colons = `:${id}:`

  if (custom) {
    return {
      id,
      name,
      colons,
      emoticons,
      custom,
      imageUrl
    }
  }

  if (skin_tone) {
    colons += `:skin-tone-${skin_tone}:`
  }

  return {
    id,
    name,
    colons,
    emoticons,
    unified: unified.toLowerCase(),
    skin: skin_tone || (skin_variations ? 1 : null),
    native: unifiedToNative(unified),
  }
}

function getSanitizedData() {
  return sanitize(getData(...arguments))
}

function getData(emoji, skin, set) {
  var data = window.emojiJSON
  var emojiData = {}

  if (typeof emoji == 'string') {
    let matches = emoji.match(COLONS_REGEX)

    if (matches) {
      emoji = matches[1]

      if (matches[2]) {
        skin = parseInt(matches[2])
      }
    }

    if (data.short_names.hasOwnProperty(emoji)) {
      emoji = data.short_names[emoji]
    }

    if (data.emojis.hasOwnProperty(emoji)) {
      emojiData = data.emojis[emoji]
    }
  } else if (emoji.custom) {
    var tmp = {}

    tmp.search = buildSearch({
      short_names: emoji.short_names,
      name: emoji.name,
      keywords: emoji.keywords,
      emoticons: emoji.emoticons
    })

    tmp.search = tmp.search.join(',')
    emojiData = emoji
    emojiData.search = tmp.search
  } else if (emoji.id) {
    if (data.short_names.hasOwnProperty(emoji.id)) {
      emoji.id = data.short_names[emoji.id]
    }

    if (data.emojis.hasOwnProperty(emoji.id)) {
      emojiData = data.emojis[emoji.id]
      skin || (skin = emoji.skin)
    }
  }

  emojiData.emoticons || (emojiData.emoticons = [])
  emojiData.variations || (emojiData.variations = [])

  if (emojiData.skin_variations && skin > 1 && set) {
    emojiData = JSON.parse(JSON.stringify(emojiData))

    var skinKey = SKINS[skin - 1],
        variationData = emojiData.skin_variations[skinKey]

    if (!variationData.variations && emojiData.variations) {
      delete emojiData.variations
    }

    if (variationData[`has_img_${set}`]) {
      emojiData.skin_tone = skin

      for (let k in variationData) {
        let v = variationData[k]
        emojiData[k] = v
      }
    }
  }

  if (emojiData.variations && emojiData.variations.length) {
    emojiData = JSON.parse(JSON.stringify(emojiData))
    emojiData.unified = emojiData.variations.shift()
  }

  return emojiData
}

function intersect(a, b) {
  var aSet = new Set(a),
      bSet = new Set(b),
      intersection = null

  intersection = new Set(
    [...aSet].filter(x => bSet.has(x))
  )

  return Array.from(intersection)
}

function deepMerge(a, b) {
  var o = {}

  for (let key in a) {
    let originalValue = a[key],
        value = originalValue

    if (b.hasOwnProperty(key)) {
      value = b[key]
    }

    if (typeof value === 'object') {
      value = deepMerge(originalValue, value)
    }

    o[key] = value
  }

  return o
}

function loadEmojiData(url) {
  let version = VUE_EMOJI_MART_VERSION
  let cacheVersion = store.get('version')
  let data = store.get('data')
  if (!data || version !== cacheVersion) {
    return fetch(url)
    .then( r => r.json() )
    .then( data => {
      store.set('data', data)
      store.set('version', version)
      window.emojiJSON = data
      return data
    })
  } else {
    window.emojiJSON = data
    return new Promise((resolve, reject) => {
      resolve(data)
    })
  }
}

export { getData, getSanitizedData, intersect, deepMerge, unifiedToNative, loadEmojiData }
