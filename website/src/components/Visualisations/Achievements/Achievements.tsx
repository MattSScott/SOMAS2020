import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import confetti from 'canvas-confetti'
import styles from './Achievements.module.css'
import { OutputJSONType } from '../../../consts/types'
import acheivementList, { evaluateMetrics } from './AcheivementEntries'
import { numAgents } from '../utils'

type AchievementBarProps = {
  totalAgents: number
  title: string
  desc: string
  winArr: string[]
}

const IndivAchievement = ({
  totalAgents,
  title,
  desc,
  winArr,
}: AchievementBarProps) => {
  const winners =
    winArr.length === totalAgents || winArr.length === 0
      ? 'No winners :('
      : winArr.join(', ')
  function handleAchievementClick() {
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.6 },
    })
  }

  return (
    <div className={styles.achieveContainer}>
      <Container
        className={styles.innerContainer}
        onClick={handleAchievementClick}
      >
        <Row>
          <Col className={styles.leftColumn}>
            <h4 style={{ textAlign: 'left' }}>{title}</h4>
            <p style={{ textAlign: 'left' }}>{desc}</p>
          </Col>
          <Col />
          <Col className={styles.rightColumn}>
            <p style={{ textAlign: 'right' }}>{winners}</p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

const Achievements = (props: { output: OutputJSONType }) => {
  const totalAgents = numAgents(props.output)
  return (
    <div className={styles.root}>
      <p className={styles.text} style={{ marginBottom: 30 }}>
        Achievements
      </p>
      {acheivementList.map((achievement) => (
        <IndivAchievement
          totalAgents={totalAgents}
          key={achievement.title}
          title={achievement.title}
          desc={achievement.description}
          winArr={evaluateMetrics(props.output, achievement)}
        />
      ))}
    </div>
  )
}

export default Achievements
