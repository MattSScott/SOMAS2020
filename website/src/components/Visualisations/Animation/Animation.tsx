import React, { useState } from 'react'
import Sketch from 'react-p5'
import p5Types from 'p5'
import { Button } from 'react-bootstrap'
import { Transaction, OutputJSONType } from '../../../consts/types'
import * as AnimFuncs from './Util/AnimFuncs'

const Animations = (props: { output: OutputJSONType }) => {
  const [running, setRunning] = useState(true)

  const totalTurns = props.output.GameStates.length
  let day: number
  let allTrades: Transaction[][]
  let islands: AnimFuncs.Island[]

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(1000, 1000).parent(canvasParentRef)
    p5.frameRate(5)
    allTrades = AnimFuncs.processTrades(props.output)
    islands = AnimFuncs.getGeography(props.output, 0, p5.width)
    day = 1
  }

  const draw = (p5: p5Types) => {
    if (running) {
      p5.background(255)
      p5.textSize(60)
      p5.fill(0)
      p5.text(`Day ${day}`, 100, 50)
      AnimFuncs.drawTrade(allTrades, day - 1, p5, islands)
      AnimFuncs.drawIslands(props.output, day - 1, p5, islands)
      AnimFuncs.drawIslandDeaths(props.output, day - 1, islands, p5)
      AnimFuncs.drawDisaster(props.output, day, p5)
      if (p5.frameCount % 10 === 0) {
        day++
      }
      if (day === totalTurns) {
        day = 1
      }
    }
  }

  return (
    <div
      style={{
        border: 'black',
        borderWidth: '2px',
        textAlign: 'center',
      }}
    >
      <h2>Full Animation of Game</h2>
      <Button variant="warning" onClick={() => setRunning(!running)}>
        <label htmlFor="multi" style={{ margin: 0 }}>
          Pause Animation
        </label>
      </Button>
      <Sketch setup={setup} draw={draw} />
    </div>
  )
}

export default Animations
