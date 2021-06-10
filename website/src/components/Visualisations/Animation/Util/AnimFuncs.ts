import Sketch from 'react-p5'
import p5Types from 'p5'
import { Transaction, OutputJSONType } from '../../../../consts/types'
import { numAgents, generateColours, TeamNameGen } from '../../utils'
import processTransactionData, {
    getIITOTransactions,
} from '../../Transactions/Util/ProcessTransactionData'

export type Island = {
    ID: number
    X: number
    Y: number
}

export const getGeography = (
    data: OutputJSONType,
    boundLeft: number,
    boundRight: number
) => {
    const n = numAgents(data)
    const maxRad = (boundRight - boundLeft) / 2
    const circIncrement: number = (2 * Math.PI) / n

    const islands: Island[] = []

    let count = 1

    islands.push({ ID: 0, X: maxRad, Y: maxRad })

    for (let i = 0; i < 2 * Math.PI - 0.1; i += circIncrement) {
        islands.push({
            ID: count,
            X: maxRad * Math.cos(i) * 0.75 + maxRad,
            Y: maxRad * Math.sin(i) * 0.75 + maxRad,
        })
        count++
    }
    return islands
}

export const drawIslands = (p5: p5Types, islands: Island[]) => {
    islands.map((isle) => {
        p5.fill(0)
        p5.textSize(32)
        p5.rectMode(p5.CORNER)
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.noStroke()
        p5.ellipse(isle.X, isle.Y, 150)
        p5.fill(255)
        return p5.text(
            isle.ID === 0 ? 'CPOR' : isle.ID,
            isle.X - 10,
            isle.Y,
            32
        )
    })
}

function drawCross(x: number, y: number, p5: p5Types) {
    p5.fill(255, 0, 0)
    p5.rectMode(p5.CENTER)
    p5.push()
    p5.translate(x, y)
    p5.rotate(p5.PI / 4)
    p5.rect(0, 0, 100, 40)
    p5.rotate(p5.PI / 2)
    p5.rect(0, 0, 100, 40)
    p5.pop()
}

export const drawIslandDeaths = (
    data: OutputJSONType,
    day: number,
    locations: Island[],
    p5: p5Types
) => {
    const teamStates = data.GameStates[day].ClientInfos
    const dead = Object.entries(teamStates)
        .filter((team: any) => team[1].LifeStatus === 'Dead')
        .map((team) => {
            const id: number = parseInt(team[0].substring('Team'.length), 10)
            const posX = locations[id].X
            const posY = locations[id].Y
            return drawCross(posX, posY, p5)
        })
}

export const drawDisaster = (
    data: OutputJSONType,
    currTurn: number,
    p5: p5Types
) => {
    const days = data.GameStates
    const xMax = data.Config.DisasterConfig.XMax
    const yMax = data.Config.DisasterConfig.YMax
    const xScl = p5.width / xMax
    const yScl = p5.width / yMax
    if (days[currTurn].Environment.LastDisasterReport.Magnitude > 0) {
        const mag = days[currTurn].Environment.LastDisasterReport.Magnitude
        const x = days[currTurn].Environment.LastDisasterReport.X
        const y = days[currTurn].Environment.LastDisasterReport.Y

        p5.fill(255, 0, 0)
        p5.noStroke()
        p5.ellipse(x * xScl, y * yScl, p5.map(mag, 2, 30, 100, 300))
    }
}

export const getIITOTrades = (data: OutputJSONType) => {
    const totalAgents = numAgents(data)

    const TeamName: Record<string, number> = TeamNameGen(totalAgents)

    return data.GameStates.map((turnState) => {
        // Guard to prevent crashing on the first turn where it's undefined
        if (turnState.IITOTransactions) {
            // map over the IITO transactions in this turn
            return [
                Object.entries(turnState.IITOTransactions)
                    .map(
                        // map over each giftResponseDict for this team's offers
                        ([toTeam, giftResponseDict]) => {
                            const transactionsForThisIsland: Transaction[] = []
                            // iterate over the giftResponseDict and push Transactions to an accumulator
                            Object.entries(giftResponseDict).forEach(
                                ([fromTeam, response]) => {
                                    if (response) {
                                        transactionsForThisIsland.push({
                                            from: TeamName[fromTeam],
                                            to: TeamName[toTeam],
                                            amount: response.AcceptedAmount,
                                        })
                                    }
                                }
                            )
                            return transactionsForThisIsland
                        }
                    )
                    // fold the island transaction lists together for this turn
                    .reduce((acc, nextLst) => acc.concat(nextLst), []),
            ]
        }

        return []
        // fold all turns together once more to get the whole game
    })
        .reduce((acc, nextLst) => acc.concat(nextLst), [])
        .slice(1)
}

export const getIIGOTrades = (data: OutputJSONType) => {
    const acc: Transaction[][] = []

    const totalAgents = numAgents(data)

    const TeamName: Record<string, number> = TeamNameGen(totalAgents)

    // Since IIGOHistories is repeated, take the one from the LAST GameState and
    // do Object.entries to make it iterable. List of array'ed tuples.
    const IIGOHistory = Object.entries(
        data.GameStates[data.GameStates.length - 1].IIGOHistory
    )
    // For each of these arrayed tuples, we have [turnNumber: <"pair events">[]]
    IIGOHistory.forEach(([turnNumber, exchanges]) => {
        if (exchanges) {
            const turnTrans: Transaction[] = []
            exchanges.forEach((teamAction) => {
                const type = teamAction.Pairs[0].VariableName
                let transaction: Transaction | undefined
                // There are three types of transactions
                // the target could be the client id depending on the type of team action
                // else accounts for SanctionPaid and IslandTaxContribution
                switch (type) {
                    case 'IslandAllocation':
                    case 'AllocationMade':
                        transaction = {
                            from: TeamName.CommonPool,
                            to: TeamName[teamAction.ClientID],
                            amount: teamAction.Pairs[0].Values[0],
                        }
                        break
                    case 'SpeakerPayment':
                        transaction = {
                            from: TeamName[teamAction.ClientID],
                            to:
                                TeamName[
                                    data.GameStates[Number(turnNumber)]
                                        .SpeakerID
                                ],
                            amount: teamAction.Pairs[0].Values[0],
                        }
                        break
                    case 'JudgePayment':
                        transaction = {
                            from: TeamName[teamAction.ClientID],
                            to:
                                TeamName[
                                    data.GameStates[Number(turnNumber)].JudgeID
                                ],
                            amount: teamAction.Pairs[0].Values[0],
                        }
                        break
                    case 'PresidentPayment':
                        transaction = {
                            from: TeamName[teamAction.ClientID],
                            to:
                                TeamName[
                                    data.GameStates[Number(turnNumber)]
                                        .PresidentID
                                ],
                            amount: teamAction.Pairs[0].Values[0],
                        }
                        break
                    case 'IslandTaxContribution':
                    case 'SanctionPaid':
                        transaction = {
                            from: TeamName[teamAction.ClientID],
                            to: TeamName.CommonPool,
                            amount: teamAction.Pairs[0].Values[0],
                        }
                        break
                    default:
                        transaction = undefined
                        break
                }
                if (transaction?.amount) turnTrans.push(transaction)
            })
            acc.push(turnTrans)
        }
    })
    return acc
}

export const processTrades = (data: OutputJSONType) => {
    const iito = getIITOTrades(data)
    // console.log(links)
    const iigo = getIIGOTrades(data)
    // console.log(ahh)
    return iito.map((trades, index) => {
        return trades.concat(iigo[index])
    })
    // console.log(totalTrades)
}

export const drawTrade = (
    allTrades: Transaction[][],
    day: number,
    p5: p5Types,
    islandLocations: Island[]
) => {
    const activeData = allTrades[day]
    activeData.map((trade) => {
        const fX = islandLocations[trade.from].X
        const fY = islandLocations[trade.from].Y
        const tX = islandLocations[trade.to].X
        const tY = islandLocations[trade.to].Y
        const thickness = p5.map(trade.amount, 0, 200, 1, 100)
        p5.strokeWeight(thickness)
        p5.stroke(0)
        return p5.line(fX, fY, tX, tY)
    })
}
