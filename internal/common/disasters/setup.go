package disasters

import (
	"math"
	"math/rand"

	"github.com/SOMAS2020/SOMAS2020/internal/common/config"
	"github.com/SOMAS2020/SOMAS2020/internal/common/shared"
)

// InitEnvironment initialises environment according to definitions
func InitEnvironment(islandIDs []shared.ClientID, envConf config.DisasterConfig) Environment {
	ag := ArchipelagoGeography{
		Islands: map[shared.ClientID]IslandLocationInfo{},
		XMin:    envConf.XMin,
		XMax:    envConf.XMax,
		YMin:    envConf.YMin,
		YMax:    envConf.YMax,
	}

	// xPoints := equidistantPoints(envConf.XMin, envConf.XMax, uint(len(islandIDs)))
	points := kulaRingGen(float64(len(islandIDs)), envConf.XMin, envConf.XMax, false)

	for i, id := range islandIDs {
		island := IslandLocationInfo{id, points[i].X, points[i].Y} // begin with equidistant points on x axis
		ag.Islands[id] = island
	}
	return Environment{Geography: ag, LastDisasterReport: DisasterReport{}}
}

// get n equally spaced points on a line connecting x0, x1
// func equidistantPoints(x0, x1 float64, n uint) (points []float64) {
// 	delta := (x1 - x0) / math.Max(float64(n-1), 1) // prevent /0 error
// 	for i := uint(0); i < n; i++ {
// 		points = append(points, delta*float64(i))
// 	}
// 	return points
// }

type coord struct {
	X float64
	Y float64
}

// generate ring of islands with variable radius
func kulaRingGen(n, boundLeft, boundRight float64, random bool) (points []coord) {
	var maxRad float64 = (boundRight - boundLeft) / 2
	var circIncrement float64 = 2 * math.Pi / n

	for i := float64(0); i < 2*math.Pi; i += circIncrement {
		if !random {
			points = append(points, coord{X: maxRad*math.Cos(i) + maxRad, Y: maxRad*math.Sin(i) + maxRad})
		} else {
			r := rand.Float64() * maxRad
			points = append(points, coord{X: r*math.Cos(i) + maxRad, Y: r*math.Sin(i) + maxRad})
		}
	}
	return points
}
