import * as Automerge from "automerge";
import { Text, FreezeObject } from "automerge";

import { SimpleDiff } from '../utils/simpleDiff'

type Doc = {
  docId: string;
  text: Automerge.Text;
}
// type Doc = FreezeObject< { text: Text; } >
// type Doc = any

/*
 * This function is used as the way to initialize
 * the Automerge document. This function returns an
 * empty document.
 */
export const initDocument = () => {
  return Automerge.init<Doc>();
};

export const initDocumentText = (): Doc => {
  return Automerge.from({
    docId: '',
    text: new Text()}
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
    d.text.insertAt(diff.pos, diff.insert);
  });
};
