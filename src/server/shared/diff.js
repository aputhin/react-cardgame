import _ from 'lodash'

export const IS_UNCHANGED = Symbol('is unchanged')

export function makeDiff(before, after, location = '') {
  if (_.isArray(after))
    return makeDiffArray(before, after, location)
  if (_.isObject(after)) 
    return makeDiffObject(before, after, location)
  else
    return makeDiffScalar(before, after)
}

export function makeDiffArray(before, after, location = '') {
  if (before != null && !_.isArray(before))
    throw new Error(`${location} you can't change the type of a value`)
  
  if (before == null) 
    return after

  if (after.length == 0) 
    return (before && before.length)
      ? {$splice: [0, before.length]}
      : IS_UNCHANGED

  if (!after[0].hasOwnProperty('id')) {
    let spliceBegin = -1
    let spliceAdd = []
    for (let i = 0; i < after.length; i++) {
      const item = after[i]
      if (i >= before.length) {
        if (spliceBegin == -1)
          spliceBegin = i

        spliceAdd.push(item)
        continue
      }

      if (spliceBegin != -1) {
        spliceAdd.push(item)
        continue
      }

      const result = makeDiff(before[i], item, `${location}[${i}]`)
      if (result != IS_UNCHANGED) {
        if (spliceBegin == -1)
          spliceBegin = i
        
        spliceAdd.push(item)
      }
    }

    let spliceCount = before.length - spliceBegin
    if (spliceBegin == -1 && after.length < before.length) {
      spliceBegin = after.length
      spliceCount = before.length - after.length
    }

    return spliceBegin == -1
      ? IS_UNCHANGED
      : {$splice: [spliceBegin, spliceCount, ...spliceAdd]}
  }

  let itemsBefore = before == null
    ? {}
    : before.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {})
  
  const idOrder = []
  const mutatedItems = {}
  let mutatedCount = 0
  let sameCount = 0
  for (let i = 0; i < after.length; i++) {
    let itemAfter = after[i]
    idOrder.push(itemAfter.id)

    if (before != null && i < before.length && before[i].id == itemAfter.id)
      sameCount++

    let itemBefore = itemsBefore[itemAfter.id]
    const result = makeDiff(itemBefore, itemAfter, `${location}[${i}]`)

    if (result == IS_UNCHANGED)
      continue

    delete result.id
    mutatedItems[itemAfter.id] = result
    mutatedCount++
  }

  if (sameCount == after.length && mutatedCount == 0 && before.length == after.length)
    return IS_UNCHANGED
  
  return sameCount == after.length && before.length == after.length
    ? {$update: mutatedItems}
    : {$update: mutatedItems, ids: idOrder}
}

export function makeDiffObject(before, after, location = '') {
  if (before != null && !_.isObject(before))
    throw new Error(`${location} you can't change the type of a value`)

  const seen = {}
  let obj = {}
  let changed = null
  for (let key in after) {
    if (!after.hasOwnProperty(key))
      continue

    seen[key] = true
    const value = after[key]
    if (before == null || !before.hasOwnProperty(key)) {
      obj[key] = value
      changed = true
    } else {
      const result = makeDiff(before[key], value, `${location}.${key}`)
      if (result != IS_UNCHANGED) {
        obj[key] = result
        changed = true
      }
    }
  }

  if (before != null) {
    for (let key in before) {
      if (!before.hasOwnProperty(key) || seen[key])
        continue

      changed = true
      obj[key] = {$remove: true}
    }
  }

  return changed ? obj : IS_UNCHANGED
  
  return IS_UNCHANGED
}

export function makeDiffScalar(before, after) {
  return before !== after ? after : IS_UNCHANGED
}

export function mergeDiff(base, diff, location = '') {
  return base
}
