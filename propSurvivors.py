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

def handle_JSON(input):
    daysSurvived = len(input['GameStates'])
    clientInfos = input['GameStates'][daysSurvived-1]['ClientInfos']
    # print(json.dumps(clientInfos, indent=4, separators=(". ", " = ")))
    remainingIslandsFilter = filter(lambda x: x["LifeStatus"] != "Dead", clientInfos.values())
    remainingIslands = len(list(remainingIslandsFilter))
    return remainingIslands


# ax.set_zlabel('Survival Probability (n=%d)' % iter)

def main():

    x_axis = ["none", "t", "f", "g", "t+f", "g+f", "t+g", "t+g+f"]
    y_axis = []

    for mech in tqdm(x_axis):
        avgSurvivors = 0
        for _ in range(iter):
            os.system('go run . ' + str(totalIslands) + " " + mech + " CP+T")

            with open('./output/output.json') as OUTPUT_JSON:
                DATA = json.load(OUTPUT_JSON)
                avgSurvivors += handle_JSON(DATA)
            
        avgSurvivors /= iter
        avgSurvivors /= totalIslands
        y_axis.append(avgSurvivors)

    plt.plot(x_axis, y_axis)
    ax = plt.gca()
    ax.set_ylim([0.0, 1.0])
    plt.xlabel('Organisations Active')
    plt.ylabel('Mean Proportion of Islands Remaining (n=%d)' % iter)
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