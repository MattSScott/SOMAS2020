// Package config contains types for the configuration of the game.
// DO NOT depend on other packages outside this folder!
// Add default values etc. in <root>/params.go
package config

import "github.com/SOMAS2020/SOMAS2020/internal/common/shared"

// Config is the type for the game configuration.
type Config struct {
	// MaxSeasons is the maximum number of 1-indexed seasons to run the game.
	MaxSeasons uint

	// MaxTurns is the maximum numbers of 1-indexed turns to run the game.
	MaxTurns uint

	// InitialResources is the default number of resources at the start of the game.
	InitialResources shared.Resources

	// CostOfLiving is subtracted from an islands pool before
	// the next turn. This is the simulation-level equivalent to using resources to stay
	// alive (e.g. food consumed). These resources are permanently consumed and do
	// NOT go into the common pool. Note: this is NOT the same as the tax.
	CostOfLiving shared.Resources

	// MinimumResourceThreshold is the minimum resources required for an island to not be
	// in Critical state.
	MinimumResourceThreshold shared.Resources

	// MaxCriticalConsecutiveTurns is the maximum consecutive turns an island can be in the critical state.
	MaxCriticalConsecutiveTurns uint

	// Wrapped foraging config
	ForagingConfig ForagingConfig

	// Wrapped disaster config
	DisasterConfig DisasterConfig
}

// DeerHuntConfig is a subset of foraging config
type DeerHuntConfig struct {
	// Deer Hunting
	MaxDeerPerHunt        uint                                // Max possible number of deer on a single hunt (regardless of number of participants)
	IncrementalInputDecay float64                             // Determines decay of incremental input cost of hunting more deer
	BernoulliProb         float64                             // `p` param in D variable (see README). Controls prob of catching a deer or not
	ExponentialRate       float64                             // `lambda` param in W variable (see README). Controls distribution of deer sizes.
	ResourceMultiplier    float64                             // scalar value that adjusts returns to be in a range that is commensurate with cost of living, salaries etc.
	DistributionStrategy  shared.ResourceDistributionStrategy // basis on which returns are split amongst hunters

	// Deer Population
	MaxDeerPopulation     uint    // Max possible deer population.
	DeerGrowthCoefficient float64 // Scaling parameter used in the population model. Larger coeff => deer pop. regenerates faster
}

// FishingConfig is a subset of foraging config
type FishingConfig struct {
	// Fishing
	MaxFishPerHunt        uint                                // Max possible number of fish on a single fishing expedition
	IncrementalInputDecay float64                             // Determines decay of incremental input cost of catching additional fish
	Mean                  float64                             // mean of normally distributed fish size
	Variance              float64                             // variance of normally distributed fish size
	ResourceMultiplier    float64                             // scalar value that adjusts returns to be in a range that is commensurate with cost of living, salaries etc.
	DistributionStrategy  shared.ResourceDistributionStrategy // basis on which returns are split amongst fishermen

}

// DisasterConfig captures disaster-specific config
type DisasterConfig struct {
	XMin, XMax, YMin, YMax shared.Coordinate     // [min, max] x,y bounds of archipelago (bounds for possible disaster)
	GlobalProb             float64               // Bernoulli 'p' param. Chance of a disaster occurring
	SpatialPDFType         shared.SpatialPDFType // Set x,y prob. distribution of the disaster's epicentre (more post MVP)
	MagnitudeLambda        float64               // Exponential rate param for disaster magnitude
}

// ForagingConfig captures foraging-specific config
type ForagingConfig struct {
	DeerHuntConfig DeerHuntConfig
	FishingConfig  FishingConfig
}

// GameConfig returns the configuration of the game.
// (Made a function so it cannot be altered mid-game).
func GameConfig() Config {
	deerConf := DeerHuntConfig{
		//Deer parameters
		MaxDeerPerHunt:        4,
		IncrementalInputDecay: 0.8,
		BernoulliProb:         0.95,
		ExponentialRate:       1,
		DistributionStrategy:  shared.InputProportionalSplit,

		MaxDeerPopulation:     12,
		DeerGrowthCoefficient: 0.4,
	}
	fishingConf := FishingConfig{
		// Fish parameters
		MaxFishPerHunt:        6,
		IncrementalInputDecay: 0.8,
		Mean:                  0.9,
		Variance:              0.2,
		DistributionStrategy:  shared.InputProportionalSplit,
	}
	foragingConf := ForagingConfig{
		DeerHuntConfig: deerConf,
		FishingConfig:  fishingConf,
	}
	disasterConf := DisasterConfig{
		XMin:            0.0,
		XMax:            10.0, // chosen quite arbitrarily for now
		YMin:            0.0,
		YMax:            10.0,
		GlobalProb:      0.1,
		SpatialPDFType:  shared.Uniform,
		MagnitudeLambda: 1.0,
	}

	return Config{
		MaxSeasons:                  100,
		MaxTurns:                    2,
		InitialResources:            100,
		CostOfLiving:                10,
		MinimumResourceThreshold:    5,
		MaxCriticalConsecutiveTurns: 3,
		ForagingConfig:              foragingConf,
		DisasterConfig:              disasterConf,
	}
}
