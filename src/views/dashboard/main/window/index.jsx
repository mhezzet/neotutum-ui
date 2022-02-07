import { Button, ButtonGroup, Card, Elevation, Icon, Intent } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'
import { useState } from 'react'
import { ResizableBox } from 'react-resizable'
import { useRecoilState } from 'recoil'
import { Bpmn } from '../../../../components/bpmn'
import { EMPTY_BPMN } from '../../../../constants'
import { platformState } from '../../../../store/portfolios'
import styles from '../../styles.module.scss'

export const Window = ({ onClose, window }) => {
  const [isMaximize, setIsMaximize] = useState(false)
  const [platform, setPlatform] = useRecoilState(platformState(window.data.id))

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
            <div className='bp3-ui-text'>{window.data.name}</div>
          </div>
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
          <Bpmn
            xml={platform.xml ?? EMPTY_BPMN}
            onChange={data => {
              setPlatform({ xml: data })
              //  const json = converter.xml2json(data, { compact: true, spaces: 2 })
            }}
          />
        </div>
      </Card>
    </ResizableBox>
  )
}
