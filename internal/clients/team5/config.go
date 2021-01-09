package team5

import "github.com/SOMAS2020/SOMAS2020/internal/common/shared"

// define config structure here
type clientConfig struct {

	// ==================== Foraging ====================
	// Initial non planned foraging
	InitialForageTurns      uint
	MinimumForagePercentage float64
	NormalForagePercentage  float64
	JBForagePercentage      float64

	// Deciding Foraging Method
	RandomChanceToFish           float64
	RandomChanceToHunt           float64
	IncreasePerHunterLastTurn    float64 // % increase per Hunter last turn
	IncreasePerFisherMenLastTurn float64 // % increase per Fisherman last turn
	DeerTurnsToLookBack          uint    // Find hunters in LB turns (not includding previous)
	DecreasePerHunterInLookBack  float64 // % decrease per hunter in past LB turns

	// NormalForage
	SkipForage          uint // Skip for X turns if no positive RoI
	NormalRandomChange  float64
	MaxForagePercentage float64

	//==================== Thresholds ====================
	// Thresholds for the amount of money we have
	jbThreshold       shared.Resources // If resources go above this limit we are balling with money
	middleThreshold   shared.Resources // Middle class:  Middle < Jeff bezos
	imperialThreshold shared.Resources // Poor: Imperial student < Middle
	// Below Imperial == dying = close to critical

	//================================ Gifts ====================
	// Amounts for gifts
	dyingGiftRequestAmount    float64 // How much to request when we are dying
	imperialGiftRequestAmount float64 // How much to request when we are at Imperial
	middleGiftRequestAmount   float64 // How much to request when we are dying
	offertoDyingIslands       float64 // How much to give to islands dying 1/3 when we are poor
	normalGift                float64

	//Gift modifiers for opinions
	opinionRequestMultiplier float64
	opinionThresholdRequest  opinionScore
	giftBoosting             shared.Resources
	giftReduct               shared.Resources

	//==================== Disasters and IIFO ====================
	forecastTrustTreshold   opinionScore // min opinion score of another team to consider their forecast in creating ours
	maxForecastVariance     float64      // maximum tolerable variance in historical forecast values
	forecastParamWeights    map[forecastVariable]float64
	forecastVarianceScalers map[forecastVariable]float64
}

// set param values here. In order to add a new value, you need to add a definition in struct above.
func getClientConfig() clientConfig {
	return clientConfig{
		//Variables for initial forage
		InitialForageTurns:      3,
		MinimumForagePercentage: 0.10,
		NormalForagePercentage:  0.20,
		JBForagePercentage:      0.30, // % of our resources when JB is Normal< X < JB

		// Deciding foraging type
		RandomChanceToFish:           0.1, // Chacne to switch to Hunting/Fishing
		RandomChanceToHunt:           0.1,
		IncreasePerHunterLastTurn:    0.10, // % increase for each Hunter
		IncreasePerFisherMenLastTurn: 0.00, // % incrase for each Fisher
		DeerTurnsToLookBack:          3,    // Number of turns to look back at for deer (not including last)
		DecreasePerHunterInLookBack:  0.03, // lower for less emphasis on looking at previous turn hunters (MAX 0.07 will skip if 6 hunters in 5 turns)

		// Normal Forage
		SkipForage:          1,
		NormalRandomChange:  0.05,
		MaxForagePercentage: 0.30,

		// Threshold for wealth as multiplier
		jbThreshold:       2.0,
		middleThreshold:   1.0,
		imperialThreshold: 0.3, // surely should be - 100e6? (your right we are so far indebt)
		//  Dying threshold is 0 < Dying < Imperial

		// Gifts Config
		dyingGiftRequestAmount:    25,
		imperialGiftRequestAmount: 15,
		middleGiftRequestAmount:   5,
		offertoDyingIslands:       15,
		normalGift:                1,

		opinionThresholdRequest:  0.5, // Above opinion we request less this people
		opinionRequestMultiplier: 0.5, // We request half as much above this threshold
		giftBoosting:             1.4,
		giftReduct:               0.5,

		// Disasters and IIFO
		forecastTrustTreshold: 0.0, // neutral opinion
		maxForecastVariance:   100.0,
		forecastParamWeights: map[forecastVariable]float64{
			period:    1.3,
			magnitude: 1.0,
			x:         0.7,
			y:         0.7,
		},
		forecastVarianceScalers: map[forecastVariable]float64{ // control variance thresholds. Values control max acceptable variance = value * mean.
			period:    0.8,
			magnitude: 0.8,
			x:         1.0,
			y:         1.0,
		},
	}
}
