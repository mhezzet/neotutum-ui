import { Button, FormGroup, H5, InputGroup, Intent, Menu, MenuItem, Tree } from '@blueprintjs/core'
import { Classes, ContextMenu2, Popover2 } from '@blueprintjs/popover2'
import cloneDeep from 'lodash/cloneDeep'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil'
import { addNewPlatform, addServiceChain } from '../../../../services'
import { platformState, protfoliosState } from '../../../../store/portfolios'
import { windowsState } from '../../../../store/windows'
import { generateID } from '../../../../utils/generateID'
import { showDangerToaster, showSuccessToaster } from '../../../../utils/toaster'

export const Portfolios = () => {
  const [portfolios, setPortfolios] = useRecoilState(protfoliosState)
  const [nodes, setNodes] = useState(null)
  const [portfolioPopOver, setPortfolioPopOver] = useState(null)
  const [portfolioPopOverOpenId, setPortfolioPopOverOpenId] = useState(null)
  const [newElmentToPortfolioName, setNewElmentToPortfolioName] = useState(null)
  const [elmentToPortfolioNameError, setElmentToPortfolioNameError] = useState(null)
  const [isAddServiceLoading, setIsAddServiceLoading] = useState(false)
  const [newPlatformName, setNewPlatformName] = useState(null)
  const [newPlatformNameError, setNewPlatformNameError] = useState(null)
  const [serviceChainPopOver, setServiceChainPopOver] = useState(null)
  const [serviceChainPopOverOpenId, setServiceChainPopOverOpenId] = useState(null)
  const [currentPlatform, setCurrentPlatform] = useState(null)
  const setWindows = useSetRecoilState(windowsState)
  const [serviceContextMenu, setServiceContextMenu] = useState(null)
  const [portfolioContextMenu, setPortfolioContextMenu] = useState(null)
  const [platformContextMenu, setPlatformContextMenu] = useState(null)

  useOnClickOutsideContextMenu(() => {
    setPortfolioContextMenu(null)
    setPlatformContextMenu(null)
    setServiceContextMenu(null)
  })

  const onNodeContextMenu = useCallback((node, _, e) => {
    e.preventDefault()
    // eslint-disable-next-line default-case
    switch (node.nodeData.type) {
      case 'serviceChain':
        setServiceContextMenu(node.id)
        break
      case 'platform':
        setPlatformContextMenu(node.id)
        break
      case 'protfolio':
        setPortfolioContextMenu(node.id)
        break
    }
  }, [])

  const updatePlatform = useRecoilCallback(
    ({ set }) =>
      ({ platform, file }) => {
        set(platformState(platform.id), { xml: file })
      },
    []
  )

  const bpmnFileRef = useRef(null)

  const onImportBpmnFile = useCallback(
    async event => {
      const bpmnFile = await event.target.files[0].text()
      updatePlatform({ file: bpmnFile, platform: currentPlatform })
      setWindows([{ type: 'platform', platform: currentPlatform, id: generateID() }])
    },
    [currentPlatform, updatePlatform, setWindows]
  )

  const addElmentToPortfolio = useCallback(
    async event => {
      event.preventDefault()

      if (!newElmentToPortfolioName) {
        return setElmentToPortfolioNameError('Name is required')
      }

      if (portfolioPopOver.type !== 'New Service Chain') {
        return setPortfolioPopOverOpenId(null)
      }

      try {
        setIsAddServiceLoading(true)
        setElmentToPortfolioNameError(null)
        const { data } = await addServiceChain({
          name: newElmentToPortfolioName,
          portfolioId: portfolioPopOver.portfolio.id,
        })

        setPortfolios(prevPortfolios => ({
          ...prevPortfolios,
          data: prevPortfolios.data.map(portfolio =>
            portfolio.id === portfolioPopOver.portfolio.id
              ? {
                  ...portfolio,
                  serviceChains: portfolio.serviceChains
                    ? [data.data, ...portfolio.serviceChains]
                    : [data.data],
                }
              : portfolio
          ),
        }))

        setIsAddServiceLoading(false)

        setPortfolioPopOverOpenId(null)

        setNodes(prevNodes =>
          setNodeAttribute(prevNodes, [portfolioPopOver.portfolioIdx], 'isExpanded', true)
        )

        showSuccessToaster(`${newElmentToPortfolioName} has been successfully created`)
      } catch (error) {
        setElmentToPortfolioNameError(error.message)
        showDangerToaster(error.message)
        setIsAddServiceLoading(false)
      }
    },
    [newElmentToPortfolioName, portfolioPopOver, setPortfolios]
  )

  const addPlatform = useCallback(
    async event => {
      event.preventDefault()

      if (!newPlatformName) {
        return setNewPlatformNameError('Name is required')
      }

      try {
        setIsAddServiceLoading(true)
        setNewPlatformNameError(null)

        const { data } = await addNewPlatform({
          name: newPlatformName,
          serviceChainId: serviceChainPopOver.serviceChainId,
        })

        setPortfolios(prevPortfolios => ({
          ...prevPortfolios,
          data: prevPortfolios.data.map(portfolio => ({
            ...portfolio,
            serviceChains:
              portfolio?.serviceChains.map(serviceChain => ({
                ...serviceChain,
                platforms: serviceChain?.platforms
                  ? [data.data, ...serviceChain.platforms]
                  : [data.data],
              })) ?? [],
          })),
        }))

        setIsAddServiceLoading(false)
        setServiceChainPopOverOpenId(null)

        setNodes(prevNodes =>
          setNodeAttribute(
            prevNodes,
            [serviceChainPopOver.portfolioIdx, serviceChainPopOver.serviceChainIdx],
            'isExpanded',
            true
          )
        )

        showSuccessToaster(`${newPlatformName} has been successfully created`)
      } catch (error) {
        setNewPlatformNameError(error.message)
        showDangerToaster(error.message)
        setIsAddServiceLoading(false)
      }
    },
    [newPlatformName, serviceChainPopOver, setPortfolios]
  )

  const ServiceChainPopOverContent = useMemo(
    () => (
      <div key='text'>
        <H5>{portfolioPopOver?.type}</H5>
        <form onSubmit={addElmentToPortfolio}>
          <FormGroup
            label='Name'
            labelInfo='(required)'
            intent={elmentToPortfolioNameError ? Intent.DANGER : Intent.NONE}
            helperText={elmentToPortfolioNameError}
            labelFor='newServiceChainName'
          >
            <InputGroup
              required
              id='newServiceChainName'
              onChange={event => {
                setElmentToPortfolioNameError(false)
                setNewElmentToPortfolioName(event.target.value)
              }}
            />
          </FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
            <Button
              className={Classes.POPOVER2_DISMISS}
              disabled={isAddServiceLoading}
              style={{ marginRight: 10 }}
              onClick={() => {
                setElmentToPortfolioNameError(false)
                setPortfolioPopOverOpenId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              loading={isAddServiceLoading}
              intent={Intent.SUCCESS}
              className={Classes.POPOVER2_DISMISS}
            >
              Add
            </Button>
          </div>
        </form>
      </div>
    ),
    [portfolioPopOver, addElmentToPortfolio, elmentToPortfolioNameError, isAddServiceLoading]
  )

  const onPortfolioMenuClick = useCallback(({ portfolioId, type, portfolioIdx, portfolio }) => {
    setNewElmentToPortfolioName(null)
    setElmentToPortfolioNameError(null)
    setPortfolioPopOver({ type, portfolio, portfolioIdx })
    setPortfolioPopOverOpenId(portfolioId)
    setServiceContextMenu(null)
    setPortfolioContextMenu(null)
    setPlatformContextMenu(null)
  }, [])

  const onServiceChainMenuClick = useCallback(
    ({ serviceChain, serviceChainId, portfolioId, portfolioIdx, serviceChainIdx }) => {
      setNewPlatformName(null)
      setNewPlatformNameError(null)
      setServiceChainPopOver({
        serviceChain,
        serviceChainId,
        portfolioId,
        portfolioIdx,
        serviceChainIdx,
      })
      setServiceChainPopOverOpenId(serviceChainId)
      setServiceContextMenu(null)
      setPortfolioContextMenu(null)
      setPlatformContextMenu(null)
    },
    []
  )

  const PlatformPopOverContent = useMemo(
    () => (
      <div key='text'>
        <H5>New Platform</H5>
        <form onSubmit={addPlatform}>
          <FormGroup
            label='Name'
            labelInfo='(required)'
            intent={newPlatformNameError ? Intent.DANGER : Intent.NONE}
            helperText={newPlatformNameError}
            labelFor='newPlatformName'
          >
            <InputGroup
              required
              id='newPlatformName'
              onChange={event => {
                setNewPlatformNameError(false)
                setNewPlatformName(event.target.value)
              }}
            />
          </FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
            <Button
              className={Classes.POPOVER2_DISMISS}
              disabled={isAddServiceLoading}
              style={{ marginRight: 10 }}
              onClick={() => {
                setNewPlatformNameError(false)
                setServiceChainPopOverOpenId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              loading={isAddServiceLoading}
              intent={Intent.SUCCESS}
              className={Classes.POPOVER2_DISMISS}
            >
              Add
            </Button>
          </div>
        </form>
      </div>
    ),
    [addPlatform, isAddServiceLoading, newPlatformNameError]
  )

  useEffect(() => {
    setNodes(prevNodes =>
      portfolios.data.map((portfolio, portfolioIdx) => ({
        id: portfolio.id,
        hasCaret: portfolio?.serviceChains?.length > 0,
        icon: 'folder-close',
        isExpanded: prevNodes?.find(node => portfolio.id === node.id)?.isExpanded ?? false,
        label: (
          <Popover2
            popoverClassName={Classes.POPOVER2_CONTENT_SIZING}
            content={ServiceChainPopOverContent}
            isOpen={portfolio.id === portfolioPopOverOpenId}
          >
            <Popover2
              content={
                <Menu>
                  <MenuItem
                    textClassName='target_menu'
                    icon='plus'
                    text='New Template'
                    onClick={() =>
                      onPortfolioMenuClick({
                        portfolioId: portfolio.id,
                        type: 'New Template',
                        portfolio,
                        portfolioIdx,
                      })
                    }
                  />
                  <MenuItem
                    textClassName='target_menu'
                    icon='plus'
                    text='New Risk Assessment'
                    onClick={() =>
                      onPortfolioMenuClick({
                        portfolioId: portfolio.id,
                        type: 'New Risk Assessment',
                        portfolio,
                        portfolioIdx,
                      })
                    }
                  />
                  <MenuItem
                    textClassName='target_menu'
                    icon='plus'
                    text='New Model'
                    onClick={() =>
                      onPortfolioMenuClick({
                        portfolioId: portfolio.id,
                        type: 'New Model',
                        portfolio,
                        portfolioIdx,
                      })
                    }
                  />
                  <MenuItem
                    textClassName='target_menu'
                    icon='plus'
                    text='New Code'
                    onClick={() =>
                      onPortfolioMenuClick({
                        portfolioId: portfolio.id,
                        type: 'New Code',
                        portfolio,
                        portfolioIdx,
                      })
                    }
                  />
                  <MenuItem
                    textClassName='target_menu'
                    icon='plus'
                    text='New Service Chain'
                    onClick={() =>
                      onPortfolioMenuClick({
                        portfolioId: portfolio.id,
                        type: 'New Service Chain',
                        portfolio,
                        portfolioIdx,
                      })
                    }
                  />
                </Menu>
              }
              isOpen={portfolio.id === portfolioContextMenu}
            >
              {portfolio.name}
            </Popover2>
          </Popover2>
        ),
        nodeData: { type: 'protfolio' },
        childNodes:
          portfolio?.serviceChains?.map((serviceChain, serviceChainIdx) => ({
            id: serviceChain.id,
            hasCaret: serviceChain?.platforms?.length > 0,
            icon: 'exchange',
            isExpanded:
              prevNodes
                ?.find(node => portfolio.id === node.id)
                ?.childNodes.find(child => child.id === serviceChain.id)?.isExpanded ?? false,
            label: (
              <Popover2
                popoverClassName={Classes.POPOVER2_CONTENT_SIZING}
                content={PlatformPopOverContent}
                isOpen={serviceChain.id === serviceChainPopOverOpenId}
              >
                <Popover2
                  content={
                    <Menu>
                      <MenuItem
                        textClassName='target_menu'
                        icon='plus'
                        text='New Platform'
                        onClick={() =>
                          onServiceChainMenuClick({
                            serviceChain,
                            serviceChainId: serviceChain.id,
                            portfolioId: portfolio.id,
                            portfolioIdx,
                            serviceChainIdx,
                          })
                        }
                      />
                    </Menu>
                  }
                  isOpen={serviceChain.id === serviceContextMenu}
                >
                  {serviceChain.name}
                </Popover2>
              </Popover2>
            ),
            nodeData: { type: 'serviceChain' },
            childNodes:
              serviceChain?.platforms?.map(platform => ({
                id: platform.id,
                icon: 'document',
                label: (
                  <Popover2
                    content={
                      <Menu>
                        <MenuItem
                          textClassName='target_menu'
                          icon='upload'
                          text='Import Bpmn File'
                          onClick={() => {
                            setCurrentPlatform(platform)
                            bpmnFileRef.current.click()
                          }}
                        />
                      </Menu>
                    }
                    isOpen={platform.id === platformContextMenu}
                  >
                    <div
                      onClick={() => setWindows([{ type: 'platform', platform, id: generateID() }])}
                    >
                      {platform.name}
                    </div>
                  </Popover2>
                ),
                nodeData: { type: 'platform' },
              })) ?? [],
          })) ?? [],
      }))
    )
  }, [
    ServiceChainPopOverContent,
    portfolioPopOverOpenId,
    onPortfolioMenuClick,
    portfolios,
    serviceChainPopOverOpenId,
    onServiceChainMenuClick,
    PlatformPopOverContent,
    setWindows,
    portfolioContextMenu,
    serviceContextMenu,
    platformContextMenu,
  ])

  const onNodeClick = useCallback(
    (node, nodePath) => {
      if (node.nodeData.type !== 'platform') return

      setNodes(setNodesAttribute(nodes, 'isSelected', false))
      setNodes(setNodeAttribute(nodes, nodePath, 'isSelected', true))
    },
    [nodes]
  )

  const onNodeCollapse = useCallback(
    (_, nodePath) => setNodes(setNodeAttribute(nodes, nodePath, 'isExpanded', false)),
    [nodes]
  )

  const onNodeExpand = useCallback(
    (_, nodePath) => setNodes(setNodeAttribute(nodes, nodePath, 'isExpanded', true)),
    [nodes]
  )

  return (
    <div>
      <Tree
        contents={nodes}
        onNodeClick={onNodeClick}
        onNodeCollapse={onNodeCollapse}
        onNodeExpand={onNodeExpand}
        onNodeContextMenu={onNodeContextMenu}
      />
      <input
        style={{ display: 'none' }}
        ref={bpmnFileRef}
        type='file'
        accept='.bpmn'
        multiple={false}
        onChange={onImportBpmnFile}
      />
    </div>
  )
}

const setNodeAttribute = (nodes, nodePath, key, value) => {
  const newNodes = cloneDeep(nodes)

  const node = Tree.nodeFromPath(nodePath, newNodes)

  node[key] = value

  return newNodes
}

const setNodesAttribute = (nodes, key, value) => {
  const newNodes = cloneDeep(nodes)

  forEachNode(nodes, node => (node[key] = value))

  return newNodes
}

const forEachNode = (nodes, callback) => {
  if (nodes === undefined) {
    return
  }

  for (const node of nodes) {
    callback(node)
    forEachNode(node.childNodes, callback)
  }
}

//work around for context menu
const useOnClickOutsideContextMenu = handler => {
  useEffect(() => {
    const listener = event => {
      if (
        event.target.classList.contains('target_menu') ||
        event.target.getAttribute('data-icon') === 'plus' ||
        event.target.tagName === 'path' ||
        event.target.classList.contains('bp3-menu-item')
      )
        return

      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])
}
