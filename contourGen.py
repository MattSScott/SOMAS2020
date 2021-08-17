import os
import json
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from argparse import ArgumentParser
import json

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

def plot3d(eg):
    # thickness of the bars
    dx, dy = .8, .8

    # prepare 3d axes
    fig = plt.figure(figsize=(10,6))
    ax = Axes3D(fig, auto_add_to_figure=False)
    fig.add_axes(ax)

    # set up positions for the bars 
    xpos=np.arange(eg.shape[1])
    ypos=np.arange(eg.shape[0])

    # set the ticks in the middle of the bars
    ax.set_xticks(xpos + dx/2)
    ax.set_yticks(ypos + dy/2)

    # create meshgrid 
    # print xpos before and after this block if not clear
    xpos, ypos = np.meshgrid(xpos, ypos)
    xpos = xpos.flatten()
    ypos = ypos.flatten()

    # the bars starts from 0 attitude
    zpos=np.zeros(eg.shape).flatten()

    # the bars' heights
    dz = eg.values.ravel()

    # plot 
    ax.bar3d(xpos,ypos,zpos,dx,dy,dz)

    # put the column / index labels
    ax.w_xaxis.set_ticklabels(eg.columns)
    ax.w_yaxis.set_ticklabels(eg.index)

    # name the axes
    ax.set_ylabel('Organisations Active')
    ax.set_xlabel('Number of Initial Islands')
    ax.set_zlabel('Survival Probability (n=%d)' % iter)

def main():

    islandPerformances = {}

    for i in range(totalIslands): # up to n islands
        island = {}
        for j in ["none", "t", "g", "f", "t+g", "t+f", "g+f", "t+g+f"]:

            totalScore = 0
            for _ in range(iter): # average over iter iterations

                os.system('go run . ' + str(i+1) + " " + j)

                with open('./output/output.json') as OUTPUT_JSON:
                    DATA = json.load(OUTPUT_JSON)
                    totalScore += handle_JSON(DATA, i+1)
            
            totalScore /= iter
            island[j] = round(totalScore,1)
        islandPerformances[i+1] = island

    plotter = pd.DataFrame(islandPerformances)
    plot3d(plotter)
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