import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  Icon,
  Intent,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2, Tooltip2 } from '@blueprintjs/popover2'
import { useCallback, useState } from 'react'
import { ResizableBox } from 'react-resizable'
import { useRecoilState } from 'recoil'
import { Bpmn } from '../../../../components/bpmn'
import { Table } from '../../../../components/table'
import {
  getBpmnAssociations,
  getBpmnEntities,
  getBpmnLanes,
  getBpmnSequenceFlows,
} from '../../../../services'
import { platformState } from '../../../../store/portfolios'
import styles from '../../styles.module.scss'

export const Window = ({ onClose, window }) => {
  const [isMaximize, setIsMaximize] = useState(false)
  const [bpmn, setbpmn] = useRecoilState(platformState(window.data.id))
  const [view, setView] = useState('BPMN Graph')
  const [isLoading, setIsLoading] = useState(false)
  const [associations, setAssociations] = useState([])
  const [entities, setEntities] = useState([])
  const [sequenceFlows, setSequenceFlows] = useState([])
  const [lanes, setLanes] = useState([])

  const onAssociationsClick = useCallback(async () => {
    setIsLoading(true)
    const { data } = await getBpmnAssociations()
    setAssociations(data.data)
    setView('BPMN Associations')
    setIsLoading(false)
  }, [])

  const onEntitiesClick = useCallback(async () => {
    setIsLoading(true)
    const { data } = await getBpmnEntities()
    setEntities(data.data)
    setView('BPMN Entities')
    setIsLoading(false)
  }, [])

  const onSequenceFlowsClick = useCallback(async () => {
    setIsLoading(true)
    const { data } = await getBpmnSequenceFlows()
    setSequenceFlows(data.data)
    setView('BPMN SequenceFlows')
    setIsLoading(false)
  }, [])

  const onLanesClick = useCallback(async () => {
    setIsLoading(true)
    const { data } = await getBpmnLanes()
    setLanes(data.data)
    setView('Lanes')
    setIsLoading(false)
  }, [])

  return (
    <ResizableBox
      className={isMaximize ? styles.windowContainerMax : styles.windowContainer}
      width={500}
      height={400}
      minConstraints={[300, 200]}
    >
      <Card
        className={`${styles.windowCard} `}
        style={{ width: '100%', height: '100%' }}
        elevation={Elevation.TWO}
      >
        <div className={`handle bp3-dark ${styles.windowHeader}`}>
          <div className={styles.windowHeader_title}>
            <Icon icon='document' />
            <div className='bp3-ui-text'>{window.data.fileName}</div>
          </div>
          <Popover2
            content={
              <Menu>
                <MenuItem icon='graph' text='BPMN Graph' onClick={() => setView('BPMN Graph')} />
                <MenuItem icon='th' text='BPMN Associations' onClick={onAssociationsClick} />
                <MenuItem icon='th' text='BPMN Entities' onClick={onEntitiesClick} />
                <MenuItem icon='th' text='BPMN SequenceFlows' onClick={onSequenceFlowsClick} />
                <MenuItem icon='th' text='Lanes' onClick={onLanesClick} />
              </Menu>
            }
          >
            <Button small loading={isLoading} icon='eye-open' text={view} />
          </Popover2>
          <ButtonGroup>
            <Tooltip2 content={<span>{isMaximize ? 'minimize' : 'maximize'}</span>}>
              <Button
                onClick={() => setIsMaximize(prevIsMaximize => !prevIsMaximize)}
                icon={isMaximize ? 'minimize' : 'maximize'}
                small
                intent={Intent.PRIMARY}
              />
            </Tooltip2>
            <Tooltip2 content={<span>close</span>}>
              <Button onClick={onClose} icon='cross' intent={Intent.DANGER} small />
            </Tooltip2>
          </ButtonGroup>
        </div>
        <div className={styles.windowBody}>
          {view === 'BPMN Graph' && (
            <Bpmn
              xml={bpmn.xml ?? window.data.fileData}
              onChange={data => {
                setbpmn({ xml: data })
                //  const json = converter.xml2json(data, { compact: true, spaces: 2 })
              }}
            />
          )}
          {view === 'BPMN Associations' && (
            <Table
              width={'100%'}
              height={'100%'}
              data={associations}
              columns={
                associations?.[0] ? Object.keys(associations?.[0]).map(key => ({ field: key })) : []
              }
            />
          )}
          {view === 'BPMN Entities' && (
            <Table
              width={'100%'}
              height={'100%'}
              data={entities}
              columns={entities?.[0] ? Object.keys(entities?.[0]).map(key => ({ field: key })) : []}
            />
          )}
          {view === 'BPMN SequenceFlows' && (
            <Table
              width={'100%'}
              height={'100%'}
              data={sequenceFlows}
              columns={
                sequenceFlows?.[0]
                  ? Object.keys(sequenceFlows?.[0]).map(key => ({ field: key }))
                  : []
              }
            />
          )}
          {view === 'Lanes' && (
            <Table
              width={'100%'}
              height={'100%'}
              data={lanes}
              columns={lanes?.[0] ? Object.keys(lanes?.[0]).map(key => ({ field: key })) : []}
            />
          )}
        </div>
      </Card>
    </ResizableBox>
  )
}
