import Automerge, { Text } from "automerge";
import { SimpleDiff } from '../utils/simpleDiff';

export type Doc = {
  docId: string;
  textArea: Text;
}

export const initDocument = () => {
  return Automerge.init<Doc>();
};

export const initDocumentText = (): Doc => {
  return Automerge.from({
    docId: '',
    textArea: new Text()}
  );
};

export const applyChanges = (doc: Doc, changes: any) => {
  return Automerge.applyChanges(doc, changes);
};

export const getChanges = (oldDoc: Doc, newDoc: Doc) => {
  return Automerge.getChanges(oldDoc, newDoc);
};

export const merge = (oldDoc: Doc, newDoc: Doc) => {
  return Automerge.merge(oldDoc, newDoc);
};

export const applyInput = (doc: Doc, diff: SimpleDiff) => {
  return Automerge.change(doc, (d: Doc) => {
    d.textArea.insertAt(diff.index, diff.insert);
    d.textArea.deleteAt(diff.index + 1, diff.remove);
  });
};

export const getHistory = (doc: Doc) => {
  return Automerge.getHistory(doc).map(state => [state.change.message, state.snapshot.textArea]);
};
