import { Text } from 'yjs'

import { createMutex } from '../utils/mutex'
import simpleDiff from '../utils/simpleDiff'

// https://github.com/yjs/yjs/tree/e1ece6dc66c4319316acfcac9a81ea1a854af9d6/src/Bindings

class YBinder {
  protected text: Text;
  protected textArea: HTMLTextAreaElement;
  protected mutex: any;

  public constructor (textArea: HTMLTextAreaElement, text: Text) {
    this.text = text;
    this.textArea = textArea;
    this.mutex = createMutex()
    textArea.value = text.toString();
    textArea.addEventListener('input', this.textAreaObserver);
    text.observe(this.textObserver);
  }

  private textAreaObserver = () => {
    this.mutex(() => {
      let diff = simpleDiff(this.text.toString(), this.textArea.value);
      this.text.delete(diff.index, diff.remove);
      this.text.insert(diff.index, diff.insert);
    });
  }

  private textObserver = () => {
    this.mutex(() => {
//     const relativeStart = getRelativePosition(text, textarea.selectionStart)
//     const relativeEnd = getRelativePosition(text, textarea.selectionEnd)
      this.textArea.value = this.text.toString();
//      const start = fromRelativePosition(text._y, relativeStart)
//      const end = fromRelativePosition(text._y, relativeEnd)
//      textarea.setSelectionRange(start, end)
    });
  }
  
  public destroy () {
    this.text = null;
    this.textArea = null;
  }

}

export default YBinder;
