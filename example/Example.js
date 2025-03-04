import { Picker } from '../src'
// import { Picker } from '../dist/vue-emoji-mart'

export default {
  components: {
    Picker
  },
  template: `
  <div class="dash">
    <Picker
      :data-url="dataUrl"
      :emoji-size="emojiSize"
      :per-line="perLine"
      :skins="skin"
      :native="native"
      :set="set"
      :auto-focus="autoFocus"
      :include="include"
      :exclude="exclude"
      :onItemClick="insertSymbol"
    />
  </div>
  `,
  data () {
    return {
      dataUrl: '../data/emoji.json',
      emojiSize: 24,
      perLine: 9,
      skin: 1,
      native: false,
      set: 'apple',
      hidden: false,
      currentEmoji: { id: '+1' },
      autoFocus: false,
      include: [],
      exclude: [],
    }
  },
  methods: {
    insertSymbol (emoji) {
      console.log(emoji)
    }
  }
}