/**
 * A relative position that is based on the Yjs model. In contrast to an
 * absolute position (position by index), the relative position can be
 * recomputed when remote changes are received. For example:
 *
 * ```Insert(0, 'x')('a|bc') = 'xa|bc'``` Where | is the cursor position.
 *
 * A relative cursor position can be obtained with the function
 * {@link getRelativePosition} and it can be transformed to an absolute position
 * with {@link fromRelativePosition}.
 *
 * Pro tip: Use this to implement shared cursor locations in YText or YXml!
 * The relative position is {@link encodable}, so you can send it to other
 * clients.
 *
 * @example
 * // Current cursor position is at position 10
 * let relativePosition = getRelativePosition(yText, 10)
 * // modify yText
 * yText.insert(0, 'abc')
 * yText.delete(3, 10)
 * // Compute the cursor position
 * let absolutePosition = fromRelativePosition(y, relativePosition)
 * absolutePosition.type // => yText
 * console.log('cursor location is ' + absolutePosition.offset) // => cursor location is 3
 *
 * @typedef {encodable} RelativePosition
 */

/**
 * Create a relativePosition based on a absolute position.
 *
 * @param {YType} type The base type (e.g. YText or YArray).
 * @param {Integer} offset The absolute position.
 */
export function getRelativePosition (type, offset) {
  // TODO: rename to createRelativePosition
  let t = type._start
  while (t !== null) {
    if (t._deleted === false) {
      if (t._length > offset) {
        return [t._id.user, t._id.clock + offset]
      }
      offset -= t._length
    }
    t = t._right
  }
  return ['endof', type._id.user, type._id.clock || null, type._id.name || null, type._id.type || null]
}
