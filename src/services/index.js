import { xmlFormatter } from '../utils/xmlFormater'
import { xmlParser } from '../utils/xmlParser'
import { serviceProvider } from './serviceProvider'

export const getPortfolios = () => serviceProvider('/portfolios')

export const addServiceChain = data => serviceProvider.post('/serviceChains', data)

export const addNewPortfolio = data => serviceProvider.post('/portfolios', data)

export const addNewPlatform = data => serviceProvider.post('/platforms', data)

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
  return serviceProvider('/bpmnFile', {
    method: 'post',
    data: {
      fileName,
      platformId,
      fileData: file,
      creatorId,
      bpmnAssociations: bpmnAssociations,
      bpmnSequenceFlows: bpmnSequenceFlows,
      bpmnEntities: bpmnEntities,
      bpmnLanes: bpmnLanes,
    },
  })
}

export const getBpmnEntities = data => serviceProvider.get('bpmnEntities')
export const getBpmnAssociations = data => serviceProvider.get('bpmnEntities')
export const getBpmnSequenceFlows = data => serviceProvider.get('bpmnSequenceFlows')
export const getBpmnLanes = data => serviceProvider.get('bpmnLanes')

export const archiveBpmn = ({ id }) => serviceProvider.delete(`/bpmnFile/${id}`)

export const updateBpmnStatus = ({ id, status, fileData }) =>
  serviceProvider.put(`/bpmnFile/${id}`, {
    status: status,
    ...(status === 'changed' && { fileData, ...xmlParser(fileData) }),
  })
