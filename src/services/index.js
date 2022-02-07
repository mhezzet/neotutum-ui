import { serviceProvider } from './serviceProvider'

export const getPortfolios = () => serviceProvider('/portfolios')

export const addServiceChain = data => serviceProvider.post('/serviceChains', data)

export const addNewPortfolio = data => serviceProvider.post('/portfolios', data)

export const addNewPlatform = data => serviceProvider.post('/platforms', data)

const xmlFormatter = data => {
  let formBody = []
  for (let property in data) {
    var encodedKey = encodeURIComponent(property)
    var encodedValue = encodeURIComponent(data[property])
    formBody.push(encodedKey + '=' + encodedValue)
  }
  formBody = formBody.join('&')
  return formBody
}

export const addNewBpmn = ({
  file,
  platformId,
  creatorId,
  fileName,
  bpmnAssociations = [],
  bpmnSequenceFlows = [],
  bpmnEntities = [],
  bpmnLanes = [],
}) => {
  // const form = new FormData()
  // form.append('fileData', file)
  // form.append('fileName', fileName)
  // form.append('platformId', platformId)
  // form.append('creatorId', creatorId)
  // form.append('bpmnAssociations', bpmnAssociations)
  // form.append('bpmnSequenceFlows', bpmnSequenceFlows)
  // form.append('bpmnEntities', bpmnEntities)
  // form.append('bpmnLanes', bpmnLanes)

  const form = xmlFormatter({
    fileName,
    platformId,
    fileData: file,
    creatorId,
    bpmnAssociations: [],
    bpmnSequenceFlows: [],
    bpmnEntities: [],
    bpmnLanes: [],
  })

  return serviceProvider('/bpmnFile', {
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
