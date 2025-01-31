import { OutputJSONType } from '../../../../consts/types'
import { ProcessedRoleData, TeamAndTurns } from './RoleTypes'

const standardise = (data: ProcessedRoleData): ProcessedRoleData => {
    const { totalAgents } = data[0].occupied[0]

    const maxLength = data.reduce(
        (max, curr) =>
            curr.occupied.length > max ? curr.occupied.length : max,
        0
    )

    return data.map((elem) => {
        const { length } = elem.occupied
        for (let i = 0; i < maxLength - length; i++) {
            elem.occupied.push(new TeamAndTurns(totalAgents))
        }
        return elem
    })
}

const increment = (
    occupied: TeamAndTurns[],
    team: string,
    allAgents: number
): TeamAndTurns[] => {
    if (occupied.length > 0 && occupied[occupied.length - 1].has(team)) {
        occupied[occupied.length - 1].increment(team)
    } else {
        const teamAndTurns = new TeamAndTurns(allAgents)
        teamAndTurns.set(team, 1)
        occupied.push(teamAndTurns)
    }
    return occupied
}

export const processRoleData = (data: OutputJSONType): ProcessedRoleData => {
    const allAgents = data.AuxInfo.TeamIDs.length
    if (data.GameStates.length <= 1) return []
    const retData: ProcessedRoleData = [
        {
            role: 'Pres',
            occupied: [],
        },
        {
            role: 'Judge',
            occupied: [],
        },
        {
            role: 'Speaker',
            occupied: [],
        },
    ]

    return standardise(
        retData.map((elem) => {
            elem.occupied = data.GameStates.slice(0, -1).reduce(
                (acc, gameState, index) => {
                    // taking index+1 because the IIGO status is only reported the next turn
                    const DidntRun = data.GameStates[
                        index + 1
                    ].IIGORunStatus.includes('broadcastTaxation')
                    switch (elem.role) {
                        case 'Pres': {
                            elem.occupied = increment(
                                elem.occupied,
                                DidntRun ? 'NotRun' : gameState.PresidentID,
                                allAgents
                            )
                            break
                        }
                        case 'Judge': {
                            elem.occupied = increment(
                                elem.occupied,
                                DidntRun ? 'NotRun' : gameState.JudgeID,
                                allAgents
                            )
                            break
                        }
                        case 'Speaker': {
                            elem.occupied = increment(
                                elem.occupied,
                                DidntRun ? 'NotRun' : gameState.SpeakerID,
                                allAgents
                            )
                            break
                        }
                        default:
                            break
                    }
                    return acc
                },
                elem.occupied
            )
            return elem
        })
    )
}
export default processRoleData
