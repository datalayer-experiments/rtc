import Binding from '../utils/Binding'
import simpleDiff from '../utils/simpleDiff'

// https://github.com/yjs/yjs/tree/e1ece6dc66c4319316acfcac9a81ea1a854af9d6/src/Bindings

class YTextAreaBinding extends Binding {
  private _typeObserver: any;
  private _domObserver: any;

  private typeObserver () {
    this._mutualExclude(() => {
      const textarea = this.target
      const textType = this.type
//      const relativeStart = getRelativePosition(textType, textarea.selectionStart)
//     const relativeEnd = getRelativePosition(textType, textarea.selectionEnd)
      textarea.value = textType.toString()
//      const start = fromRelativePosition(textType._y, relativeStart)
//      const end = fromRelativePosition(textType._y, relativeEnd)
//      textarea.setSelectionRange(start, end)
    })
  }
  
  private domObserver () {
    this._mutualExclude(() => {
      let diff = simpleDiff(this.type.toString(), this.target.value);
      console.log(diff);
      this.type.delete(diff.pos, diff.remove);
      this.type.insert(diff.pos, diff.insert);
    })
  }

  constructor (textType, textArea) {
    // Binding handles textType as this.type and domTextarea as this.target
    super(textType, textArea)
    // set initial value
    textArea.value = textType.toString()
    // Observers are handled by this class
    this._typeObserver = this.typeObserver.bind(this)
    this._domObserver = this.domObserver.bind(this)
    textType.observe(this._typeObserver)
    textArea.addEventListener('input', this._domObserver)
  }

  destroy () {
    // Remove everything that is handled by this class
    this.type.unobserve(this._typeObserver)
    this.target.unobserve(this._domObserver)
    this.destroy()
  }
}

export default YTextAreaBinding;
