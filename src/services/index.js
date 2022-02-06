import { serviceProvider } from './serviceProvider'

export const getPortfolios = () => serviceProvider('/portfolios')

export const addServiceChain = data => serviceProvider.post('/serviceChains', data)

export const addNewPortfolio = data => serviceProvider.post('/portfolios', data)

export const addNewPlatform = data => serviceProvider.post('/platforms', data)
