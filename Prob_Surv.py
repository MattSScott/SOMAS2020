import os
import json
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from mpl_toolkits.mplot3d import Axes3D

iter = 30
totalIslands = 12

def handle_JSON(input, n):
    daysSurvived = len(input['GameStates'])
    remainingIslands = len(input['GameStates'][daysSurvived-1]['RulesInfo']['VariableMap']['IslandsAlive']['Values'])
    if daysSurvived < 51:
        return 0
    else:
        if remainingIslands < n:
            return 0
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
    main()


# all params = {1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0, 11: 0.9, 12: 0.6, 13: 0.4, 14: 0.2, 15: 0.0}