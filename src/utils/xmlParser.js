import XMLParser from 'react-xml-parser'

export const arrayFilter = (jsonArray, filter) => {
  const filtered = jsonArray.filter(jsonItem => {
    return jsonItem.name.toLowerCase().includes(filter)
  })
  return filtered
}

export const xmlParser = content => {
  const BPMNJson = new XMLParser().parseFromString(content)
  const processArray = arrayFilter(BPMNJson.children, 'process')
  let fullObject = {
    bpmnAssociations: [],
    bpmnEntities: [],
    bpmnSequenceFlows: [],
    bpmnLanes: [],
  }

  processArray.forEach(process => {
    fullObject.bpmnSequenceFlows.push(arrayFilter(process.children, 'sequenceflow'))
    fullObject.bpmnLanes.push(arrayFilter(process.children, 'lanes'))
    fullObject.bpmnAssociations.push(arrayFilter(process.children, 'associations'))
    fullObject.bpmnEntities.push(arrayFilter(process.children, 'tasks'))
    fullObject.bpmnEntities.push(arrayFilter(process.children, 'event'))
    fullObject.bpmnEntities.push(arrayFilter(process.children, 'dataobject'))
    fullObject.bpmnEntities.push(arrayFilter(process.children, 'textannotation'))
  })

  // for (const key in fullObject) {
  //   fullObject[key] = fullObject[key].flat()
  // }

  for (const [key, value] of Object.entries(fullObject)) {
    fullObject[key] = value.length > 0 ? value.flat() : []
  }

  // fullObject = Object.entries(fullObject).map(([key, value]) => ({ [key]: value.flat() }))

  return fullObject
}
