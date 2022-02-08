import { useCallback } from 'react'
import { useRecoilState } from 'recoil'
import { Async } from '../../../components/asyncHOC'
import { windowsState } from '../../../store/windows'
import styles from '../styles.module.scss'
import { Window } from './window'
export const Main = () => {
  const [windows, setWindows] = useRecoilState(windowsState)

  const windowCloseHandler = useCallback(
    id => setWindows(prevWindows => prevWindows.filter(window => window.id !== id)),
    [setWindows]
  )

  return (
    <div className={styles.mainContainer}>
      <Async>
        {windows.map(window => (
          <Window key={window.id} window={window} onClose={() => windowCloseHandler(window.id)} />
        ))}
      </Async>
    </div>
  )
}
