import os
import json
from termios import VMIN
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from argparse import ArgumentParser
from tqdm import tqdm
import time
import json
import seaborn as sn

iter = 10
totalIslands = 12
allSurv = True

def str2bool(v):
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    return False

def handle_JSON(input, n):
    daysSurvived = len(input['GameStates'])
    clientInfos = input['GameStates'][daysSurvived-1]['ClientInfos']
    # print(json.dumps(clientInfos, indent=4, separators=(". ", " = ")))
    remainingIslandsFilter = filter(lambda x: x["LifeStatus"] != "Dead", clientInfos.values())
    remainingIslands = len(list(remainingIslandsFilter))
    if daysSurvived < 51:
        return 0
    else:
        if remainingIslands < n:
            if allSurv:
                return 0
            return 1
        else:
            return 1


# ax.set_zlabel('Survival Probability (n=%d)' % iter)

def main():

    # islandPerformances = {}

    x_axis = ["none", "t", "f", "g", "t+f", "g+f", "t+g", "t+g+f"]
    y_axis = ["none", "CP", "T", "CP+T"]

    all_c_data = []
    for cert in tqdm(y_axis):
        c_data = []
        for mech in x_axis:
            totalScore = 0
            for _ in range(iter):
                os.system('go run . ' + str(totalIslands) + " " + mech + " " + cert)

                with open('./output/output.json') as OUTPUT_JSON:
                    DATA = json.load(OUTPUT_JSON)
                    totalScore += handle_JSON(DATA, totalIslands)
                
            totalScore /= iter
            c_data.append(totalScore)
        all_c_data.append(c_data)
    islandPerformances=pd.DataFrame(all_c_data, columns=x_axis)
    # print(islandPerformances)
    hmap = sn.heatmap(islandPerformances, yticklabels=y_axis, vmin=0.0, vmax=1.0, square=True, cbar_kws={'label': 'Survival Probability (n=%d)' % iter})
    hmap.set_xlabel('Organisations Active', fontsize=10)
    hmap.set_ylabel('Certainties', fontsize=10)
    plt.show()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-i", "--iterations", default=10, type=int, help="set total ITERATIONS for simulation (default 10)", metavar="ITERATIONS")
    parser.add_argument("-n", "--numIslands", default=12, type=int, help="set total number of ISLANDS for simulation (default 12)", metavar="ISLANDS")
    parser.add_argument("-a", "--allSurvive", default=True, type=str2bool, help="if true, all islands must survive for a successful simulation (default true)")
    args = parser.parse_args()
    iter = args.iterations
    totalIslands = args.numIslands
    allSurv = args.allSurvive
    main()