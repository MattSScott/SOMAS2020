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

def handle_JSON(input):
    daysSurvived = len(input['GameStates'])
    clientInfos = input['GameStates'][daysSurvived-1]['ClientInfos']
    # print(json.dumps(clientInfos, indent=4, separators=(". ", " = ")))
    remainingIslandsFilter = filter(lambda x: x["LifeStatus"] != "Dead", clientInfos.values())
    remainingIslands = len(list(remainingIslandsFilter))
    return remainingIslands

def main():
    print('go run . ' + str(3) + " " + 'none' + " CP+T")
    with open('./output/output.json') as OUTPUT_JSON:
        DATA = json.load(OUTPUT_JSON)
        print(handle_JSON(DATA))

if __name__ == "__main__":
    main()