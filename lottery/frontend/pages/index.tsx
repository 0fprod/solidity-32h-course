import { EnterLottery } from '../src/components/EnterLottery'
import { Header } from '../src/components/Header'
import { ManualHeader } from '../src/components/ManualHeader'
import { Participants } from '../src/components/Participants'
import styles from '../styles/Home.module.css'

export default function Home() {

  return (
    <div className={styles.container}>
      <h1> Lottery Frontend </h1>
      {/* <ManualHeader/> */}
      <Header/>
      <EnterLottery/>
      Participants <br></br>
      <Participants/>
    </div>
  )
}
